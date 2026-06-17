import os

SUPPORTED_EXTENSIONS = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java'}

def read_code_file(filepath: str) -> str:
    """
    Reads the content of a code file and returns it as a string.
    Validates that the file exists and is of a supported type.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Error: The file '{filepath}' does not exist.")
    
    _, ext = os.path.splitext(filepath)
    if ext.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Error: Unsupported file extension '{ext}'. "
            f"Supported extensions are: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise IOError(f"Error reading file '{filepath}': {e}")
