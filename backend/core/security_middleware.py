"""
Security Headers Middleware for FastAPI
========================================
OWASP Best Practice: Add security headers to all responses.

Headers implemented:
- X-Content-Type-Options: Prevent MIME type sniffing
- X-Frame-Options: Prevent clickjacking
- X-XSS-Protection: Enable browser XSS filtering
- Strict-Transport-Security: Enforce HTTPS
- Content-Security-Policy: Control resource loading
- X-Request-ID: Request tracing for debugging
"""

import uuid
import logging
from typing import Callable
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all HTTP responses.
    
    Following OWASP Secure Headers guidelines:
    https://owasp.org/www-project-secure-headers/
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Generate unique request ID for tracing
        request_id = str(uuid.uuid4())
        
        # Store request ID in state for use in logging
        request.state.request_id = request_id
        
        # Log incoming request (useful for debugging)
        logger.debug(
            f"[{request_id}] {request.method} {request.url.path}"
        )
        
        # Process request
        response = await call_next(request)
        
        # =================================================================
        # SECURITY HEADERS (OWASP Recommendations)
        # =================================================================
        
        # Prevent MIME type sniffing attacks
        # https://owasp.org/www-project-secure-headers/#x-content-type-options
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking attacks by disabling framing
        # https://owasp.org/www-project-secure-headers/#x-frame-options
        response.headers["X-Frame-Options"] = "DENY"
        
        # Enable browser XSS filtering (legacy, but still useful)
        # https://owasp.org/www-project-secure-headers/#x-xss-protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Enforce HTTPS for 1 year (only effective over HTTPS)
        # https://owasp.org/www-project-secure-headers/#strict-transport-security
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        
        # Prevent information leakage via Referrer header
        # https://owasp.org/www-project-secure-headers/#referrer-policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Control what browser features the site can use
        # https://owasp.org/www-project-secure-headers/#permissions-policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )
        
        # Content Security Policy - restrict resource loading
        # Note: This is a basic policy, adjust based on your needs
        # https://owasp.org/www-project-secure-headers/#content-security-policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://*.razorpay.com; "
            "frame-src https://api.razorpay.com; "
            "frame-ancestors 'none';"
        )
        
        # Add request ID to response for tracing
        response.headers["X-Request-ID"] = request_id
        
        # Remove potentially sensitive headers
        # (These might be set by underlying frameworks)
        if "Server" in response.headers:
            del response.headers["Server"]
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured request logging.
    Useful for security auditing and debugging.
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        import time
        
        start_time = time.time()
        
        # Get client IP (handle reverse proxies)
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Get request ID if available
        request_id = getattr(request.state, "request_id", "unknown")
        
        # Log request details
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "client_ip": client_ip,
            "user_agent": request.headers.get("User-Agent", "unknown")[:100],
        }
        
        # Log level based on status code
        if response.status_code >= 500:
            logger.error(f"Request completed: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Request completed: {log_data}")
        else:
            logger.info(f"Request completed: {log_data}")
        
        return response
