from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base_class import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False) # in paise
    status = Column(String(50), default='pending', nullable=False) # pending, captured, failed, refunded
    
    razorpay_order_id = Column(String, unique=True, nullable=False)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    
    captured_at = Column(DateTime(timezone=True), nullable=True)
    
    # Refund fields
    refund_amount = Column(Integer, nullable=True)
    refund_id = Column(String, nullable=True)
    refund_status = Column(String, nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="payment")

class Escrow(Base):
    __tablename__ = "escrow"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    
    held_until = Column(DateTime(timezone=True), nullable=True)
    released_at = Column(DateTime(timezone=True), nullable=True)
    
    payout_id = Column(String, nullable=True)
    payout_status = Column(String, default='pending')
    payout_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
