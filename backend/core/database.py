import sqlite3
import os
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PG = True
except ImportError:
    HAS_PG = False

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "schema.sql"
SQLITE_PATH = BASE_DIR / "local_storage.db"
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if db_url and HAS_PG:
        try:
            return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        except Exception as e:
            print(f"PostgreSQL connection failed, falling back to SQLite: {e}")

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if not SCHEMA_PATH.exists():
        print(f"Warning: Database schema file not found at {SCHEMA_PATH}")
        return

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
        
        if isinstance(conn, sqlite3.Connection):
            print("Initializing local SQLite database...")
            sqlite_schema = """
            CREATE TABLE IF NOT EXISTS meetings (
                id TEXT PRIMARY KEY,
                room_id TEXT UNIQUE NOT NULL,
                title TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS calendar_events (
                id TEXT PRIMARY KEY,
                meeting_id TEXT REFERENCES meetings(id),
                title TEXT NOT NULL,
                description TEXT,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
            cursor.executescript(sqlite_schema)
        else:
            print("Verifying Supabase (PostgreSQL) schema connectivity...")
            cursor.execute(schema_sql)
            
        conn.commit()
        print("Database initialization successful.")
    except Exception as e:
        print(f"Database initialization error: {e}")
    finally:
        conn.close()
