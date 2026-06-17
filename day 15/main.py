import os
import sys
from tools.code_reader import read_code_file
from tools.review_generator import generate_review
from tools.save_report import save_review_report

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <path_to_code_file>")
        sys.exit(1)
        
    filepath = sys.argv[1]
    filename = os.path.basename(filepath)
    
    # 1. Read Code
    try:
        code_content = read_code_file(filepath)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
        
    print(f"Reading file '{filepath}'...")
    print("Running AI Code Review analysis...")
    
    # 2. Review Code
    try:
        report, meta = generate_review(code_content, filename)
    except Exception as e:
        print(f"AI review failed: {e}")
        sys.exit(1)
        
    # 3. Save Report
    try:
        save_status = save_review_report(
            filename=filename,
            score=meta.get("score", 0),
            severity=meta.get("severity", "Medium"),
            verdict=meta.get("verdict", "Needs Changes"),
            report_text=report,
            issues_found=meta.get("issues_found", 0)
        )
    except Exception as e:
        save_status = f"Database save failed: {e}"
        
    # 4. Display Summary Output
    print("\n" + "=" * 40)
    print("Review Completed")
    print("=" * 40)
    print(f"Score: {meta.get('score', 0)}/10")
    print(f"Severity: {meta.get('severity', 'Medium')}")
    print(f"Verdict: {meta.get('verdict', 'Needs Changes')}")
    print(f"Issues Found: {meta.get('issues_found', 0)}")
    print(f"\n{save_status}")
    print("=" * 40)
    
    # Export full markdown report for direct inspection
    reports_dir = os.path.join(os.path.dirname(__file__), "reports")
    report_md_path = os.path.join(reports_dir, "latest_review.md")
    try:
        with open(report_md_path, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"Detailed Markdown report exported to: reports/latest_review.md")
    except Exception:
        pass

if __name__ == "__main__":
    main()
