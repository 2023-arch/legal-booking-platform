from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = True
    user_type: Optional[str] = "user"

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    full_name: str
    phone: str 

# Properties to return via API
class User(UserBase):
    id: UUID
    is_verified: bool

    class Config:
        from_attributes = True

# Properties stored in DB
class UserInDB(User):
    hashed_password: str
