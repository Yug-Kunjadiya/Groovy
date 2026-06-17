# Day 14: Multi-Step Agents (Pure SDK vs. LangChain vs. LlamaIndex)

This directory contains three different implementations of a tool-using agent capable of using mathematical calculation, web search, and a persistent memory store. 

---

## 1. Comparative Analysis

### Cleanliness / Code Structure
* **Pure SDK (`pure_sdk_agent.py`):** Very explicit, simple control flow. Easy to debug since there is no magic behavior under the hood. However, it requires writing custom JSON extractors and iteration loops manually.
* **LangChain (`langchain_agent.py`):** Highly modular. Allows easy swapping of models, prompt templates, and execution loops. However, it requires learning a large abstraction hierarchy (`Runnable`, `AgentExecutor`, tool decorators, prompt helpers) and can feel like "over-engineering" for simple use cases.
* **LlamaIndex (`llamaindex_agent.py`):** Simplest API interface for building agent chains directly from python functions. Excellent out-of-the-box support for RAG pipelines and query engines.

### Execution Overhead / Performance (Which is Faster?)
* **Pure SDK** is the **fastest** and most **lightweight**. It involves zero overhead; the prompt is sent directly to the LLM endpoint and the response is immediately parsed in raw python.
* **LangChain** and **LlamaIndex** introduce minor local execution overhead (serializing inputs, managing middleware hooks, and formatting state objects) which adds roughly **20ms–50ms** of latency per turn locally, but the primary latency bottleneck in all versions remains the LLM network request.

---

## 2. Memory Implementation

### Short-Term Memory (Session-based)
* **How it works:** Retains the conversation history for the current run/chat session, allowing the agent to remember context from the user's previous questions in the conversation.
* **Implementation:**
  * **Pure SDK:** Simple python list appended with message roles and content (`history.append(...)`).
  * **LangChain:** Handled by `MessagesPlaceholder` inside the prompt template combined with chat history trackers.
  * **LlamaIndex:** Integrated natively inside the `.chat()` memory buffer of `ReActAgent`.

### Long-Term Memory (Persistent)
* **How it works:** Allows the agent to save facts or user preferences into a persistent storage file (`long_term_memory.json`) and query them in a separate session.
* **Implementation:**
  * We designed `write_long_term_memory(key, value)` and `read_long_term_memory(key)` tools.
  * The agent decides autonomously when to write a fact (e.g., storing a name or a calculation result) or read it later, preserving state permanently across CLI sessions.

---

## 3. Running the Code

1. **Install Dependencies:**
   ```bash
   pip install -r day-14/requirements.txt
   ```

2. **Configure API Key:**
   Make sure `GROQ_API_KEY` is set in your environment:
   ```powershell
   $env:GROQ_API_KEY="your_key_here"
   ```

3. **Run the Pure SDK Agent:**
   ```bash
   python day-14/pure_sdk_agent.py
   ```
   **Try these prompts to test memory:**
   - `"Save my favorite color as Blue in long-term memory."` (Agent invokes `write_long_term_memory`)
   - Close the program.
   - Run the program again and ask: `"What is my favorite color?"` (Agent invokes `read_long_term_memory` and answers `Blue`).
