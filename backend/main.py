"""
Legal Booking Platform - Main Application
==========================================
SECURITY: This application implements OWASP security best practices:
- Rate limiting on all endpoints
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- Strict input validation via Pydantic schemas
- CORS configuration for allowed origins only
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging

from core.config import settings
from api.v1.api import api_router
from db.session import engine
from db.base import Base

# Import security middleware
from core.rate_limit import RateLimitMiddleware
from core.security_middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware
from core.csrf import CSRFMiddleware
from core.keep_alive import start_keep_alive

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Sentry error tracking (Fix #10)
if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.1,  # 10% of requests for performance monitoring
        send_default_pii=False,  # Don't send PII data
    )
    logger.info("Sentry error tracking enabled")

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

# 3.5 CSRF Protection (after security headers, before CORS)
app.add_middleware(CSRFMiddleware)

# 4. CORS (outermost - handles preflight requests BEFORE other middleware)
# CRITICAL: allow_credentials=True cannot be used with allow_origins=["*"]
# Always include these origins as hardcoded fallback
HARDCODED_ORIGINS = [
    "https://legal-booking-platform.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

if settings.BACKEND_CORS_ORIGINS:
    cors_origins = list(set(
        [str(origin) for origin in settings.BACKEND_CORS_ORIGINS] + HARDCODED_ORIGINS
    ))
else:
    cors_origins = HARDCODED_ORIGINS

# Also support extra origins via environment variable
extra = os.getenv("ALLOWED_ORIGINS", "")
if extra:
    cors_origins.extend([o.strip() for o in extra.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "Content-Type", "Authorization"],
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


# Health check with DB connectivity (under /api path)
from sqlalchemy import text as sa_text
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from api.deps import get_db

@app.get("/api/health", tags=["health"])
async def api_health_check(db: AsyncSession = Depends(get_db)):
    """Health check with database connectivity verification."""
    try:
        await db.execute(sa_text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "database": "unreachable",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )


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
    
    # Start keep-alive background task to prevent Render cold starts
    import os
    render_url = os.environ.get("RENDER_EXTERNAL_URL", "https://legal-booking-platform.onrender.com")
    start_keep_alive(render_url)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down application...")
