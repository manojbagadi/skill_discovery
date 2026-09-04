# live_test.py — Quick live test against Groq API
# Run: python live_test.py

import os
import sys
import time

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

# Load .env
load_dotenv()

# Check API key is set
api_key = os.getenv("GROQ_API_KEY", "")
if not api_key or "your-groq" in api_key:
    print("ERROR: GROQ_API_KEY not set in .env file!")
    sys.exit(1)

print("[OK] API key found:", api_key[:8] + "..." + api_key[-4:])
print("[OK] Provider:", os.getenv("LLM_PROVIDER"))
print("[OK] Model:", os.getenv("LLM_MODEL"))
print()

# Run a real extraction
from backend.parser import extract_evidence

test_cases = [
    {
        "label": "[TEST 1] Clear creative answer",
        "question_key": "procrastination",
        "question_text": "When you procrastinate, what do you open?",
        "answer": "I open Figma and redesign random app UIs for hours. Sometimes I watch motion design tutorials on YouTube."
    },
    {
        "label": "[TEST 2] Backend/coding answer",
        "question_key": "flow_state",
        "question_text": "What's something you've spent 3 hours on without noticing?",
        "answer": "Building a REST API from scratch using FastAPI. I love debugging and figuring out why something breaks."
    },
    {
        "label": "[TEST 3] Vague answer (ambiguity test)",
        "question_key": "peer_help",
        "question_text": "What do people come to you for help with?",
        "answer": "idk just random stuff"
    },
]

print("=" * 60)
for tc in test_cases:
    print(f"\n{tc['label']}")
    print(f"  Q: {tc['question_text']}")
    print(f"  A: \"{tc['answer']}\"")
    print()

    try:
        result = extract_evidence(
            session_id="live_test",
            question_key=tc["question_key"],
            question_text=tc["question_text"],
            raw_answer=tc["answer"]
        )
        print(f"  Tags:           {result.tags}")
        print(f"  Confidence:     {result.confidence:.2f}")
        print(f"  Ambiguous:      {result.ambiguous}")
        print(f"  Needs Verify:   {result.needs_human_verify}")
        if result.ambiguous and result.clarification_prompt:
            print(f"  Follow-up Q:    \"{result.clarification_prompt}\"")
        if result.evidence_spans:
            print(f"  Evidence:")
            for span in result.evidence_spans:
                print(f"       [{span.tag}] \"{span.text}\" (conf={span.confidence:.2f})")
    except Exception as e:
        print(f"  ERROR: {e}")

    print("-" * 60)
    time.sleep(5)  # Wait 5s between calls to respect Groq rate limits

print("\n[DONE] Live test complete!")
