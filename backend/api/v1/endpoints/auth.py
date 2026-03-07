from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel

from api import deps
from core import security
from core.config import settings
from models.user import User
from schemas.user import UserCreate, User as UserSchema
from schemas.token import Token

router = APIRouter()

# =============================================================================
# COOKIE HELPERS
# =============================================================================

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set httpOnly secure cookies for JWT tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/v1/auth",  # Only sent to auth endpoints
    )


def _clear_auth_cookies(response: Response):
    """Clear auth cookies on logout."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")


# =============================================================================
# LOGIN ENDPOINTS
# =============================================================================

@router.post("/login", response_model=Token)
async def login_access_token(
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login using form data.
    Use /login-json for JSON-based login.
    """
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id)
    
    # Set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token)
    
    # Also return tokens in JSON body for backward compatibility
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


class LoginRequest(BaseModel):
    username: str  # email or phone
    password: str


@router.post("/login-json", response_model=Token)
async def login_json(
    response: Response,
    *,
    db: AsyncSession = Depends(deps.get_db),
    login_data: LoginRequest
) -> Any:
    """
    JSON-based login endpoint (simpler than OAuth2 form).
    Sets httpOnly cookies AND returns tokens in JSON body.
    """
    query = select(User).where(User.email == login_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id)
    
    # Set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# =============================================================================
# REGISTER
# =============================================================================

@router.post("/register", response_model=Token)
async def register_user(
    response: Response,
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    """
    Create new user. Sets httpOnly cookies on success.
    """
    import logging
    logger = logging.getLogger(__name__)

    # Check if user exists
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )
        
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone=user_in.phone,
        hashed_password=security.get_password_hash(user_in.password),
        user_type=user_in.user_type,
        is_active=True,
        is_verified=False  # Pending verification
    )
    
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Registration IntegrityError: {e.orig}")
        raise HTTPException(
            status_code=400,
            detail="An account with this email or phone number already exists."
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Registration failed — {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id)
    
    # Set httpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# =============================================================================
# LOGOUT
# =============================================================================

@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookies."""
    _clear_auth_cookies(response)
    return {"message": "Logged out successfully"}


# =============================================================================
# PASSWORD RESET
# =============================================================================

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request: ForgotPasswordRequest
) -> Any:
    """
    Request password reset. Always returns success to prevent email enumeration.
    In production, this would send an email with the reset link.
    """
    import secrets
    from datetime import datetime, timezone
    
    query = select(User).where(User.email == request.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user:
        reset_token = secrets.token_urlsafe(32)
        # TODO: Store token in DB and send email
        pass
    
    return {
        "message": "If an account exists with this email, you will receive a password reset link."
    }


@router.post("/reset-password")
async def reset_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request: ResetPasswordRequest
) -> Any:
    """
    Reset password using token from email.
    Note: Full implementation requires password_reset_token column in User model.
    """
    return {
        "message": "Password reset functionality will be fully enabled once email service is configured."
    }
