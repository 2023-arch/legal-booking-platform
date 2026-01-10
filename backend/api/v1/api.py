from fastapi import APIRouter
from api.v1.endpoints import auth, lawyers, locations, bookings, payments, consultations, chat, ai_assistant, reviews, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(lawyers.router, prefix="/lawyers", tags=["lawyers"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["ai"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
