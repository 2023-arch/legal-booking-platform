"""
Booking Schemas with Security Hardening
========================================
OWASP: Strict input validation with length limits and sanitization.
"""

from typing import Optional, List
from pydantic import BaseModel, field_validator, Field
from uuid import UUID
from datetime import datetime

from schemas.validators import (
    sanitize_html,
    validate_uuid_format,
    validate_text_length,
    MAX_CASE_DESCRIPTION_LENGTH,
    MIN_CASE_DESCRIPTION_LENGTH,
    MAX_GENERAL_TEXT_LENGTH,
)


# =============================================================================
# SCHEMAS
# =============================================================================

class BookingBase(BaseModel):
    """Base booking schema with validation."""
    
    lawyer_id: UUID = Field(
        ...,
        description="UUID of the lawyer to book"
    )
    court_id: Optional[UUID] = Field(
        None,
        description="UUID of the court (optional)"
    )
    police_station_id: Optional[UUID] = Field(
        None,
        description="UUID of the police station (optional)"
    )
    case_description: str = Field(
        ...,
        min_length=MIN_CASE_DESCRIPTION_LENGTH,
        max_length=MAX_CASE_DESCRIPTION_LENGTH,
        description=f"Case description ({MIN_CASE_DESCRIPTION_LENGTH}-{MAX_CASE_DESCRIPTION_LENGTH} chars)"
    )
    preferred_time: Optional[datetime] = Field(
        None,
        description="Preferred consultation time (must be in future)"
    )
    
    @field_validator('case_description')
    @classmethod
    def sanitize_description(cls, v):
        """
        Sanitize case description to prevent XSS.
        OWASP: Never trust user input.
        """
        if v:
            sanitized = sanitize_html(v.strip())
            if len(sanitized) < MIN_CASE_DESCRIPTION_LENGTH:
                raise ValueError(
                    f"Case description must be at least {MIN_CASE_DESCRIPTION_LENGTH} characters"
                )
            return sanitized
        return v
    
    @field_validator('preferred_time')
    @classmethod
    def validate_future_time(cls, v):
        """Ensure preferred time is in the future."""
        if v and v < datetime.utcnow():
            raise ValueError("Preferred time must be in the future")
        return v


class BookingCreate(BookingBase):
    """Schema for creating a booking."""
    pass


class BookingDraft(BaseModel):
    """Schema for booking draft response."""
    
    booking_draft_id: str = Field(
        ...,
        max_length=64,
        description="Draft ID for tracking"
    )
    original_description: str = Field(
        ...,
        max_length=MAX_CASE_DESCRIPTION_LENGTH
    )
    ai_summary: str = Field(
        ...,
        max_length=MAX_GENERAL_TEXT_LENGTH
    )
    lawyer_name: str = Field(
        ...,
        max_length=100
    )
    consultation_fee: int = Field(
        ...,
        ge=0,
        le=100000,
        description="Fee in rupees (0-100000)"
    )
    expires_at: datetime


class Booking(BaseModel):
    """Schema for booking response."""
    
    id: UUID
    user_id: UUID
    lawyer_id: UUID
    status: str = Field(
        ...,
        max_length=50,
        description="Booking status"
    )
    original_description: str = Field(
        ...,
        max_length=MAX_CASE_DESCRIPTION_LENGTH
    )
    ai_summary: str = Field(
        ...,
        max_length=MAX_GENERAL_TEXT_LENGTH
    )
    consultation_fee: int = Field(
        ...,
        ge=0
    )
    scheduled_time: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingUpdate(BaseModel):
    """Schema for updating a booking."""
    
    status: Optional[str] = Field(
        None,
        max_length=50,
        description="New status"
    )
    cancellation_reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Reason for cancellation (max 500 chars)"
    )
    reschedule_count: Optional[int] = Field(
        None,
        ge=0,
        le=10,
        description="Reschedule count (0-10)"
    )
    scheduled_time: Optional[datetime] = None
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is one of allowed values."""
        if v:
            allowed = ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'rescheduled']
            if v not in allowed:
                raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v
    
    @field_validator('cancellation_reason')
    @classmethod
    def sanitize_reason(cls, v):
        """Sanitize cancellation reason."""
        if v:
            return sanitize_html(v.strip())
        return v
