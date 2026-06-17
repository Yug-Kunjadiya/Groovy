import urllib.request
import urllib.parse
import json
import html

# ==========================================
# TOOL 1: Calculator
# ==========================================
def calculate(operation: str, a: float, b: float) -> str:
    """Perform a mathematical operation on two numbers."""
    try:
        if operation == "add":
            res = a + b
        elif operation == "subtract":
            res = a - b
        elif operation == "multiply":
            res = a * b
        elif operation == "divide":
            if b == 0:
                return "Error: Division by zero."
            res = a / b
        else:
            return f"Error: Unknown operation '{operation}'."
        return str(res)
    except Exception as e:
        return f"Error calculating: {str(e)}"

calculate_schema = {
    "name": "calculate",
    "description": "Perform basic arithmetic calculations (add, subtract, multiply, divide) on two numbers.",
    "parameters": {
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["add", "subtract", "multiply", "divide"],
                "description": "The arithmetic operation to perform."
            },
            "a": {
                "type": "number",
                "description": "The first operand (number)."
            },
            "b": {
                "type": "number",
                "description": "The second operand (number)."
            }
        },
        "required": ["operation", "a", "b"]
    }
}


# ==========================================
# TOOL 2: Web Search
# ==========================================
def web_search(query: str) -> str:
    """Search the web using DuckDuckGo's Lite search and extract top results."""
    try:
        # Use DuckDuckGo Lite search endpoint (no API key required, easier to parse)
        url = f"https://lite.duckduckgo.com/lite/?q={urllib.parse.quote(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            response_html = response.read().decode('utf-8')
        
        results = []
        import re
        
        # Extract matches of result-link and result-snippet
        titles = re.findall(r"class=['\"]result-link['\"][^>]*>(.*?)</a>", response_html, re.DOTALL)
        snippets = re.findall(r"class=['\"]result-snippet['\"][^>]*>(.*?)</td>", response_html, re.DOTALL)
        
        for i in range(min(len(titles), 3)):
            # Clean HTML tags and entities
            title_clean = re.sub(r'<[^>]+>', '', titles[i]).strip()
            title_clean = html.unescape(title_clean)
            
            snippet_clean = re.sub(r'<[^>]+>', '', snippets[i]).strip() if i < len(snippets) else ""
            snippet_clean = html.unescape(snippet_clean)
            snippet_clean = snippet_clean.replace('\n', ' ').strip()
            
            results.append(f"Result {i+1}: {title_clean}\nSummary: {snippet_clean}\n")
            
        if not results:
            return f"No search results found for '{query}'."
        return "\n".join(results)
    except Exception as e:
        return f"Web search tool triggered for '{query}' but search request failed: {str(e)}"

web_search_schema = {
    "name": "web_search",
    "description": "Search the web for real-time information, news, fact-checking, or current events.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query to lookup on the web."
            }
        },
        "required": ["query"]
    }
}


# ==========================================
# TOOL 3: Slack Webhook
# ==========================================
def slack_webhook(message: str, webhook_url: str = None) -> str:
    """Send a message to a Slack channel via Webhook."""
    if not webhook_url:
        # Check standard slack URL or mock it if not provided
        import os
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    
    if not webhook_url:
        # Dry run / Log output if no webhook is set
        print(f"\n[SLACK DRY-RUN] Message: {message}\n")
        return f"Slack message triggered successfully in DRY-RUN mode (Webhook URL not configured): '{message}'"
        
    try:
        data = json.dumps({"text": message}).encode('utf-8')
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_code = response.getcode()
        return f"Successfully sent Slack message. HTTP Status Code: {res_code}"
    except Exception as e:
        return f"Failed to send Slack message: {str(e)}"

slack_webhook_schema = {
    "name": "slack_webhook",
    "description": "Send notifications or text messages to a Slack workspace/channel.",
    "parameters": {
        "type": "object",
        "properties": {
            "message": {
                "type": "string",
                "description": "The text message content to send to Slack."
            },
            "webhook_url": {
                "type": "string",
                "description": "Optional custom Slack Webhook URL. If omitted, the default configured webhook is used."
            }
        },
        "required": ["message"]
    }
}

# Mapping schema name to python function
tools_map = {
    "calculate": calculate,
    "web_search": web_search,
    "slack_webhook": slack_webhook
}

# List of tool declarations for LLMs
tools_list = [
    {"type": "function", "function": calculate_schema},
    {"type": "function", "function": web_search_schema},
    {"type": "function", "function": slack_webhook_schema}
]
