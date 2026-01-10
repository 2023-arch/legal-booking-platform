from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base_class import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    
    court_id = Column(UUID(as_uuid=True), ForeignKey("courts.id"), nullable=True)
    police_station_id = Column(UUID(as_uuid=True), ForeignKey("police_stations.id"), nullable=True)
    
    status = Column(String(50), default='pending', nullable=False) # pending, accepted, rejected, rescheduled, completed, cancelled, refunded
    original_description = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=False)
    
    consultation_fee = Column(Integer, nullable=False)
    platform_commission = Column(Integer, nullable=False)
    lawyer_payout = Column(Integer, nullable=False)
    
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    reschedule_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    lawyer = relationship("Lawyer", foreign_keys=[lawyer_id])
    court = relationship("Court")
    police_station = relationship("PoliceStation")
    
    payment = relationship("Payment", back_populates="booking", uselist=False)
    history = relationship("BookingHistory", back_populates="booking", cascade="all, delete-orphan")

class BookingHistory(Base):
    __tablename__ = "booking_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"))
    status = Column(String(50), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="history")
