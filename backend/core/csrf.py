"""
CSRF Protection Middleware (Double-Submit Cookie Pattern)
=========================================================
1. On every response, sets a 'csrf_token' cookie (readable by JS)
2. On state-changing requests (POST/PUT/PATCH/DELETE), validates that 
   the X-CSRF-Token header matches the csrf_token cookie
3. Exempt paths: /auth/login*, /auth/register, /health, /docs, /openapi.json
"""

import secrets
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Paths exempt from CSRF checks (public endpoints, auth endpoints)
CSRF_EXEMPT_PATHS = [
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/openapi.json",
    "/api/v1/auth/login",
    "/api/v1/auth/login-json",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/auth/verify-email",
    "/api/v1/admin/login",
]

# Methods that require CSRF protection
PROTECTED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check CSRF on state-changing methods
        if request.method in PROTECTED_METHODS:
            path = request.url.path
            
            # Skip exempt paths
            is_exempt = any(path.startswith(exempt) or path == exempt for exempt in CSRF_EXEMPT_PATHS)
            
            if not is_exempt:
                csrf_cookie = request.cookies.get("csrf_token")
                csrf_header = request.headers.get("X-CSRF-Token")
                
                if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
                    logger.warning(f"CSRF validation failed for {request.method} {path}")
                    return Response(
                        content='{"detail": "CSRF validation failed"}',
                        status_code=403,
                        media_type="application/json"
                    )
        
        response = await call_next(request)
        
        # Set/refresh CSRF token cookie on every response
        if "csrf_token" not in request.cookies:
            csrf_token = secrets.token_urlsafe(32)
        else:
            csrf_token = request.cookies["csrf_token"]
        
        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            httponly=False,  # JS must read this to send as header
            secure=True,
            samesite="strict",
            max_age=3600 * 24,  # 24 hours
            path="/",
        )
        
        return response
