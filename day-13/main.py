import sys
from agent import run_agent

def main():
    print("=" * 60)
    print("Day 13: 3-Tool Agent CLI (Calculator + Search + Slack)")
    print("=" * 60)
    print("Ask the agent anything. It can search, calculate, and send Slack messages.")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            prompt = input("You: ")
            if not prompt.strip():
                continue
            if prompt.lower() == "exit":
                print("Goodbye!")
                break

            print("\nProcessing request...")
            response = run_agent(prompt, debug=True)
            print("\n" + "=" * 40)
            print("AGENT RESPONSE:")
            print(response)
            print("=" * 40 + "\n")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}\n")

if __name__ == "__main__":
    main()
