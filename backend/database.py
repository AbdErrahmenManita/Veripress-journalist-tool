import sqlite3
import json
import logging
from datetime import datetime

DB_NAME = "atlas.db"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """
    Creates and returns a connection to the SQLite database.
    Sets row_factory to sqlite3.Row to allow column access by name.
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise

def init_db():
    """
    Initializes the database tables if they do not exist.
    Designed to be run on application startup.
    """
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        # Create the main claims table
        # Stores the full analysis of every verified claim
        c.execute('''
            CREATE TABLE IF NOT EXISTS claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_text TEXT NOT NULL,
                verdict TEXT NOT NULL,
                explanation TEXT,
                sources TEXT,  -- Stored as a JSON string
                credibility_score INTEGER,
                hash TEXT NOT NULL,
                created_at TEXT
            )
        ''')

        # Create a separate archive table (optional normalization, 
        # for this demo we track specific archival events)
        c.execute('''
            CREATE TABLE IF NOT EXISTS archive (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_id INTEGER,
                hash TEXT NOT NULL,
                archived_at TEXT,
                FOREIGN KEY(claim_id) REFERENCES claims(id)
            )
        ''')
        
        conn.commit()
        logger.info("Database initialized successfully.")
    except sqlite3.Error as e:
        logger.error(f"Error initializing database: {e}")
    finally:
        conn.close()

# Initialize on module import to ensure DB exists
init_db()