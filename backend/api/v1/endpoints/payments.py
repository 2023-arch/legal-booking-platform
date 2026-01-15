from typing import Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import json
import uuid

from api import deps
from core import payment as payment_core
from core.config import settings
from db.session import get_db
from models.booking import Booking, BookingHistory
from models.payment import Payment, Escrow
from models.user import User
from schemas.payment import PaymentVerify

# Using Redis
from redis import asyncio as aioredis

router = APIRouter()
redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

@router.post("/verify")
async def verify_payment(
    *,
    payment_in: PaymentVerify,
    db: AsyncSession = Depends(deps.get_db),
    # current_user: User = Depends(deps.get_current_user) # Payment callback might be public or user-initiated
):
    """
    Verify Razorpay payment and commit booking.
    """
    # 1. Verify Signature
    if not payment_core.verify_signature(
        payment_in.razorpay_order_id, 
        payment_in.razorpay_payment_id, 
        payment_in.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 2. Retrieve Draft
    draft_id = await redis.get(f"order_draft:{payment_in.razorpay_order_id}")
    if not draft_id:
         # Fallback: Check if payment already recorded?
         # For now error
         raise HTTPException(status_code=400, detail="Order not found or expired")
    
    draft_json = await redis.get(f"booking_draft:{draft_id}")
    if not draft_json:
        raise HTTPException(status_code=400, detail="Booking details expired")
        
    draft = json.loads(draft_json)
    
    # 3. Create DB Records
    # Booking
    booking_id = uuid.uuid4()
    
    # Check strict null in draft for UUID fields
    court_id = uuid.UUID(draft['court_id']) if draft.get('court_id') else None
    police_id = uuid.UUID(draft['police_station_id']) if draft.get('police_station_id') else None
    preferred_time = None
    if draft.get('preferred_time'):
         from datetime import datetime
         preferred_time = datetime.fromisoformat(draft['preferred_time'])

    consultation_fee = int(draft['consultation_fee']) # in rupees from draft usually
    platform_commission = int(consultation_fee * 0.10)
    lawyer_payout = consultation_fee - platform_commission

    booking = Booking(
        id=booking_id,
        user_id=uuid.UUID(draft['user_id']),
        lawyer_id=uuid.UUID(draft['lawyer_id']),
        court_id=court_id,
        police_station_id=police_id,
        status='pending', # Waiting for lawyer acceptance
        original_description=draft['original_description'],
        ai_summary=draft['ai_summary'],
        consultation_fee=consultation_fee,
        platform_commission=platform_commission,
        lawyer_payout=lawyer_payout,
        scheduled_time=preferred_time
    )
    db.add(booking)
    
    # Payment
    payment = Payment(
        booking_id=booking_id,
        amount=consultation_fee * 100, # Paise
        status='captured',
        razorpay_order_id=payment_in.razorpay_order_id,
        razorpay_payment_id=payment_in.razorpay_payment_id,
        razorpay_signature=payment_in.razorpay_signature
    )
    # Set captured_at
    from datetime import datetime
    payment.captured_at = datetime.utcnow()
    
    db.add(payment)
    
    # Escrow
    escrow = Escrow(
        booking_id=booking_id,
        amount=consultation_fee * 100
    )
    db.add(escrow)
    
    # History
    history = BookingHistory(
        booking_id=booking_id,
        status='created',
        notes='Booking created and payment verified'
    )
    db.add(history)
    
    await db.commit()
    
    # 4. Cleanup Redis
    await redis.delete(f"booking_draft:{draft_id}")
    await redis.delete(f"order_draft:{payment_in.razorpay_order_id}")
    
    # 5. Notify Lawyer (TODO background task)
    
    return {"success": True, "booking_id": str(booking_id)}
