import os
import json
from openai import OpenAI
from tools import tools_list, tools_map

# Load Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY environment variable is not set. "
        "Please set it using: export GROQ_API_KEY='your_key' (Linux/macOS) "
        "or $env:GROQ_API_KEY='your_key' (PowerShell)"
    )

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

MODEL = "llama-3.3-70b-versatile"

# Format the tools for our system prompt
tools_description = json.dumps(tools_list, indent=2)

SYSTEM_PROMPT = f"""You are an advanced agentic assistant that can solve complex problems by orchestrating tools.
You have access to the following tools:

{tools_description}

---
CRITICAL INSTRUCTION:
If you need to use a tool, you MUST reply ONLY with a JSON object matching this schema:
{{
  "action": "call_tool",
  "tool_name": "name_of_the_tool",
  "arguments": {{
    "arg_name": "arg_value"
  }}
}}

If you have gathered enough information and are ready to provide the final answer, reply ONLY with a JSON object matching this schema:
{{
  "action": "final_response",
  "response": "Your final answer to the user here."
}}

Do NOT wrap the JSON in markdown code blocks like ```json ... ```. Output raw JSON.
Work step-by-step. If a task requires multiple tools, invoke them one by one.
"""

def run_agent(user_prompt: str, debug: bool = True):
    """
    Executes a custom reasoning-action loop for the user query by parsing JSON instructions.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]

    iteration = 0
    max_iterations = 6

    while iteration < max_iterations:
        iteration += 1
        if debug:
            print(f"\n--- [Iteration {iteration}] Sending prompt to LLM ---")

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.0  # Use low temperature for robust JSON output
        )

        response_text = response.choices[0].message.content.strip()
        
        if debug:
            print(f"LLM Response Raw:\n{response_text}")

        # Extract JSON block if surrounded by other conversational text or markdown codeblocks
        json_str = response_text
        if "```" in json_str:
            # Try to extract content inside markdown block
            try:
                import re
                blocks = re.findall(r"```(?:json)?\s*(.*?)\s*```", json_str, re.DOTALL)
                if blocks:
                    json_str = blocks[0].strip()
            except Exception:
                pass

        # Fallback to brace matching if still not pure JSON
        if not (json_str.startswith("{") and json_str.endswith("}")):
            start = json_str.find("{")
            end = json_str.rfind("}")
            if start != -1 and end != -1:
                json_str = json_str[start:end+1].strip()

        try:
            decision = json.loads(json_str)
        except Exception as e:
            if debug:
                print(f"Failed to parse extracted JSON content: {e}")
            messages.append({"role": "assistant", "content": response_text})
            messages.append({"role": "user", "content": "Error: Your response did not contain a valid JSON block. Please reply using the valid JSON action format."})
            continue

        action = decision.get("action")

        if action == "final_response":
            return decision.get("response")

        elif action == "call_tool":
            tool_name = decision.get("tool_name")
            tool_args = decision.get("arguments", {})

            if debug:
                print(f"\n-> Executing tool: '{tool_name}' with args: {tool_args}")

            if tool_name in tools_map:
                try:
                    result = tools_map[tool_name](**tool_args)
                except Exception as e:
                    result = f"Error executing tool '{tool_name}': {str(e)}"
            else:
                result = f"Error: Tool '{tool_name}' is not registered."

            if debug:
                print(f"<- Tool Result: {result}")

            # Feed the action and the result back to the LLM
            messages.append({"role": "assistant", "content": response_text})
            messages.append({
                "role": "user",
                "content": f"Tool '{tool_name}' returned: {result}"
            })

        else:
            messages.append({"role": "assistant", "content": response_text})
            messages.append({
                "role": "user",
                "content": "Error: Unknown action type. Use 'call_tool' or 'final_response'."
            })

    return "Error: Maximum iteration limit reached without producing a final answer."
