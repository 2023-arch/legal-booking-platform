import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Legal Booking Platform"
    API_V1_STR: str = "/api"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://admin:password@localhost:5432/legal_booking"
    
    # Redis
    REDIS_URL: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # External APIs
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    GEMINI_API_KEY: str = ""
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""
    
    # AWS S3
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    AWS_S3_BUCKET: str = "legal-booking-bucket"
    AWS_REGION: str = "ap-south-1"

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
