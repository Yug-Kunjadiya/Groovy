import os
import re
import json
from openai import OpenAI

def load_env():
    """Manual helper to load .env variables from workspace root or parent directories."""
    # Start looking from directory of current file up 4 levels
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(4):
        env_path = os.path.join(current_dir, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        parts = line.split("=", 1)
                        if len(parts) == 2:
                            k, v = parts[0].strip(), parts[1].strip()
                            if v.startswith(('"', "'")) and v.endswith(('"', "'")):
                                v = v[1:-1]
                            os.environ[k] = v
            return
        current_dir = os.path.dirname(current_dir)

load_env()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

SYSTEM_PROMPT = """You are a senior principal engineer and security expert.
Review the user's uploaded code carefully across these categories:
1. Bugs (e.g. division by zero, null pointer, logic errors, etc.)
2. Security Concerns (e.g. hardcoded API keys, SQL injection risk, etc.)
3. Performance Improvements (e.g. duplicate processing, bad loops, etc.)
4. Code Quality Suggestions (e.g. poor naming, lack of comments, duplicate code)
5. Best Practice Violations (e.g. missing exceptions handling, lack of validation)

---
REQUIRED OUTPUT FORMAT:
Output your analysis exactly matching this Markdown format:

# AI Code Review Report

## Overall Score
[Specify score out of 10, e.g. 7/10]

## Summary
[Brief overview of code quality]

## Bugs Found
- [Issue 1]
- [Issue 2]

## Security Concerns
- [Concern 1]
- [Concern 2]

## Performance Improvements
- [Suggestion 1]
- [Suggestion 2]

## Code Quality Suggestions
- [Suggestion 1]
- [Suggestion 2]

## Recommended Changes
[Detailed recommendations and refactoring tips]

## Severity
[Low / Medium / High]

## Final Verdict
[Approved / Needs Changes]

---
At the very end of your response, add a raw JSON block separated by a line containing 'METADATA_JSON_START' containing metadata for parsing:
METADATA_JSON_START
{
  "score": 7,
  "severity": "Medium",
  "verdict": "Needs Changes",
  "issues_found": 3
}
"""

def generate_review(code_content: str, filename: str) -> tuple[str, dict]:
    """
    Calls the Groq Llama 3.3 model to review the code.
    Parses and returns the markdown report text and a dictionary containing metadata.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please add it to your .env file.")
        
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )
    
    prompt = f"File: {filename}\n\nCode Content:\n```\n{code_content}\n```"
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0
    )
    
    full_output = response.choices[0].message.content.strip()
    
    # Extract report and JSON metadata
    report_text = full_output
    metadata = {
        "score": 5,
        "severity": "Medium",
        "verdict": "Needs Changes",
        "issues_found": 1
    }
    
    if "METADATA_JSON_START" in full_output:
        parts = full_output.split("METADATA_JSON_START")
        report_text = parts[0].strip()
        json_str = parts[1].strip()
        
        # Clean json_str from markdown code block markers if any
        if json_str.startswith("```"):
            lines = json_str.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            json_str = "\n".join(lines).strip()
            
        try:
            metadata = json.loads(json_str)
        except Exception:
            # Fallback parse metadata via Regex if JSON decoding fails
            score_match = re.search(r"Overall Score\s*[\r\n]+(\d+)/10", report_text)
            if score_match:
                metadata["score"] = int(score_match.group(1))
            
            sev_match = re.search(r"Severity\s*[\r\n]+(Low|Medium|High)", report_text, re.IGNORECASE)
            if sev_match:
                metadata["severity"] = sev_match.group(1).capitalize()
                
            ver_match = re.search(r"Final Verdict\s*[\r\n]+(Approved|Needs Changes)", report_text, re.IGNORECASE)
            if ver_match:
                metadata["verdict"] = ver_match.group(1)
                
            # Count bullet points in Bugs and Security sections
            bugs_sec = re.search(r"## Bugs Found(.*?)(##|$)", report_text, re.DOTALL)
            sec_sec = re.search(r"## Security Concerns(.*?)(##|$)", report_text, re.DOTALL)
            issues_cnt = 0
            if bugs_sec:
                issues_cnt += len(re.findall(r"^-\s+\S+", bugs_sec.group(1), re.MULTILINE))
            if sec_sec:
                issues_cnt += len(re.findall(r"^-\s+\S+", sec_sec.group(1), re.MULTILINE))
            metadata["issues_found"] = issues_cnt
            
    return report_text, metadata
