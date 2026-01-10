from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
from pydantic import BaseModel
from datetime import datetime

from api import deps
from db.session import get_db
from models.user import User
from models.notification import Notification

router = APIRouter()

class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 20
) -> Any:
    """
    Get current user's notifications.
    """
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    return notifications

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Mark a notification as read.
    """
    notification = await db.get(Notification, notification_id)
    if not notification:
         raise HTTPException(status_code=404, detail="Notification not found")
         
    if notification.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    notification.is_read = True
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification
