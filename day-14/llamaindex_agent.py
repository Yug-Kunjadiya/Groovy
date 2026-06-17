import os
from llama_index.core.tools import FunctionTool
from llama_index.llms.groq import Groq
from llama_index.core.agent import ReActAgent
from pure_sdk_agent import calculate, web_search, read_long_term_memory, write_long_term_memory

# Wrap existing functions in LlamaIndex FunctionTools
calc_tool = FunctionTool.from_defaults(fn=calculate, name="calculate", description="Perform basic arithmetic operations.")
search_tool = FunctionTool.from_defaults(fn=web_search, name="web_search", description="Search the web for real-time information.")
read_mem_tool = FunctionTool.from_defaults(fn=read_long_term_memory, name="read_long_term_memory", description="Retrieve stored data from long-term memory.")
write_mem_tool = FunctionTool.from_defaults(fn=write_long_term_memory, name="write_long_term_memory", description="Save key-value pairs into long-term memory.")

tools = [calc_tool, search_tool, read_mem_tool, write_mem_tool]

def get_llamaindex_agent():
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable is not set.")
        
    llm = Groq(
    model="llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY
)
    
    return llm

if __name__ == "__main__":
    print("LlamaIndex Agent Initialized.")

    agent = get_llamaindex_agent()

    while True:
        user_input = input("\nYou: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        response = agent.complete(user_input)
        print("\nAgent:", response)