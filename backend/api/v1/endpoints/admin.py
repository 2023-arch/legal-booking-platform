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
