import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Legal Booking Platform"
    API_V1_STR: str = "/api/v1"  # Must match frontend expectation
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # Clean up the string by removing brackets and quotes if it was passed as a JSON-like string
            cleaned_str = v.strip('[]"\'')
            if not cleaned_str:
                return []
            return [i.strip().strip('"\'') for i in cleaned_str.split(",")]
        elif isinstance(v, list):
            return v
        return []

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://admin:password@localhost:5432/legal_booking"
    
    # Redis (optional - graceful fallback if unavailable)
    REDIS_URL: str = ""

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # External APIs
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_ACCOUNT_NUMBER: str = ""
    GEMINI_API_KEY: str = ""
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""
    
    # AWS S3
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    AWS_S3_BUCKET: str = "legal-booking-bucket"
    AWS_REGION: str = "ap-south-1"
    
    # Cloudinary (Free Tier Storage)
    USE_CLOUDINARY: bool = True
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    
    # Admin Panel (Fix #8: No hardcoded defaults — must set in env vars)
    ADMIN_USERNAME: str = ""  # MUST be set in Render env vars
    ADMIN_PASSWORD: str = ""  # MUST be set in Render env vars
    ADMIN_SECRET_KEY: str = ""  # Separate JWT secret for admin tokens
    ADMIN_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour session

    # Error Tracking (Fix #10)
    SENTRY_DSN: str = ""  # Set to enable Sentry error tracking

    # Email / SMTP Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "noreply@legalbook.in"
    SMTP_PASSWORD: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
