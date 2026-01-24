"""
Users API Endpoints
===================
Provides user profile management endpoints.
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api import deps
from models.user import User
from models.lawyer import Lawyer
from schemas.user import User as UserSchema

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get the current authenticated user's profile.
    
    Returns user data including:
    - id, email, full_name, phone
    - user_type (user/lawyer/admin)
    - is_verified status
    """
    return current_user


@router.get("/me/lawyer")
async def get_current_user_lawyer_profile(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user's lawyer profile (if registered as lawyer).
    
    Returns lawyer-specific data including:
    - verification_status, bar_council_number
    - consultation_fee, specializations, courts
    - profile_photo_url
    """
    if current_user.user_type != "lawyer":
        raise HTTPException(
            status_code=400, 
            detail="User is not registered as a lawyer"
        )
    
    query = select(Lawyer).where(Lawyer.user_id == current_user.id)
    result = await db.execute(query)
    lawyer = result.scalar_one_or_none()
    
    if not lawyer:
        raise HTTPException(
            status_code=404, 
            detail="Lawyer profile not found"
        )
    
    return {
        "id": lawyer.id,
        "user_id": lawyer.user_id,
        "bar_council_number": lawyer.bar_council_number,
        "years_experience": lawyer.years_experience,
        "education": lawyer.education,
        "bio": lawyer.bio,
        "languages": lawyer.languages,
        "consultation_fee": lawyer.consultation_fee,
        "verification_status": lawyer.verification_status,
        "rejection_reason": lawyer.rejection_reason,
        "profile_photo_url": lawyer.profile_photo_url,
        "verified_at": lawyer.verified_at,
        "created_at": lawyer.created_at,
    }
