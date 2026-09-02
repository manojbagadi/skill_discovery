# extraction_prompt.py — Module R: LLM Parser & NLP Scaffold
# Defines the system prompt that forces strict JSON output from the LLM.

# ─────────────────────────────────────────────
# MASTER TAXONOMY TAG LIST
# These are the ONLY tags allowed in the output.
# Synced with taxonomy.json (Module M2).
# ─────────────────────────────────────────────
KNOWN_TAGS = [
    # Visual / Design
    "visual", "creative", "motion", "3d", "color", "illustration",
    # Frontend / Web
    "frontend", "ui", "animation", "web", "css", "react",
    # Backend / Systems
    "backend", "databases", "apis", "servers", "logic",
    # AI / ML / Data
    "data", "ml", "ai", "math", "statistics", "problem-solving",
    # Content / Communication
    "writing", "storytelling", "communication", "teaching", "video", "editing",
    "audio", "content", "community", "leadership",
    # Hardware / IoT
    "hardware", "electronics", "embedded", "sensors", "iot",
    # General behavioral signals
    "collaboration", "research", "debugging", "algorithms",
]

# ─────────────────────────────────────────────
# SYSTEM PROMPT (State Machine Prompt)
# Strict JSON output enforced. No prose allowed.
# ─────────────────────────────────────────────
SYSTEM_PROMPT = f"""Extract skill tags from a student's answer. Output ONLY valid JSON.

ALLOWED TAGS (use ONLY these): {", ".join(KNOWN_TAGS)}

RULES:
- Output JSON only, no prose
- Tags not in the list → put in "unknown_tags"
- Confidence: 0.0=guess, 1.0=certain
- ambiguous=true if answer is vague/short (<5 words)
- evidence_span text must be exact quotes from student

OUTPUT FORMAT:
{{"tags":["tag1"],"evidence_spans":[{{"text":"exact quote","tag":"tag1","confidence":0.9}}],"unknown_tags":[],"overall_confidence":0.85,"ambiguous":false,"clarification_prompt":null}}

If ambiguous=true, set clarification_prompt to a specific follow-up question."""


def build_user_message(question_text: str, raw_answer: str, profile_context: dict = None) -> str:
    """
    Build the user message to send to the LLM.
    Optionally include known profile context from DB (S).
    """
    context_block = ""
    if profile_context and profile_context.get("tags_so_far"):
        context_block = f"\nKnown profile context (tags found so far): {profile_context.get('tags_so_far', [])}"
        if profile_context.get("hardware"):
            context_block += f"\nStudent hardware: {profile_context['hardware']}"

    return f"""Question asked to student: "{question_text}"

Student's answer: "{raw_answer}"{context_block}

Extract behavioral evidence tags from this answer. Follow all rules strictly."""
