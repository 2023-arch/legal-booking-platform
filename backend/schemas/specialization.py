from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

class SpecializationBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None

class Specialization(SpecializationBase):
    id: UUID
    sub_specializations: List['Specialization'] = []
    
    class Config:
        from_attributes = True

# Helper to resolve forward reference
Specialization.update_forward_refs()
