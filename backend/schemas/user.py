"""
User Schemas with Security Hardening
=====================================
OWASP: Strict input validation with length limits and format checks.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, Field
from uuid import UUID
import re

from schemas.validators import (
    sanitize_html,
    validate_phone,
    validate_password_strength,
    validate_user_type,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    MAX_EMAIL_LENGTH,
)


# =============================================================================
# SCHEMAS
# =============================================================================

class UserBase(BaseModel):
    """Base user schema with validation."""
    
    email: Optional[EmailStr] = Field(
        None,
        max_length=MAX_EMAIL_LENGTH,
        description="User email address"
    )
    full_name: Optional[str] = Field(
        None,
        min_length=MIN_NAME_LENGTH,
        max_length=MAX_NAME_LENGTH,
        description="User's full name"
    )
    phone: Optional[str] = Field(
        None,
        max_length=15,
        description="Phone number in Indian format"
    )
    is_active: Optional[bool] = True
    user_type: Optional[str] = Field(
        "user",
        description="User type: user, lawyer, or admin"
    )
    
    @field_validator('full_name')
    @classmethod
    def sanitize_name(cls, v):
        """Sanitize name to prevent XSS."""
        if v:
            return sanitize_html(v.strip())
        return v
    
    @field_validator('user_type')
    @classmethod
    def validate_type(cls, v):
        """Validate user type is allowed."""
        if v:
            return validate_user_type(v)
        return v


class UserCreate(UserBase):
    """
    Schema for user registration.
    All fields required with strict validation.
    """
    
    email: EmailStr = Field(
        ...,
        max_length=MAX_EMAIL_LENGTH,
        description="Required: Valid email address"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Required: Password (8-128 chars, must include uppercase, lowercase, digit)"
    )
    full_name: str = Field(
        ...,
        min_length=MIN_NAME_LENGTH,
        max_length=MAX_NAME_LENGTH,
        description="Required: Full name (2-100 chars)"
    )
    phone: str = Field(
        ...,
        max_length=15,
        description="Required: Indian phone number"
    )
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        return validate_password_strength(v)
    
    @field_validator('phone')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone format."""
        return validate_phone(v)
    
    @field_validator('full_name')
    @classmethod
    def sanitize_and_validate_name(cls, v):
        """Sanitize and validate name."""
        if not v or len(v.strip()) < MIN_NAME_LENGTH:
            raise ValueError(f"Name must be at least {MIN_NAME_LENGTH} characters")
        return sanitize_html(v.strip())


class User(UserBase):
    """Schema for user response (no sensitive data)."""
    
    id: UUID
    is_verified: bool
    
    class Config:
        from_attributes = True


class UserInDB(User):
    """Schema for database user (internal use only)."""
    
    hashed_password: str
