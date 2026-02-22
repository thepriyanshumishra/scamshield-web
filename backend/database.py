"""
database.py — SQLite setup for ScamShield backend.

Creates the 'scams' table if it doesn't already exist.
"""

import sqlite3
from datetime import datetime

DB_PATH = "scamshield.db"


def get_connection():
    """Return a new SQLite connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # access columns by name
    return conn


def init_db():
    """Create tables on startup."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS scams (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            hash        TEXT NOT NULL,
            category    TEXT NOT NULL,
            created_at  TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()
    print("✅ Database initialized — 'scams' table ready.")


def insert_scam(hash: str, category: str):
    """Insert a scam record and return the new row id."""
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO scams (hash, category, created_at) VALUES (?, ?, ?)",
        (hash, category, created_at),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id


def fetch_all_scams():
    """Return all scam records as a list of dicts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scams ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
