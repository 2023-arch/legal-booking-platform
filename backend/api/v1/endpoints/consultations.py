from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime

from api import deps
from core import agora
from core.config import settings
from db.session import get_db
from models.user import User
from models.lawyer import Lawyer
from models.booking import Booking
from models.consultation import Consultation
from pydantic import BaseModel

router = APIRouter()

class ConsultationResponse(BaseModel):
    consultation_id: uuid.UUID
    agora_token: str
    channel_name: str
    app_id: str

@router.post("/start/{booking_id}", response_model=ConsultationResponse)
async def start_consultation(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Start a consultation session.
    Generates Agora Token.
    """
    booking = await db.get(Booking, booking_id)
    if not booking:
         raise HTTPException(status_code=404, detail="Booking not found")
         
    # Auth Check
    is_lawyer = False
    if current_user.user_type == "lawyer":
        query = select(Lawyer).where(Lawyer.user_id == current_user.id)
        result = await db.execute(query)
        lawyer_profile = result.scalar_one_or_none()
        if lawyer_profile and lawyer_profile.id == booking.lawyer_id:
            is_lawyer = True
            
    is_user = booking.user_id == current_user.id
    
    if not (is_user or is_lawyer):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if booking.status not in ["accepted", "rescheduled"]:
         raise HTTPException(status_code=400, detail="Booking not confirmed yet")
         
    # Check if consultation already exists
    query = select(Consultation).where(Consultation.booking_id == booking_id)
    result = await db.execute(query)
    consultation = result.scalar_one_or_none()
    
    channel_name = f"booking_{booking_id}"
    
    if not consultation:
        consultation = Consultation(
            booking_id=booking_id,
            agora_channel_name=channel_name,
            status="active",
            started_at=datetime.utcnow()
        )
        db.add(consultation)
        await db.commit()
        await db.refresh(consultation)
    else:
        # If exists, just return token unless it was completed?
        if consultation.status == "completed":
             # Optional: allow rejoin?
             pass 
    
    # Generate Token
    token = agora.generate_agora_token(channel_name, str(current_user.id))
    
    return {
        "consultation_id": consultation.id,
        "agora_token": token,
        "channel_name": channel_name,
        "app_id": settings.AGORA_APP_ID
    }

@router.post("/end/{consultation_id}")
async def end_consultation(
    consultation_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    End a consultation.
    """
    consultation = await db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    # Logic to verify user permission...
    
    consultation.status = "completed"
    consultation.ended_at = datetime.utcnow()
    # Calculate duration
    if consultation.started_at:
        delta = consultation.ended_at - consultation.started_at
        consultation.duration_seconds = int(delta.total_seconds())
        
    db.add(consultation)
    
    # Also update booking status
    booking = await db.get(Booking, consultation.booking_id)
    if booking:
        booking.status = "completed"
        booking.completed_at = datetime.utcnow()
        db.add(booking)
        
    await db.commit()
    
    return {"success": True}
