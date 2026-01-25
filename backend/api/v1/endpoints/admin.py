"""
Admin API Endpoints
===================
Secure admin panel for company use only.
Uses hardcoded company credentials stored in environment variables.
"""

from datetime import datetime, timedelta
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from jose import jwt

from api import deps
from core.config import settings
from models.lawyer import Lawyer
from models.user import User
from schemas.lawyer import Lawyer as LawyerSchema

router = APIRouter()


# =============================================================================
# SCHEMAS
# =============================================================================

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LawyerVerificationAction(BaseModel):
    action: str  # "approve" or "reject"
    reason: Optional[str] = None


class DashboardStats(BaseModel):
    total_users: int
    total_lawyers: int
    pending_verifications: int
    verified_lawyers: int
    rejected_lawyers: int


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_admin_token(username: str) -> str:
    """Create JWT token for admin with separate secret key."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ADMIN_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire, 
        "sub": username, 
        "type": "admin",
        "iat": datetime.utcnow()
    }
    # Use admin-specific secret key
    secret = settings.ADMIN_SECRET_KEY or settings.SECRET_KEY
    return jwt.encode(to_encode, secret, algorithm=settings.ALGORITHM)


def verify_admin_token(token: str) -> dict:
    """Verify admin JWT token."""
    try:
        secret = settings.ADMIN_SECRET_KEY or settings.SECRET_KEY
        payload = jwt.decode(token, secret, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Invalid admin token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Admin session expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid admin token")


async def get_current_admin(
    authorization: str = Depends(deps.get_authorization_header)
) -> dict:
    """Dependency to verify admin authentication."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    token = authorization.replace("Bearer ", "")
    return verify_admin_token(token)


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/login", response_model=AdminToken)
async def admin_login(login_data: AdminLoginRequest) -> Any:
    """
    Admin login with company credentials.
    Credentials are stored in environment variables for security.
    """
    # Check if admin credentials are configured
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=503, 
            detail="Admin panel not configured. Contact system administrator."
        )
    
    # Verify credentials
    if (login_data.username != settings.ADMIN_USERNAME or 
        login_data.password != settings.ADMIN_PASSWORD):
        raise HTTPException(
            status_code=401, 
            detail="Invalid admin credentials"
        )
    
    # Generate admin token
    token = create_admin_token(login_data.username)
    
    return {"access_token": token, "token_type": "bearer"}


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get admin dashboard statistics."""
    
    # Total users
    total_users = await db.scalar(select(func.count(User.id)))
    
    # Total lawyers
    total_lawyers = await db.scalar(select(func.count(Lawyer.id)))
    
    # Pending verifications
    pending = await db.scalar(
        select(func.count(Lawyer.id)).where(
            Lawyer.verification_status == "pending_verification"
        )
    )
    
    # Verified lawyers
    verified = await db.scalar(
        select(func.count(Lawyer.id)).where(
            Lawyer.verification_status == "verified"
        )
    )
    
    # Rejected lawyers
    rejected = await db.scalar(
        select(func.count(Lawyer.id)).where(
            Lawyer.verification_status == "rejected"
        )
    )
    
    return DashboardStats(
        total_users=total_users or 0,
        total_lawyers=total_lawyers or 0,
        pending_verifications=pending or 0,
        verified_lawyers=verified or 0,
        rejected_lawyers=rejected or 0
    )


@router.get("/lawyers/pending")
async def get_pending_lawyers(
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get all lawyers pending verification."""
    
    query = (
        select(Lawyer)
        .where(Lawyer.verification_status == "pending_verification")
        .order_by(Lawyer.created_at.desc())
    )
    result = await db.execute(query)
    lawyers = result.scalars().all()
    
    # Return with user info
    pending_list = []
    for lawyer in lawyers:
        # Get associated user
        user = await db.get(User, lawyer.user_id)
        
        pending_list.append({
            "id": str(lawyer.id),
            "user_id": str(lawyer.user_id),
            "full_name": user.full_name if user else "Unknown",
            "email": user.email if user else "Unknown",
            "phone": user.phone if user else "Unknown",
            "bar_council_number": lawyer.bar_council_number,
            "years_experience": lawyer.years_experience,
            "bio": lawyer.bio,
            "consultation_fee": lawyer.consultation_fee,
            "languages": lawyer.languages,
            "bar_council_certificate_url": lawyer.bar_council_certificate_url,
            "id_proof_url": lawyer.id_proof_url,
            "profile_photo_url": lawyer.profile_photo_url,
            "created_at": lawyer.created_at.isoformat() if lawyer.created_at else None,
        })
    
    return pending_list


