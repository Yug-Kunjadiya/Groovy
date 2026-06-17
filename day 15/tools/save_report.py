import os
import sqlite3
import json
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database")
DB_PATH = os.path.join(DB_DIR, "reviews.db")

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
JSON_PATH = os.path.join(REPORTS_DIR, "latest_review.json")

def init_db():
    """Initializes the SQLite database and reviews table if not already present."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            review_date TEXT,
            score INTEGER,
            severity TEXT,
            verdict TEXT,
            report TEXT
        );
    """)
    conn.commit()
    conn.close()

def save_review_report(filename: str, score: int, severity: str, verdict: str, report_text: str, issues_found: int) -> str:
    """
    Saves the code review to the SQLite database and writes the latest report JSON file.
    """
    # Initialize DB
    init_db()
    
    review_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Save to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reviews (filename, review_date, score, severity, verdict, report)
        VALUES (?, ?, ?, ?, ?, ?);
    """, (filename, review_date, score, severity, verdict, report_text))
    conn.commit()
    conn.close()
    
    # Save to latest_review.json
    os.makedirs(REPORTS_DIR, exist_ok=True)
    json_data = {
        "filename": filename,
        "review_date": review_date,
        "issues_found": issues_found,
        "severity": severity,
        "review_report": report_text
    }
    
    try:
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=2)
    except Exception as e:
        return f"Database saved, but failed to write JSON report file: {e}"
        
    return "Report saved successfully."
