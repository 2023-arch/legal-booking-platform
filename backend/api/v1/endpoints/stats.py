"""
Platform Statistics Endpoint
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from api import deps
from models.user import User
from models.lawyer import Lawyer
from models.booking import Booking
from models.review import Review

router = APIRouter()


@router.get("/platform")
async def get_platform_stats(db: AsyncSession = Depends(deps.get_db)):
    """
    Get aggregate platform statistics for the homepage.
    """
    # Total verified lawyers
    lawyers_result = await db.execute(
        select(func.count(Lawyer.id)).where(Lawyer.verification_status == "verified")
    )
    total_lawyers = lawyers_result.scalar() or 0

    # Total clients (users with user_type='user')
    clients_result = await db.execute(
        select(func.count(User.id)).where(User.user_type == "user")
    )
    total_clients = clients_result.scalar() or 0

    # Total bookings
    bookings_result = await db.execute(select(func.count(Booking.id)))
    total_bookings = bookings_result.scalar() or 0

    # Total reviews
    reviews_result = await db.execute(select(func.count(Review.id)))
    total_reviews = reviews_result.scalar() or 0

    return {
        "success": True,
        "data": {
            "total_lawyers": total_lawyers,
            "total_clients": total_clients,
            "total_bookings": total_bookings,
            "total_reviews": total_reviews,
        }
    }