@router.get("/lawyers/all")
async def get_all_lawyers(
    status: Optional[str] = Query(None, regex="^(pending_verification|verified|rejected)$"),
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get all lawyers, optionally filtered by status."""
    
    query = select(Lawyer).order_by(Lawyer.created_at.desc())
    
    if status:
        query = query.where(Lawyer.verification_status == status)
    
    result = await db.execute(query)
    lawyers = result.scalars().all()
    
    lawyers_list = []
    for lawyer in lawyers:
        user = await db.get(User, lawyer.user_id)
        
        lawyers_list.append({
            "id": str(lawyer.id),
            "user_id": str(lawyer.user_id),
            "full_name": user.full_name if user else "Unknown",
            "email": user.email if user else "Unknown",
            "bar_council_number": lawyer.bar_council_number,
            "verification_status": lawyer.verification_status,
            "rejection_reason": lawyer.rejection_reason,
            "verified_at": lawyer.verified_at.isoformat() if lawyer.verified_at else None,
            "created_at": lawyer.created_at.isoformat() if lawyer.created_at else None,
        })
    
    return lawyers_list


@router.get("/lawyers/{lawyer_id}")
async def get_lawyer_detail(
    lawyer_id: str,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get detailed lawyer information for review."""
    
    lawyer = await db.get(Lawyer, lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    user = await db.get(User, lawyer.user_id)
    
    return {
        "id": str(lawyer.id),
        "user_id": str(lawyer.user_id),
        "full_name": user.full_name if user else "Unknown",
        "email": user.email if user else "Unknown",
        "phone": user.phone if user else "Unknown",
        "bar_council_number": lawyer.bar_council_number,
        "years_experience": lawyer.years_experience,
        "education": lawyer.education,
        "bio": lawyer.bio,
        "languages": lawyer.languages,
        "consultation_fee": lawyer.consultation_fee,
        "verification_status": lawyer.verification_status,
        "rejection_reason": lawyer.rejection_reason,
        "bar_council_certificate_url": lawyer.bar_council_certificate_url,
        "id_proof_url": lawyer.id_proof_url,
        "profile_photo_url": lawyer.profile_photo_url,
        "verified_at": lawyer.verified_at.isoformat() if lawyer.verified_at else None,
        "created_at": lawyer.created_at.isoformat() if lawyer.created_at else None,
    }


@router.post("/lawyers/{lawyer_id}/verify")
async def verify_lawyer(
    lawyer_id: str,
    verification: LawyerVerificationAction,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Approve or reject a lawyer registration."""
    
    if verification.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    lawyer = await db.get(Lawyer, lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    user = await db.get(User, lawyer.user_id)
    
    if verification.action == "approve":
        lawyer.verification_status = "verified"
        lawyer.verified_at = datetime.utcnow()
        lawyer.rejection_reason = None
        
        # Update user verification status
        if user:
            user.is_verified = True
            
        message = "Lawyer approved successfully"
        
    else:  # reject
        if not verification.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
            
        lawyer.verification_status = "rejected"
        lawyer.rejection_reason = verification.reason
        lawyer.verified_at = None
        
        if user:
            user.is_verified = False
            
        message = "Lawyer rejected"
    
    await db.commit()
    
    return {
        "success": True,
        "message": message,
        "lawyer_id": str(lawyer.id),
        "new_status": lawyer.verification_status
    }


# =============================================================================
# USERS MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/users")
async def get_all_users(
    user_type: Optional[str] = Query(None, regex="^(user|lawyer|admin)$"),
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get all users with optional filters."""
    
    query = select(User).order_by(User.created_at.desc())
    
    if user_type:
        query = query.where(User.user_type == user_type)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (User.email.ilike(search_pattern)) |
            (User.full_name.ilike(search_pattern)) |
            (User.phone.ilike(search_pattern))
        )
    
    # Get total count
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "total": total or 0,
        "limit": limit,
        "offset": offset,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "phone": u.phone,
                "user_type": u.user_type,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get detailed user information."""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get lawyer profile if exists
    lawyer_query = select(Lawyer).where(Lawyer.user_id == user_id)
    result = await db.execute(lawyer_query)
    lawyer = result.scalar_one_or_none()
    
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "user_type": user.user_type,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_superuser": user.is_superuser,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "lawyer_profile": {
            "id": str(lawyer.id),
            "bar_council_number": lawyer.bar_council_number,
            "verification_status": lawyer.verification_status,
        } if lawyer else None
    }


@router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Activate or deactivate a user."""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    await db.commit()
    
    return {
        "success": True,
        "user_id": str(user.id),
        "is_active": user.is_active,
        "message": f"User {'activated' if user.is_active else 'deactivated'}"
    }


# =============================================================================
# BOOKINGS MANAGEMENT ENDPOINTS
# =============================================================================

# Import Booking model
from models.booking import Booking
from models.payment import Payment

@router.get("/bookings")
async def get_all_bookings(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get all bookings with optional status filter."""
    
    query = select(Booking).order_by(Booking.created_at.desc())
    
    if status:
        query = query.where(Booking.status == status)
    
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    bookings_list = []
    for b in bookings:
        # Get user and lawyer details
        user = await db.get(User, b.user_id)
        lawyer_query = select(Lawyer).where(Lawyer.id == b.lawyer_id)
        lawyer_result = await db.execute(lawyer_query)
        lawyer = lawyer_result.scalar_one_or_none()
        lawyer_user = await db.get(User, lawyer.user_id) if lawyer else None
        
        bookings_list.append({
            "id": str(b.id),
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "lawyer_name": lawyer_user.full_name if lawyer_user else "Unknown",
            "status": b.status,
            "consultation_fee": b.consultation_fee,
            "platform_commission": b.platform_commission,
            "lawyer_payout": b.lawyer_payout,
            "scheduled_time": b.scheduled_time.isoformat() if b.scheduled_time else None,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    
    return {
        "total": total or 0,
        "limit": limit,
        "offset": offset,
        "bookings": bookings_list
    }


@router.get("/bookings/{booking_id}")
async def get_booking_detail(
    booking_id: str,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get detailed booking information."""
    
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    user = await db.get(User, booking.user_id)
    lawyer_query = select(Lawyer).where(Lawyer.id == booking.lawyer_id)
    lawyer_result = await db.execute(lawyer_query)
    lawyer = lawyer_result.scalar_one_or_none()
    lawyer_user = await db.get(User, lawyer.user_id) if lawyer else None
    
    # Get payment info
    payment_query = select(Payment).where(Payment.booking_id == booking_id)
    payment_result = await db.execute(payment_query)
    payment = payment_result.scalar_one_or_none()
    
    return {
        "id": str(booking.id),
        "user": {
            "id": str(user.id) if user else None,
            "name": user.full_name if user else "Unknown",
            "email": user.email if user else "Unknown",
            "phone": user.phone if user else None,
        },
        "lawyer": {
            "id": str(lawyer.id) if lawyer else None,
            "name": lawyer_user.full_name if lawyer_user else "Unknown",
            "email": lawyer_user.email if lawyer_user else "Unknown",
        },
        "status": booking.status,
        "original_description": booking.original_description,
        "ai_summary": booking.ai_summary,
        "consultation_fee": booking.consultation_fee,
        "platform_commission": booking.platform_commission,
        "lawyer_payout": booking.lawyer_payout,
        "scheduled_time": booking.scheduled_time.isoformat() if booking.scheduled_time else None,
        "completed_at": booking.completed_at.isoformat() if booking.completed_at else None,
        "cancellation_reason": booking.cancellation_reason,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        "payment": {
            "id": str(payment.id) if payment else None,
            "status": payment.status if payment else None,
            "amount": payment.amount if payment else None,
            "razorpay_order_id": payment.razorpay_order_id if payment else None,
            "razorpay_payment_id": payment.razorpay_payment_id if payment else None,
        } if payment else None
    }


@router.post("/bookings/{booking_id}/refund")
async def refund_booking(
    booking_id: str,
    reason: str = Query(..., min_length=5),
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Issue a refund for a booking (admin action)."""
    
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status in ["refunded", "completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot refund a {booking.status} booking")
    
    # Update booking status
    booking.status = "cancelled"
    booking.cancellation_reason = f"[Admin Refund] {reason}"
    
    # TODO: Actually process refund via Razorpay API
    # For now, just mark as cancelled with reason
    
    await db.commit()
    
    return {
        "success": True,
        "booking_id": str(booking.id),
        "message": "Booking cancelled and marked for refund",
        "reason": reason
    }


# =============================================================================
# FINANCE ENDPOINTS
# =============================================================================

@router.get("/finance/overview")
async def get_finance_overview(
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get financial overview - revenue, commissions, payouts."""
    
    # Total revenue (all completed bookings)
    total_revenue = await db.scalar(
        select(func.sum(Booking.consultation_fee)).where(
            Booking.status == "completed"
        )
    )
    
    # Total commissions earned
    total_commissions = await db.scalar(
        select(func.sum(Booking.platform_commission)).where(
            Booking.status == "completed"
        )
    )
    
    # Total lawyer payouts
    total_payouts = await db.scalar(
        select(func.sum(Booking.lawyer_payout)).where(
            Booking.status == "completed"
        )
    )
    
    # Pending payouts (accepted bookings not yet completed)
    pending_payouts = await db.scalar(
        select(func.sum(Booking.lawyer_payout)).where(
            Booking.status == "accepted"
        )
    )
    
    # Count by status
    completed_count = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == "completed")
    )
    pending_count = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == "pending")
    )
    cancelled_count = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == "cancelled")
    )
    
    return {
        "total_revenue": total_revenue or 0,
        "total_commissions": total_commissions or 0,
        "total_payouts": total_payouts or 0,
        "pending_payouts": pending_payouts or 0,
        "booking_stats": {
            "completed": completed_count or 0,
            "pending": pending_count or 0,
            "cancelled": cancelled_count or 0,
        }
    }


