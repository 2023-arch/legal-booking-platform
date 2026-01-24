"""
Legal Booking Platform - Main Application
==========================================
SECURITY: This application implements OWASP security best practices:
- Rate limiting on all endpoints
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Strict input validation via Pydantic schemas
- CORS configuration for allowed origins only
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from core.config import settings
from api.v1.api import api_router
from db.session import engine
from db.base import Base

# Import security middleware
from core.rate_limit import RateLimitMiddleware
from core.security_middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# APPLICATION SETUP
# =============================================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # Security: Don't expose debug info in production
    debug=False,
)

# =============================================================================
# MIDDLEWARE SETUP (Order matters - first added = last executed)
# =============================================================================

# 1. Request Logging (innermost - executes first on request, last on response)
app.add_middleware(RequestLoggingMiddleware)

# 2. Rate Limiting
app.add_middleware(RateLimitMiddleware)

# 3. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 4. CORS (outermost - handles preflight requests BEFORE other middleware)
# CRITICAL: CORS must handle OPTIONS preflight requests properly
cors_origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers to avoid preflight issues
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

logger.info(f"CORS enabled for origins: {cors_origins}")

# =============================================================================
# ROUTES
# =============================================================================

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    """Root endpoint - health check."""
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}


# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static directory for local storage
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# =============================================================================
# STARTUP / SHUTDOWN EVENTS
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    logger.info("Starting up application...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down application...")
