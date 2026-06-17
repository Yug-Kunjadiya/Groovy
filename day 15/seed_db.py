import sqlite3
import os
from datetime import datetime, timedelta

DB_DIR = os.path.join(os.path.dirname(__file__), "database")
DB_PATH = os.path.join(DB_DIR, "reviews.db")

def seed():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Recreate table if not exists
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
    
    # Clean up existing records to ensure clean seed
    cursor.execute("DELETE FROM reviews;")
    
    now = datetime.now()
    
    # 1. auth_service.py (High security issues)
    report_auth = """# AI Code Review Report

## Overall Score
4/10

## Summary
The auth_service.py module contains serious security flaws regarding password handling and credentials exposure. Remediation is required before merging.

## Bugs Found
- None detected in execution path, but error boundary around validation token is missing.

## Security Concerns
- Hardcoded secret key discovered on line 12.
- Password hashes generated using md5 without salt, leaving database records prone to rainbow-table cracking attacks.

## Performance Improvements
- User DB lookup runs inside a sequential loop. Move this to a single query using 'IN' operator.

## Code Quality Suggestions
- Variable name 'token_value_temp' should be renamed to 'temp_token' or 'token'.
- Missing docstrings for 'verify_user_password' function.

## Recommended Changes
- Shift API credentials to environment variables.
- Migrate hashing library to bcrypt or Argon2.

## Severity
High

## Final Verdict
Needs Changes"""

    # 2. payment_gateway.js (Clean, Approved)
    report_pay = """# AI Code Review Report

## Overall Score
9/10

## Summary
payment_gateway.js is extremely clean, uses parameterized calls, robust exception boundaries, and proper input validations. Excellent implementation.

## Bugs Found
- None found.

## Security Concerns
- None found.

## Performance Improvements
- Use async database drivers instead of sync ones to increase request throughput.

## Code Quality Suggestions
- Line length in block 45 exceeds 80 characters. Wrap it for clean readability.

## Recommended Changes
- Refactor the logger block to use a structured json logger instead of raw console logs.

## Severity
Low

## Final Verdict
Approved"""

    # 3. index.html (Medium quality concerns)
    report_html = """# AI Code Review Report

## Overall Score
7/10

## Summary
Simple landing page structure. Good semantic tags but lacking descriptive SEO metadata headers.

## Bugs Found
- Invalid close tag on line 34 (</div> instead of </p>).

## Security Concerns
- Missing Content Security Policy (CSP) meta header tag.

## Performance Improvements
- Scripts loaded in head block without 'defer' attribute. This blocks rendering.

## Code Quality Suggestions
- Inline CSS styles used on div wrapper. Move to global classes or modules.

## Recommended Changes
- Append the 'defer' keyword to the external bundle script tag.
- Move inline style="padding: 10px;" to class definitions.

## Severity
Medium

## Final Verdict
Approved"""

    # 4. database.py (SQL Injection risk)
    report_db = """# AI Code Review Report

## Overall Score
3/10

## Summary
Critical database query construction exposing the repository to severe SQL Injection vulnerability. Needs emergency rewrite.

## Bugs Found
- Connection pool connection leak: Connection is not closed on exception catch block.

## Security Concerns
- Raw SQL query string formatting (f-string query string formatting) inside select function allow easy injection.

## Performance Improvements
- Missing index declaration query checks on table indexing, leading to full-table scans.

## Code Quality Suggestions
- Large bloated functions. Split connection management from data mapping logic.

## Recommended Changes
- Use parameter binding: cursor.execute("SELECT * FROM users WHERE id = ?", (uid,))

## Severity
Critical

## Final Verdict
Needs Changes"""

    # 5. Yug_Kunjadiya_Resume.pdf (Non-code file mockup review)
    report_pdf = """# AI Code Review Report

## Overall Score
5/10

## Summary
The uploaded file is a PDF binary stream instead of pure source code. Text scan detected some credential signatures but could not map logical bug paths.

## Bugs Found
- Parsing binary buffer returned structural warnings.

## Security Concerns
- Scanned binary metadata detected embedded access key blocks.

## Performance Improvements
- Not applicable to document binaries.

## Code Quality Suggestions
- Upload plain source files (.py, .js, .ts) for complete AST evaluation.

## Recommended Changes
- Avoid placing credentials inside document text assets.

## Severity
Medium

## Final Verdict
Needs Changes"""

    # Insert seeded records with sequential historical dates
    seeds = [
        ("database.py", (now - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S"), 3, "Critical", "Needs Changes", report_db),
        ("auth_service.py", (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S"), 4, "High", "Needs Changes", report_auth),
        ("index.html", (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"), 7, "Medium", "Approved", report_html),
        ("Yug_Kunjadiya_Resume.pdf", (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"), 5, "Medium", "Needs Changes", report_pdf),
        ("payment_gateway.js", now.strftime("%Y-%m-%d %H:%M:%S"), 9, "Low", "Approved", report_pay),
    ]
    
    cursor.executemany("""
        INSERT INTO reviews (filename, review_date, score, severity, verdict, report)
        VALUES (?, ?, ?, ?, ?, ?);
    """, seeds)
    
    conn.commit()
    conn.close()
    print("Database seeded with realistic historical code reviews.")

if __name__ == "__main__":
    seed()
