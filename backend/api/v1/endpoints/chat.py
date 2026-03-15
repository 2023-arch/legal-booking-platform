from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import json
from datetime import datetime

from api import deps
from core.websocket import manager
from db.session import get_db
from models.user import User
from models.booking import Booking
from models.lawyer import Lawyer
from models.chat import Message
from pydantic import BaseModel

router = APIRouter()

async def verify_chat_access(user_id: str, booking_id: str, db: AsyncSession):
    try:
        b_uuid = uuid.UUID(str(booking_id))
    except Exception:
        raise WebSocketDisconnect(code=4004, reason="Invalid booking ID")
        
    booking = await db.get(Booking, b_uuid)
    if not booking:
        raise WebSocketDisconnect(code=4004, reason="Booking not found")

    lawyer = await db.get(Lawyer, booking.lawyer_id)
    is_booking_user = (str(booking.user_id) == str(user_id))
    is_booking_lawyer = (lawyer and str(lawyer.user_id) == str(user_id))

    if not (is_booking_user or is_booking_lawyer):
        raise WebSocketDisconnect(code=4003, reason="Access denied")
    
    return booking

class MessageSchema(BaseModel):
    id: uuid.UUID
    booking_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

@router.get("/history/{booking_id}", response_model=List[MessageSchema])
async def get_chat_history(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Get chat history for a booking.
    """
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Permission check
    lawyer = await db.get(Lawyer, booking.lawyer_id)
    is_booking_user = (str(booking.user_id) == str(current_user.id))
    is_booking_lawyer = (lawyer and str(lawyer.user_id) == str(current_user.id))
    
    if not (is_booking_user or is_booking_lawyer):
        raise HTTPException(status_code=403, detail="Access denied")
         
    # Fetch messages
    stmt = select(Message).where(Message.booking_id == booking_id).order_by(Message.timestamp.asc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return messages

@router.websocket("/ws/{booking_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    booking_id: str,
    token: str = Query(...), 
    db: AsyncSession = Depends(deps.get_db)
):
    """
    WebSocket endpoint for chat.
    Authentication is tricky with WebSockets. 
    We pass JWT token as query param.
    """
    # 1. Authenticate
    if not token:
        await websocket.close(code=4001)
        return
        
    try:
        from jose import jwt, JWTError
        from core.config import settings
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
            
        # Optional: verify user exists in DB
        user = await db.get(User, uuid.UUID(user_id))
        if not user:
            await websocket.close(code=4001)
            return
            
    except JWTError:
        await websocket.close(code=4001)
        return

    # 2. Check Permissions and Connect
    try:
        await verify_chat_access(user_id, booking_id, db)
    except WebSocketDisconnect as e:
        await websocket.close(code=e.code, reason=e.reason)
        return

    await manager.connect(websocket, booking_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            # 3. Save to DB
            # We need a new session context here usually? 
            # Or use the `db` dependency? Depends on how FastAPI handles WS lifespan.
            # Usually better to create session inside loop or use async loop
            
            # Simple save
            message_data = {
                "sender_id": user_id,
                "content": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Broadcast first for speed
            await manager.broadcast(json.dumps(message_data), booking_id)
            
            # Async save to DB (Ideally background task, but here strictly inline for now)
            # Creating a new session manually might be safer for long running WS
            from db.session import AsyncSessionLocal
            async with AsyncSessionLocal() as session:
                 msg = Message(
                     booking_id=uuid.UUID(booking_id),
                     sender_id=uuid.UUID(user_id),
                     content=data
                 )
                 session.add(msg)
                 await session.commit()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, booking_id)
