from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


# Shared properties
class BookingBase(BaseModel):
    lawyer_id: UUID
    court_id: Optional[UUID] = None
    police_station_id: Optional[UUID] = None
    case_description: str # Input field, maps to original_description
    preferred_time: Optional[datetime] = None

# Properties to receive via API on creation
class BookingCreate(BookingBase):
    pass

# For Draft response
class BookingDraft(BaseModel):
    booking_draft_id: str
    original_description: str
    ai_summary: str
    lawyer_name: str
    consultation_fee: int
    expires_at: datetime

# For Booking response
class Booking(BaseModel):
    id: UUID
    user_id: UUID
    lawyer_id: UUID
    status: str
    original_description: str
    ai_summary: str
    consultation_fee: int
    scheduled_time: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    cancellation_reason: Optional[str] = None
    reschedule_count: Optional[int] = None
    scheduled_time: Optional[datetime] = None

