from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import json
from datetime import datetime, timedelta

from api import deps
from core import ai, payment as payment_core
from core.config import settings
from db.session import get_db
from models.user import User
from models.lawyer import Lawyer
from models.booking import Booking
from schemas.booking import BookingCreate, BookingDraft, Booking as BookingSchema
from schemas.payment import PaymentResponse

# Using Redis for drafts (Mocking if Redis is not fully set up directly in code, but assuming dependency)
from redis import asyncio as aioredis

router = APIRouter()

# Redis connection
redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

@router.post("/create", response_model=BookingDraft)
async def create_booking_draft(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    booking_in: BookingCreate
) -> Any:
    """
    Step 1: Create a booking draft with AI summary.
    """
    # Verify lawyer exists
    lawyer = await db.get(Lawyer, booking_in.lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    # Generate AI Summary
    ai_summary = await ai.generate_case_summary(booking_in.case_description)
    
    # Store draft in Redis
    draft_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    draft_data = {
        "user_id": str(current_user.id),
        "lawyer_id": str(lawyer.id),
        "lawyer_name": lawyer.user.full_name, # Assuming relations logic
        "court_id": str(booking_in.court_id) if booking_in.court_id else None,
        "police_station_id": str(booking_in.police_station_id) if booking_in.police_station_id else None,
        "original_description": booking_in.case_description,
        "ai_summary": ai_summary,
        "consultation_fee": lawyer.consultation_fee,
        "preferred_time": booking_in.preferred_time.isoformat() if booking_in.preferred_time else None,
        "expires_at": expires_at.isoformat()
    }
    
    await redis.setex(f"booking_draft:{draft_id}", 900, json.dumps(draft_data))
    
    return {
        "booking_draft_id": draft_id,
        "original_description": booking_in.case_description,
        "ai_summary": ai_summary,
        "lawyer_name": lawyer.user.full_name if lawyer.user else "Lawyer Name", # Need eager load usually
        "consultation_fee": lawyer.consultation_fee,
        "expires_at": expires_at
    }

@router.post("/confirm", response_model=PaymentResponse)
async def confirm_booking(
    *,
    booking_draft_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Step 2: Confirm draft and initiate payment.
    """
    # Fetch draft
    draft_json = await redis.get(f"booking_draft:{booking_draft_id}")
    if not draft_json:
        raise HTTPException(status_code=404, detail="Booking draft expired or invalid")
    
    draft = json.loads(draft_json)
    if draft["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Calculate fees (in paise)
    consultation_fee = int(draft["consultation_fee"]) * 100
    
    # Create Razorpay Order
    order_data = payment_core.create_order(amount=consultation_fee, notes={"draft_id": booking_draft_id})
    
    # Create Booking record (status: pending_payment) - Optional, or wait for verification
    # Getting booking_id early is better for tracking
    
    booking_id = str(uuid.uuid4()) # We will insert this on payment success or now? 
    # Let's wait for payment verification to create actual booking to avoid junk
    # Or creating it now allows mapping order to booking
    
    # Strategy: Pass draft_id and order_id to client. Client pays. Client calls verify.
    # Verify endpoint retrieves draft again and creates booking.
    
    # We update redis with order_id to link them logic
    draft["razorpay_order_id"] = order_data["id"]
    await redis.setex(f"booking_draft:{booking_draft_id}", 900, json.dumps(draft))
    
    # Store mapping for verification
    await redis.setex(f"order_draft:{order_data['id']}", 900, booking_draft_id)

    return {
        "booking_id": "pending", # Not created yet
        "razorpay_order_id": order_data["id"],
        "amount": consultation_fee,
        "currency": "INR",
        "razorpay_key_id": settings.RAZORPAY_KEY_ID
    }
    
@router.post("/regenerate-summary", response_model=BookingDraft)
async def regenerate_summary(
    booking_draft_id: str,
    updated_description: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Regenerate AI summary for a draft.
    """
    draft_json = await redis.get(f"booking_draft:{booking_draft_id}")
    if not draft_json:
        raise HTTPException(status_code=404, detail="Draft expired")
        
    draft = json.loads(draft_json)
    if draft["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    ai_summary = await ai.generate_case_summary(updated_description)
    
    draft["original_description"] = updated_description
    draft["ai_summary"] = ai_summary
    
    await redis.setex(f"booking_draft:{booking_draft_id}", 900, json.dumps(draft))
    
    return {
        "booking_draft_id": booking_draft_id,
        "original_description": updated_description,
        "ai_summary": ai_summary,
        "lawyer_name": draft["lawyer_name"],
        "consultation_fee": draft["consultation_fee"],
        "expires_at": draft["expires_at"]
    }

@router.get("/", response_model=list[BookingSchema])
async def read_bookings(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    status: str | None = None
) -> Any:
    """
    Retrieve bookings. 
    Users see their own bookings.
    Lawyers see bookings where they are the lawyer.
    """
    if current_user.user_type == "lawyer":
        # First get the lawyer profile id
        # Assuming eager loaded or we query
        # For optimization we rely on lazy load or separate query if needed, 
        # but User model has backref 'lawyer_profile'
        # Since relation is list (one-to-many? No, usually one-to-one but defined as list in backref sometimes, let's check model)
        # Lawyer model: user_id unique=True.
        # Check if lawyer profile exists
        query = select(Lawyer).where(Lawyer.user_id == current_user.id)
        result = await db.execute(query)
        lawyer = result.scalar_one_or_none()
        
        if not lawyer:
            return [] # Or raise error
            
        stmt = select(Booking).where(Booking.lawyer_id == lawyer.id)
    else:
        stmt = select(Booking).where(Booking.user_id == current_user.id)
        
    if status:
        stmt = stmt.where(Booking.status == status)
        
    stmt = stmt.offset(skip).limit(limit).order_by(Booking.created_at.desc())
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    return bookings

@router.get("/{booking_id}", response_model=BookingSchema)
async def read_booking(
    *,
    db: AsyncSession = Depends(deps.get_db),
    booking_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get booking by ID.
    """
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Permission check
    is_owner = booking.user_id == current_user.id
    
    # Check if lawyer
    is_lawyer = False
    if current_user.user_type == "lawyer":
        query = select(Lawyer).where(Lawyer.user_id == current_user.id)
        result = await db.execute(query)
        lawyer_profile = result.scalar_one_or_none()
        if lawyer_profile and lawyer_profile.id == booking.lawyer_id:
            is_lawyer = True
            
    if not (is_owner or is_lawyer or current_user.is_superuser):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return booking

@router.patch("/{booking_id}/status", response_model=BookingSchema)
async def update_booking_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    booking_id: uuid.UUID,
    status_in: str, # accepted, rejected, cancelled
    reason: str | None = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update booking status (Lawyer: accept/reject, User: cancel).
    """
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Lawyer Actions
    if current_user.user_type == "lawyer":
        query = select(Lawyer).where(Lawyer.user_id == current_user.id)
        result = await db.execute(query)
        lawyer_profile = result.scalar_one_or_none()
        
        if not lawyer_profile or lawyer_profile.id != booking.lawyer_id:
             raise HTTPException(status_code=403, detail="Not authorized")
             
        if status_in not in ["accepted", "rejected", "rescheduled"]:
            raise HTTPException(status_code=400, detail="Invalid status for lawyer")
            
        booking.status = status_in
        if reason:
            booking.cancellation_reason = reason # Using this field for notes generically for now
            
    # User Actions
    elif current_user.id == booking.user_id:
        if status_in not in ["cancelled"]:
             raise HTTPException(status_code=400, detail="User can only cancel")
        
        # Can only cancel if pending or accepted?
        if booking.status == "completed":
             raise HTTPException(status_code=400, detail="Cannot cancel completed booking")
             
        booking.status = "cancelled"
        if reason:
            booking.cancellation_reason = reason
            
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    # TODO: Trigger Notifications
    
    return booking