@router.get("/finance/transactions")
async def get_transactions(
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(deps.get_db),
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get list of financial transactions (payments)."""
    
    query = select(Payment).order_by(Payment.created_at.desc())
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    transactions = []
    for p in payments:
        booking = await db.get(Booking, p.booking_id)
        user = await db.get(User, booking.user_id) if booking else None
        
        transactions.append({
            "id": str(p.id),
            "booking_id": str(p.booking_id) if p.booking_id else None,
            "user_name": user.full_name if user else "Unknown",
            "amount": p.amount,
            "status": p.status,
            "razorpay_order_id": p.razorpay_order_id,
            "razorpay_payment_id": p.razorpay_payment_id,
            "captured_at": p.captured_at.isoformat() if p.captured_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    
    return {
        "total": total or 0,
        "limit": limit,
        "offset": offset,
        "transactions": transactions
    }


# =============================================================================
# SETTINGS ENDPOINTS
# =============================================================================

@router.get("/settings")
async def get_platform_settings(
    admin: dict = Depends(get_current_admin)
) -> Any:
    """Get platform settings."""
    
    # These would typically come from a settings table
    # For now, returning config-based settings
    return {
        "platform_name": settings.PROJECT_NAME,
        "commission_rate": 10,  # 10% commission
        "min_consultation_fee": 500,
        "max_consultation_duration": 120,  # minutes
        "features": {
            "ai_summaries": True,
            "video_consultations": bool(settings.AGORA_APP_ID),
            "razorpay_enabled": bool(settings.RAZORPAY_KEY_ID),
        }
    }

