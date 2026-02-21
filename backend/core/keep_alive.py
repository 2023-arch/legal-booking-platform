"""
Keep-Alive Ping for Render Free Tier
=====================================
Prevents the Render instance from sleeping after 15 minutes of inactivity.
Sends a self-ping to /health every 14 minutes using asyncio.
"""

import asyncio
import logging
import httpx

logger = logging.getLogger(__name__)

PING_INTERVAL = 14 * 60  # 14 minutes in seconds


async def keep_alive_ping(app_url: str):
    """
    Background task that pings the app's health endpoint
    to prevent Render free tier from sleeping.
    """
    await asyncio.sleep(30)  # Wait 30s after startup before first ping
    
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            try:
                response = await client.get(f"{app_url}/health")
                logger.info(f"Keep-alive ping: {response.status_code}")
            except Exception as e:
                logger.warning(f"Keep-alive ping failed: {e}")
            
            await asyncio.sleep(PING_INTERVAL)


def start_keep_alive(app_url: str):
    """Start the keep-alive background task."""
    loop = asyncio.get_event_loop()
    loop.create_task(keep_alive_ping(app_url))
    logger.info(f"Keep-alive task started, pinging {app_url}/health every {PING_INTERVAL}s")
