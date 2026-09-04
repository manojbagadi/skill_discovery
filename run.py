# run.py — Start the Module R API server
# Usage: python run.py

import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8001"))

    print("=" * 55)
    print("  Module R - LLM Parser & NLP Scaffold")
    print("=" * 55)
    print(f"  URL:      http://localhost:{port}")
    print(f"  Docs:     http://localhost:{port}/docs")
    print(f"  Provider: {os.getenv('LLM_PROVIDER', 'groq')}")
    print(f"  Model:    {os.getenv('LLM_MODEL', 'groq/compound-mini')}")
    print("=" * 55)
    print("  Endpoints:")
    print("    GET  /health")
    print("    GET  /tags")
    print("    POST /extract")
    print("    POST /extract/batch")
    print("=" * 55)

    uvicorn.run(
        "backend.api:app",
        host=host,
        port=port,
        reload=True,       # Auto-restart on code changes
        log_level="info"
    )
