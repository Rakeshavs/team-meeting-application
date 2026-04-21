from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.database import get_db_connection

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

class UserSyncRequest(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None

@router.post("/sync")
async def sync_user(user: UserSyncRequest):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            existing_user = cursor.fetchone()

            if existing_user:
                cursor.execute(
                    """
                    UPDATE users 
                    SET name = %s, profile_picture = %s, updated_at = NOW()
                    WHERE email = %s
                    """,
                    (user.name, user.picture, user.email)
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO users (email, name, profile_picture)
                    VALUES (%s, %s, %s)
                    """,
                    (user.email, user.name, user.picture)
                )
    
    return {"status": "success", "message": "User synchronized to Supabase"}
