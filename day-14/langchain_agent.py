import os
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_classic.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import FileChatMessageHistory
from pure_sdk_agent import calculate, web_search, read_long_term_memory, write_long_term_memory

# Bind existing tools to LangChain tool schemas
@tool
def calculate_tool(operation: str, a: float, b: float) -> str:
    """Perform basic arithmetic calculations (add, subtract, multiply, divide)."""
    return calculate(operation, a, b)

@tool
def web_search_tool(query: str) -> str:
    """Query the web for real-time information and current events."""
    return web_search(query)

@tool
def read_memory_tool(key: str) -> str:
    """Read a value from the agent's long-term memory store by key."""
    return read_long_term_memory(key)

@tool
def write_memory_tool(key: str, value: str) -> str:
    """Write or save a value in the agent's long-term memory store by key."""
    return write_long_term_memory(key, value)

tools = [calculate_tool, web_search_tool, read_memory_tool, write_memory_tool]

def get_langchain_agent():
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable is not set.")
    
    # LLM instance pointing to Groq's endpoint
    llm = ChatOpenAI(
        model="llama-3.3-70b-versatile",
        openai_api_key=GROQ_API_KEY,
        openai_api_base="https://api.groq.com/openai/v1"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an assistant equipped with tool-using capabilities, short-term session memory, and long-term memory."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True
    )

if __name__ == "__main__":
    print("LangChain Agent Initialized.")

    agent = get_langchain_agent()
    chat_history = []

    while True:
        user_input = input("\nYou: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        response = agent.invoke({
            "input": user_input,
            "chat_history": chat_history
        })

        print("\nAgent:", response["output"])
