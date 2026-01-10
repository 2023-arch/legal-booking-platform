from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # booking_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)

    def disconnect(self, websocket: WebSocket, booking_id: str):
        if booking_id in self.active_connections:
            if websocket in self.active_connections[booking_id]:
               self.active_connections[booking_id].remove(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]

    async def broadcast(self, message: str, booking_id: str, sender_ws: WebSocket = None):
        """
        Broadcast text message to all in the room.
        Optionally exclude sender if needed (usually we want to echo back for confirmation or handle optimistic UI)
        """
        if booking_id in self.active_connections:
            for connection in self.active_connections[booking_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Handle dead connections
                    pass

manager = ConnectionManager()
