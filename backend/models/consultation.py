from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base_class import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    agora_channel_name = Column(String, unique=True, nullable=False)
    
    # Track call lifecycle
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    
    status = Column(String(50), default='scheduled') # scheduled, active, completed, cancelled
    
    recording_url = Column(String, nullable=True) # Optional link to S3 recording
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    booking = relationship("Booking", backref="consultation")
