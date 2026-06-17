import os
import json
import urllib.request
import urllib.parse
import re
from openai import OpenAI

# Load Groq API Key from environment or .env file
def load_env():
    # Look for .env in current or parent directory
    for path in [".env", "../.env"]:
        if os.path.exists(path):
            with open(path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        parts = line.split("=", 1)
                        if len(parts) == 2:
                            k, v = parts[0].strip(), parts[1].strip()
                            if v.startswith(('"', "'")) and v.endswith(('"', "'")):
                                v = v[1:-1]
                            os.environ[k] = v

load_env()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# ==========================================
# 1. LONG-TERM MEMORY (Persistent JSON Storage)
# ==========================================
MEMORY_FILE = "long_term_memory.json"

def read_long_term_memory(key: str) -> str:
    """Read data from persistent long-term memory."""
    if not os.path.exists(MEMORY_FILE):
        return f"Memory key '{key}' not found (empty storage)."
    try:
        with open(MEMORY_FILE, "r") as f:
            data = json.load(f)
        return str(data.get(key, f"Memory key '{key}' not found."))
    except Exception as e:
        return f"Error reading memory: {e}"

def write_long_term_memory(key: str, value: str) -> str:
    """Save key-value pairs to persistent long-term memory."""
    data = {}
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                data = json.load(f)
        except Exception:
            pass
    data[key] = value
    try:
        with open(MEMORY_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return f"Successfully saved memory key '{key}' = '{value}'."
    except Exception as e:
        return f"Error saving memory: {e}"


# ==========================================
# 2. STANDARD TOOLS
# ==========================================
def calculate(operation: str, a, b) -> str:
    """Perform mathematical calculations."""
    try:
        val_a = float(a)
        val_b = float(b)
    except (ValueError, TypeError) as e:
        return f"Error: Operands must be numbers. Details: {e}"
        
    if operation == "add": return str(val_a + val_b)
    elif operation == "subtract": return str(val_a - val_b)
    elif operation == "multiply": return str(val_a * val_b)
    elif operation == "divide": return str(val_a / val_b) if val_b != 0 else "Error: Division by zero"
    return "Error: Unknown operation"


def web_search(query: str) -> str:
    """Search the web using DuckDuckGo Lite."""
    try:
        url = f"https://lite.duckduckgo.com/lite/?q={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        titles = re.findall(r"class=['\"]result-link['\"][^>]*>(.*?)</a>", html, re.DOTALL)
        snippets = re.findall(r"class=['\"]result-snippet['\"][^>]*>(.*?)</td>", html, re.DOTALL)
        results = [f"{t.strip()}: {s.strip()}" for t, s in zip(titles[:2], snippets[:2])]
        return "\n".join(results) if results else "No results found"
    except Exception as e:
        return f"Search error: {e}"


# ==========================================
# 3. TOOL SCHEMAS & MAPPING
# ==========================================
tools_list = [
    {
        "name": "calculate",
        "description": "Perform basic arithmetic.",
        "parameters": {"operation": "add/subtract/multiply/divide", "a": "number", "b": "number"}
    },
    {
        "name": "web_search",
        "description": "Query the web for current events.",
        "parameters": {"query": "search term"}
    },
    {
        "name": "read_long_term_memory",
        "description": "Retrieve information stored in long-term memory by key.",
        "parameters": {"key": "name of the key"}
    },
    {
        "name": "write_long_term_memory",
        "description": "Store important facts/information in long-term memory by key.",
        "parameters": {"key": "name of the key", "value": "information value"}
    }
]

tools_map = {
    "calculate": calculate,
    "web_search": web_search,
    "read_long_term_memory": read_long_term_memory,
    "write_long_term_memory": write_long_term_memory
}


# ==========================================
# 4. AGENT RUNNER (Pure SDK Loop)
# ==========================================
SYSTEM_PROMPT = f"""You are a smart agent with short-term (message history) and long-term memory.
Available tools:
{json.dumps(tools_list, indent=2)}

INSTRUCTIONS:
To run a tool, respond ONLY with a JSON payload:
{{
  "action": "call_tool",
  "tool_name": "name_of_the_tool",
  "arguments": {{ "arg1": "val1" }}
}}

When you are ready to answer the user, respond ONLY with:
{{
  "action": "final_response",
  "response": "Your complete final message."
}}
"""

def run_pure_sdk_agent(user_prompt: str, history=None) -> tuple[str, list]:
    """
    Runs the agent using pure OpenAI/Groq SDK.
    Maintains a short-term memory (history) list.
    """
    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY environment variable is not set.", []

    client = OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
    
    if history is None:
        history = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    history.append({"role": "user", "content": user_prompt})

    iteration = 0
    while iteration < 5:
        iteration += 1
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=history,
            temperature=0.0
        )
        
        response_text = response.choices[0].message.content.strip()
        history.append({"role": "assistant", "content": response_text})

        # Extract JSON block
        json_str = response_text
        if not (json_str.startswith("{") and json_str.endswith("}")):
            start = json_str.find("{")
            end = json_str.rfind("}")
            if start != -1 and end != -1:
                json_str = json_str[start:end+1]

        try:
            decision = json.loads(json_str)
        except Exception:
            # Fallback if non-JSON output
            return response_text, history

        action = decision.get("action")
        if action == "final_response":
            return decision.get("response"), history
        elif action == "call_tool":
            t_name = decision.get("tool_name")
            t_args = decision.get("arguments", {})
            if t_name in tools_map:
                try:
                    result = tools_map[t_name](**t_args)
                except Exception as e:
                    result = f"Tool Execution Error: {e}"
            else:
                result = f"Error: Tool '{t_name}' not found."
            
            history.append({"role": "user", "content": f"Tool '{t_name}' returned: {result}"})
        else:
            return response_text, history

    return "Error: Exceeded max iterations", history


if __name__ == "__main__":
    # Interactive CLI Testing Session
    print("Pure SDK Agent Shell. Type 'exit' to quit.")
    session_history = None
    while True:
        user_in = input("\nYou: ")
        if user_in.lower() == "exit": break
        ans, session_history = run_pure_sdk_agent(user_in, session_history)
        print(f"\nAgent: {ans}")
