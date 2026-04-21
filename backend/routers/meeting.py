import uuid
import sqlite3
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import get_db_connection

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"]
)

class CreateMeetingResponse(BaseModel):
    room_id: str
    message: str

class JoinMeetingRequest(BaseModel):
    room_id: str

@router.post("/create", response_model=CreateMeetingResponse)
async def create_meeting():
    room_id = str(uuid.uuid4())

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO meetings (room_id, title, description)
                VALUES (%s, %s, %s)
                """,
                (room_id, "Instant meeting", "Created from the Shnoor frontend"),
            )

    return {
        "room_id": room_id,
        "message": "Meeting created successfully"
    }

@router.get("/{room_id}")
async def check_meeting(room_id: str):
    if not room_id:
        raise HTTPException(status_code=400, detail="Invalid room ID")

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM meetings WHERE room_id = %s",
                (room_id,),
            )
            meeting = cursor.fetchone()

    return {"room_id": room_id, "valid": bool(meeting)}

class ParticipantHistory(BaseModel):
    session_id: str
    room_id: str
    name: str
    user_email: Optional[str] = None
    role: str
    joined_at: str
    left_at: Optional[str] = None

@router.post("/history/join")
async def record_join(history: ParticipantHistory):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM meetings WHERE room_id = %s", (history.room_id,))
            meeting = cursor.fetchone()
            meeting_id = meeting["id"] if meeting else None

            cursor.execute(
                """
                INSERT INTO participants (id, meeting_id, name, user_email, role, joined_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (history.session_id, meeting_id, history.name, history.user_email, history.role, history.joined_at),
            )
            if isinstance(conn, sqlite3.Connection):
                conn.commit()
    return {"status": "success"}

@router.post("/history/leave")
async def record_leave(session_id: str, left_at: str):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE participants SET left_at = %s WHERE id = %s",
                (left_at, session_id),
            )
            if isinstance(conn, sqlite3.Connection):
                conn.commit()
    return {"status": "success"}

@router.get("/history/all")
async def get_all_history():
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT p.id as session_id, m.room_id, p.name, p.user_email, p.role, p.joined_at, p.left_at
                FROM participants p
                LEFT JOIN meetings m ON p.meeting_id = m.id
                ORDER BY p.joined_at DESC
                """
            )
            rows = cursor.fetchall()
            
    return [dict(row) for row in rows]

