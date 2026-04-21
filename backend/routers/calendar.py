import uuid
import sqlite3
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import get_db_connection

router = APIRouter(
    prefix="/api/calendar",
    tags=["Calendar"]
)

class CalendarEvent(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    start_time: str
    end_time: str
    room_id: str

class CreateEventResponse(BaseModel):
    id: str
    message: str

def execute_query(conn, query: str, params: tuple = ()):
    is_sqlite = isinstance(conn, sqlite3.Connection)
    
    if is_sqlite:
        query = query.replace('%s', '?')
        if "RETURNING" in query:
            query = query.split("RETURNING")[0].strip()
    
    cursor = conn.cursor()
    cursor.execute(query, params)
    return cursor

def get_or_create_meeting(conn, room_id: Optional[str], title: Optional[str] = None):
    effective_room_id = room_id or str(uuid.uuid4())
    
    cursor = execute_query(conn, "SELECT id, room_id FROM meetings WHERE room_id = %s", (effective_room_id,))
    meeting = cursor.fetchone()

    if meeting:
        return str(meeting["id"]), meeting["room_id"]

    meeting_id = str(uuid.uuid4())
    execute_query(
        conn,
        """
        INSERT INTO meetings (id, room_id, title, description)
        VALUES (%s, %s, %s, %s)
        """,
        (
            meeting_id,
            effective_room_id,
            title or "Scheduled meeting",
            "Created from a calendar event",
        ),
    )
    
    if isinstance(conn, sqlite3.Connection):
        conn.commit()
        
    return meeting_id, effective_room_id

@router.get("/events", response_model=List[CalendarEvent])
async def get_events():
    conn = get_db_connection()
    try:
        cursor = execute_query(
            conn,
            """
            SELECT
                ce.id,
                ce.title,
                ce.description,
                ce.start_time,
                ce.end_time,
                m.room_id
            FROM calendar_events ce
            JOIN meetings m ON m.id = ce.meeting_id
            ORDER BY ce.start_time ASC
            """
        )
        rows = cursor.fetchall()

        events = []
        for row in rows:
            start_time = row["start_time"]
            end_time = row["end_time"]
            
            if isinstance(start_time, str):
                start_time_str = start_time[:16].replace(' ', 'T')
            else:
                start_time_str = start_time.isoformat(timespec="minutes")
                
            if isinstance(end_time, str):
                end_time_str = end_time[:16].replace(' ', 'T')
            else:
                end_time_str = end_time.isoformat(timespec="minutes")

            events.append(CalendarEvent(
                id=str(row["id"]),
                title=row["title"],
                description=row["description"],
                start_time=start_time_str,
                end_time=end_time_str,
                room_id=row["room_id"]
            ))
        return events
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")
    finally:
        conn.close()

@router.post("/events", response_model=CreateEventResponse)
async def create_event(event: CalendarEvent):
    conn = get_db_connection()
    try:
        meeting_id, _ = get_or_create_meeting(conn, event.room_id, event.title)
        event_id = event.id or str(uuid.uuid4())
        
        execute_query(
            conn,
            """
            INSERT INTO calendar_events (id, meeting_id, title, description, start_time, end_time)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                event_id,
                meeting_id,
                event.title,
                event.description,
                event.start_time,
                event.end_time,
            ),
        )
        
        if isinstance(conn, sqlite3.Connection):
            conn.commit()
        else:
            conn.commit()
            
        return {"id": event_id, "message": "Event created successfully"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@router.delete("/events/{id}")
async def delete_event(id: str):
    conn = get_db_connection()
    try:
        execute_query(conn, "DELETE FROM calendar_events WHERE id = %s", (id,))
        conn.commit()
        return {"message": "Event deleted successfully"}
    finally:
        conn.close()

@router.put("/events/{id}")
async def update_event(id: str, event: CalendarEvent):
    conn = get_db_connection()
    try:
        meeting_id, _ = get_or_create_meeting(conn, event.room_id, event.title)
        cursor = execute_query(
            conn,
            """
            UPDATE calendar_events
            SET title = %s, description = %s, start_time = %s, end_time = %s, meeting_id = %s
            WHERE id = %s
            """,
            (
                event.title,
                event.description,
                event.start_time,
                event.end_time,
                meeting_id,
                id,
            ),
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Event not found")
            
        conn.commit()
        return {"message": "Event updated successfully"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()
