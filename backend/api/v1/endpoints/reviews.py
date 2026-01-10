from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from api import deps
from db.session import get_db
from models.user import User
from models.lawyer import Lawyer
from models.booking import Booking
from models.review import Review

router = APIRouter()

class ReviewCreate(BaseModel):
    booking_id: uuid.UUID
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: uuid.UUID
    lawyer_id: uuid.UUID
    user_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Create a review for a completed booking.
    """
    booking = await db.get(Booking, review_in.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
        
    # Check if review already exists
    query = select(Review).where(Review.booking_id == review_in.booking_id)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
        
    review = Review(
        booking_id=review_in.booking_id,
        lawyer_id=booking.lawyer_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    # Optional: Update Lawyer's average rating here or compute on fly
    
    return review

@router.get("/lawyer/{lawyer_id}", response_model=List[ReviewResponse])
async def get_lawyer_reviews(
    lawyer_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20
) -> Any:
    """
    Get reviews for a lawyer.
    """
    stmt = select(Review).where(Review.lawyer_id == lawyer_id).order_by(Review.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    return reviews
