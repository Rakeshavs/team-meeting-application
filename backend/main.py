import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from core.database import init_db
from routers import meeting, signaling, calendar, user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

init_db()

app = FastAPI(
    title="Shnoor Meetings Backend",
    description="Backend Signaling & Chat server for Shnoor Meetings (WebRTC)",
    version="1.0.0"
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meeting.router)
app.include_router(signaling.router)
app.include_router(calendar.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Shnoor Meetings API"}

if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("BACKEND_PORT", "8000")))
    reload_enabled = os.getenv("BACKEND_RELOAD", "false").lower() == "true"
    
    if os.getenv("RENDER"):
        reload_enabled = False

    uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)
