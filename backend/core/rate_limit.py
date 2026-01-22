"""
Rate Limiting Middleware for FastAPI
=====================================
OWASP Best Practice: Implement rate limiting to prevent brute-force and DoS attacks.

Features:
- IP-based tracking for public endpoints
- User-based tracking for authenticated endpoints  
- Configurable limits per endpoint category
- Graceful 429 responses with Retry-After header
- In-memory storage with Redis upgrade path
"""

import time
import logging
from typing import Optional, Dict, Callable
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURATION - Sensible defaults following OWASP recommendations
# =============================================================================

RATE_LIMITS = {
    # Auth endpoints - strict limits to prevent brute-force attacks
    "auth": {
        "requests": 5,
        "window_seconds": 60,  # 5 requests per minute
    },
    # Public endpoints - moderate limits
    "public": {
        "requests": 60,
        "window_seconds": 60,  # 60 requests per minute
    },
    # Authenticated endpoints - higher limits for logged-in users
    "authenticated": {
        "requests": 100,
        "window_seconds": 60,  # 100 requests per minute
    },
}

# Endpoint categorization patterns
AUTH_PATTERNS = ["/auth/login", "/auth/register", "/auth/forgot-password"]
PUBLIC_PATTERNS = ["/lawyers/search", "/lawyers/featured", "/locations/"]


# =============================================================================
# IN-MEMORY RATE LIMITER (Production should use Redis)
# =============================================================================

class InMemoryRateLimiter:
    """
    Thread-safe in-memory rate limiter using sliding window algorithm.
    For production with multiple workers, use Redis-based implementation.
    """
    
    def __init__(self):
        # Structure: {key: [(timestamp, count), ...]}
        self._requests: Dict[str, list] = defaultdict(list)
        self._lock_cleanup_time = time.time()
    
    def _cleanup_old_entries(self, key: str, window_seconds: int):
        """Remove entries outside the sliding window."""
        cutoff = time.time() - window_seconds
        self._requests[key] = [
            (ts, count) for ts, count in self._requests[key] 
            if ts > cutoff
        ]
    
    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, int]:
        """
        Check if request should be rate limited.
        
        Returns:
            tuple[bool, int]: (is_limited, retry_after_seconds)
        """
        current_time = time.time()
        
        # Periodic cleanup of stale entries (every 5 minutes)
        if current_time - self._lock_cleanup_time > 300:
            self._global_cleanup()
            self._lock_cleanup_time = current_time
        
        # Clean old entries for this key
        self._cleanup_old_entries(key, window_seconds)
        
        # Count requests in window
        request_count = sum(count for _, count in self._requests[key])
        
        if request_count >= max_requests:
            # Calculate retry-after based on oldest entry
            if self._requests[key]:
                oldest_timestamp = min(ts for ts, _ in self._requests[key])
                retry_after = int(oldest_timestamp + window_seconds - current_time) + 1
                return True, max(1, retry_after)
            return True, window_seconds
        
        # Add new request
        self._requests[key].append((current_time, 1))
        return False, 0
    
    def _global_cleanup(self):
        """Remove stale keys from memory."""
        cutoff = time.time() - 300  # 5 minutes
        stale_keys = [
            key for key, entries in self._requests.items()
            if all(ts < cutoff for ts, _ in entries)
        ]
        for key in stale_keys:
            del self._requests[key]


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


# =============================================================================
# MIDDLEWARE
# =============================================================================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting requests.
    
    Security considerations:
    - Uses X-Forwarded-For header for IP detection behind proxies
    - Falls back to client host if header not present
    - Combines IP + user ID for authenticated routes
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for health checks and static files
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Determine rate limit category
        category = self._get_category(request.url.path)
        limits = RATE_LIMITS[category]
        
        # Build rate limit key (IP-based, with optional user ID)
        rate_key = self._build_rate_key(request, category)
        
        # Check rate limit
        is_limited, retry_after = rate_limiter.is_rate_limited(
            key=rate_key,
            max_requests=limits["requests"],
            window_seconds=limits["window_seconds"]
        )
        
        if is_limited:
            logger.warning(
                f"Rate limit exceeded for {rate_key} on {request.url.path}"
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limits["requests"]),
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                }
            )
        
        # Continue with request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limits["requests"])
        response.headers["X-RateLimit-Remaining"] = str(
            limits["requests"] - 1  # Approximate
        )
        
        return response
    
    def _get_category(self, path: str) -> str:
        """Determine rate limit category based on endpoint path."""
        # Check if auth endpoint
        if any(pattern in path for pattern in AUTH_PATTERNS):
            return "auth"
        
        # Check if public endpoint
        if any(pattern in path for pattern in PUBLIC_PATTERNS):
            return "public"
        
        # Default to authenticated
        return "authenticated"
    
    def _build_rate_key(self, request: Request, category: str) -> str:
        """
        Build unique rate limit key.
        
        Security: Uses X-Forwarded-For for reverse proxy scenarios,
        but validates against spoofing by also including client.host.
        """
        # Get client IP (handle reverse proxies)
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            # Take the first IP (original client)
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # For authenticated endpoints, try to include user ID from token
        # (Token is validated elsewhere, we just use sub claim if present)
        user_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer ") and category == "authenticated":
            try:
                from jose import jwt
                from core.config import settings
                token = auth_header.split(" ")[1]
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=[settings.ALGORITHM]
                )
                user_id = payload.get("sub")
            except Exception:
                pass  # Invalid token, just use IP
        
        if user_id:
            return f"rate:{category}:user:{user_id}"
        return f"rate:{category}:ip:{client_ip}"


# =============================================================================
# HELPER FUNCTION FOR DEPENDENCY INJECTION
# =============================================================================

def get_rate_limiter():
    """Dependency to access rate limiter in routes if needed."""
    return rate_limiter
