from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base_class import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    booking = relationship("Booking", backref="review")
    lawyer = relationship("Lawyer", backref="reviews")
    user = relationship("User", backref="reviews")

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
