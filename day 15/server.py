import os
import sqlite3
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Import existing tool functions
from tools.code_reader import read_code_file
from tools.review_generator import generate_review
from tools.save_report import save_review_report, DB_PATH, init_db

app = FastAPI(title="AI Code Review API", version="1.0.0")

# CORS middleware configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on server start
init_db()

class ReviewRequest(BaseModel):
    code: str
    filename: str

@app.post("/api/review")
async def review_code(code: str = Form(...), filename: str = Form(...)):
    """Receives pasted code or uploaded text, runs analysis, and saves to database."""
    if not code.strip():
        raise HTTPException(status_code=400, detail="Code content cannot be empty.")
        
    try:
        # Run existing review tool chain
        report_text, meta = generate_review(code, filename)
        
        # Save to SQLite and export latest_review.json
        save_status = save_review_report(
            filename=filename,
            score=meta.get("score", 0),
            severity=meta.get("severity", "Medium"),
            verdict=meta.get("verdict", "Needs Changes"),
            report_text=report_text,
            issues_found=meta.get("issues_found", 0)
        )
        
        return {
            "success": True,
            "filename": filename,
            "score": meta.get("score", 0),
            "severity": meta.get("severity", "Medium"),
            "verdict": meta.get("verdict", "Needs Changes"),
            "issues_found": meta.get("issues_found", 0),
            "report": report_text,
            "status": save_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reviews")
async def get_reviews():
    """Retrieves all past code reviews."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reviews ORDER BY review_date DESC;")
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reviews/{review_id}")
async def get_review_detail(review_id: int):
    """Retrieves the full report details for a specific review."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reviews WHERE id = ?;", (review_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Review not found.")
        return dict(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics")
async def get_analytics():
    """Calculates summary KPIs and distributions for the analytics dashboard."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Total Reviews
        cursor.execute("SELECT COUNT(*) as total FROM reviews;")
        total_reviews = cursor.fetchone()["total"]
        
        if total_reviews == 0:
            return {
                "total_reviews": 0,
                "average_score": 0.0,
                "critical_issues": 0,
                "severity_distribution": {"Low": 0, "Medium": 0, "High": 0, "Critical": 0},
                "score_distribution": [],
                "trends": []
            }
            
        # Average Score
        cursor.execute("SELECT AVG(score) as avg_score FROM reviews;")
        avg_score = round(cursor.fetchone()["avg_score"] or 0.0, 1)
        
        # High/Critical Issues count (estimating issues_found from reports)
        cursor.execute("SELECT COUNT(*) as cnt FROM reviews WHERE severity IN ('High', 'Critical');")
        critical_issues = cursor.fetchone()["cnt"]
        
        # Severity Distribution
        cursor.execute("SELECT severity, COUNT(*) as cnt FROM reviews GROUP BY severity;")
        sevs = cursor.fetchall()
        sev_dist = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        for s in sevs:
            name = s["severity"].capitalize() if s["severity"] else "Medium"
            if name in sev_dist:
                sev_dist[name] = s["cnt"]
                
        # Score distribution (bins)
        cursor.execute("SELECT score, COUNT(*) as cnt FROM reviews GROUP BY score;")
        score_counts = cursor.fetchall()
        score_dist = [{"score": r["score"], "count": r["cnt"]} for r in score_counts]
        
        # Trends over time
        cursor.execute("SELECT SUBSTR(review_date, 1, 10) as date_day, AVG(score) as avg_score, COUNT(*) as count FROM reviews GROUP BY date_day ORDER BY date_day ASC LIMIT 30;")
        trends_rows = cursor.fetchall()
        trends = [{"date": r["date_day"], "avg_score": round(r["avg_score"], 1), "reviews_count": r["count"]} for r in trends_rows]
        
        conn.close()
        
        return {
            "total_reviews": total_reviews,
            "average_score": avg_score,
            "critical_issues": critical_issues,
            "severity_distribution": sev_dist,
            "score_distribution": score_dist,
            "trends": trends
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
