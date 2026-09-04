# schemas.py — Module R: LLM Parser & NLP Scaffold
# This is your OUTPUT CONTRACT — agree on this with M1 (DB) and M3 (Scoring Engine) first.

from pydantic import BaseModel, Field
from typing import List, Optional


class EvidenceSpan(BaseModel):
    """A single piece of evidence extracted from a student's answer."""
    text: str                              # Exact quote from the student
    tag: str                               # Mapped taxonomy tag
    confidence: float = Field(ge=0, le=1)  # 0.0 (guessing) to 1.0 (certain)
    source_question: str                   # Which question this came from (e.g. "procrastination")


class ParsedResponse(BaseModel):
    """
    Full structured output from the LLM Parser.
    This is what gets sent to Backend API (J) and stored in DB (S).
    """
    session_id: str                         # Unique session identifier
    question_key: str                       # e.g. "procrastination", "flow_state", "peer_help"
    raw_answer: str                         # Original student answer (never modified)
    tags: List[str]                         # Final deduplicated list of taxonomy tags
    evidence_spans: List[EvidenceSpan]      # Exact quotes mapped to tags
    unknown_tags: List[str]                 # Tags LLM found but NOT in taxonomy
    confidence: float = Field(ge=0, le=1)  # Overall extraction confidence
    ambiguous: bool                         # True if answer is vague / contradictory
    clarification_prompt: Optional[str]    # Follow-up question if ambiguous
    needs_human_verify: bool                # True if confidence < CONFIDENCE_THRESHOLD


class ExtractionRequest(BaseModel):
    """Input format — what you receive from Backend API (J)."""
    session_id: str
    question_key: str
    question_text: str                      # The actual question asked to student
    raw_answer: str                         # Student's answer
    profile_context: Optional[dict] = None  # Known tags from DB (S) for earlier phases
