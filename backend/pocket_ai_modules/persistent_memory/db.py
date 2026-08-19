import sqlite3
from pathlib import Path

db_path = Path.home() / 'Pocket_AI' / 'memory.db'

def db():
    db_path.parent.mkdir(exist_ok=True, parents=True)
    conn = sqlite3.connect(db_path)
    query = """
    CREATE TABLE IF NOT EXISTS memory (
        id INTEGER PRIMARY KEY,
        f_name TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL
    )
    """
    conn.execute(query)
    conn.commit()
    conn.close()

def get_connection():
    try:
        conn = sqlite3.connect(db_path)
        yield conn
    finally:
        conn.close()
