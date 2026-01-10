from sqlalchemy import Column, String, Integer, Text, ForeignKey, ARRAY, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.base_class import Base

class Lawyer(Base):
    __tablename__ = "lawyers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    bar_council_number = Column(String(50), unique=True, nullable=False)
    years_experience = Column(Integer, nullable=False)
    education = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    languages = Column(ARRAY(String), nullable=False)
    consultation_fee = Column(Integer, nullable=False)
    
    verification_status = Column(String(20), default='pending_verification', nullable=False) # pending_verification, verified, rejected
    rejection_reason = Column(Text, nullable=True)
    
    bar_council_certificate_url = Column(String, nullable=False)
    id_proof_url = Column(String, nullable=False)
    profile_photo_url = Column(String, nullable=True)
    
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="lawyer_profile")
    verifier = relationship("User", foreign_keys=[verified_by])
    
    courts = relationship("LawyerCourt", back_populates="lawyer", cascade="all, delete-orphan")
    specializations = relationship("LawyerSpecialization", back_populates="lawyer", cascade="all, delete-orphan")

class LawyerCourt(Base):
    __tablename__ = "lawyer_courts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    court_id = Column(UUID(as_uuid=True), ForeignKey("courts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lawyer = relationship("Lawyer", back_populates="courts")
    court = relationship("Court")
    
    __table_args__ = (UniqueConstraint('lawyer_id', 'court_id', name='uq_lawyer_court'),)

class LawyerSpecialization(Base):
    __tablename__ = "lawyer_specializations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)
    specialization_id = Column(UUID(as_uuid=True), ForeignKey("specializations.id", ondelete="CASCADE"), nullable=False)
    sub_specialization_id = Column(UUID(as_uuid=True), ForeignKey("specializations.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lawyer = relationship("Lawyer", back_populates="specializations")
    specialization = relationship("Specialization", foreign_keys=[specialization_id])
    sub_specialization = relationship("Specialization", foreign_keys=[sub_specialization_id])

    __table_args__ = (UniqueConstraint('lawyer_id', 'specialization_id', 'sub_specialization_id', name='uq_lawyer_spec'),)
