import sqlite3

# VULNERABILITY: Hardcoded API Key (Security)
AWS_ACCESS_KEY = "MOCK_AWS_ACCESS_KEY_FOR_TESTING"

def get_user_data(username):
    # VULNERABILITY: SQL Injection Risk (Security)
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()

def compute_average(total_sum, count):
    # BUG: Potential Division by Zero error if count is 0 (Bugs)
    average = total_sum / count
    return average

def process_file(filepath):
    # VULNERABILITY/BUG: Missing try/except block, unsafe file operation (Best Practices)
    f = open(filepath, 'r')
    content = f.read()
    # BUG: Undefined variable usage (Bugs)
    print(processed_content)
    f.close()

class Calculator:
    def __init__(self):
        # CODE QUALITY: Poor variable name (Code Quality)
        self.x = 10
        self.y = 20

    def add(self):
        return self.x + self.y
