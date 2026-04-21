import os
import psycopg2
from dotenv import load_dotenv

# Point to the backend env manually
ENV_PATH = r'c:\Users\medha\Downloads\shnoor\2nd project video call\21 aprilmonring\Meeting-Frontend-main (1)\Meeting-Frontend-main\meetings-hosting\shnoor-meetings-backend\.env'
load_dotenv(ENV_PATH)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("Error: DATABASE_URL not found in .env")
    exit(1)

print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'Invalid URL'}")

try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print(f"SUCCESS! Connected to: {record}")
    
    # Check if tables exist
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    tables = cursor.fetchall()
    print(f"Tables found: {[t[0] for t in tables]}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"FAILED to connect: {e}")
