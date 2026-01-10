from typing import Optional, List
from pydantic import BaseModel, HttpUrl, validator
from uuid import UUID
from datetime import datetime
from schemas.location import Court
from schemas.specialization import Specialization

# Nested schemas for creation
class LawyerSpecializationCreate(BaseModel):
    specialization_id: UUID
    sub_specialization_id: Optional[UUID] = None

# Helper models for response
class LawyerSpecializationResponse(BaseModel):
    specialization: Specialization
    sub_specialization: Optional[Specialization] = None

# Shared properties
class LawyerBase(BaseModel):
    bar_council_number: str
    years_experience: int
    education: Optional[str] = None
    bio: Optional[str] = None
    languages: List[str]
    consultation_fee: int

# Properties to receive via API on creation
class LawyerCreate(LawyerBase):
    court_ids: List[UUID]
    specializations: List[LawyerSpecializationCreate]
    user_id: UUID
    
    # File URLs will be handled by the endpoint logic and S3 upload
    # The frontend sends multipart/form-data, but we parse it manually or use UploadFile

# Properties to return via API
class Lawyer(LawyerBase):
    id: UUID
    user_id: UUID
    verification_status: str
    rejection_reason: Optional[str] = None
    bar_council_certificate_url: str
    id_proof_url: str
    profile_photo_url: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    courts: List[Court] = []  # Need to map from relationship
    specializations: List[LawyerSpecializationResponse] = []

    class Config:
        from_attributes = True
