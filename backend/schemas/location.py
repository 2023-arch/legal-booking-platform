from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

# Shared properties
class StateBase(BaseModel):
    name: str
    code: str

class DistrictBase(BaseModel):
    name: str
    state_id: UUID

class CourtBase(BaseModel):
    name: str
    type: str
    district_id: UUID
    address: Optional[str] = None

class PoliceStationBase(BaseModel):
    name: str
    district_id: UUID
    address: Optional[str] = None

# Properties to return via API
class State(StateBase):
    id: UUID
    class Config:
        from_attributes = True

class District(DistrictBase):
    id: UUID
    class Config:
        from_attributes = True

class Court(CourtBase):
    id: UUID
    class Config:
        from_attributes = True

class PoliceStation(PoliceStationBase):
    id: UUID
    class Config:
        from_attributes = True
