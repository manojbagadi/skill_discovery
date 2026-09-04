# evidence_extractor.py — Module R: LLM Parser & NLP Scaffold
# Main orchestrator: raw student answer → structured ParsedResponse

import logging
from .llm_client import call_llm
from .extraction_prompt import SYSTEM_PROMPT, build_user_message
from .validator import validate_extraction
from .taxonomy_mapper import map_unknown_tags
from .confidence_scorer import compute_final_confidence, needs_human_verify, HUMAN_VERIFY_THRESHOLD
from .schemas import ParsedResponse, EvidenceSpan

logger = logging.getLogger(__name__)


def extract_evidence(
    session_id: str,
    question_key: str,
    question_text: str,
    raw_answer: str,
    profile_context: dict = None
) -> ParsedResponse:
    """
    Main extraction function: converts a student's raw answer into structured evidence.

    Pipeline:
      1. Build prompt with student answer + context
      2. Call LLM (OpenAI / local)
      3. Validate and sanitize LLM output
      4. Map unknown tags to nearest taxonomy tags
      5. Build EvidenceSpan objects
      6. Compute final confidence score
      7. Return ParsedResponse

    Args:
        session_id:       Unique session ID (from M1 DB)
        question_key:     e.g. "procrastination", "flow_state", "peer_help"
        question_text:    The actual question text shown to the student
        raw_answer:       Student's raw text answer
        profile_context:  Optional dict with known tags from DB (S) for earlier phases

    Returns:
        ParsedResponse — the complete structured extraction result
    """
    logger.info(f"[Extractor] session={session_id} question={question_key}")
    logger.debug(f"[Extractor] answer='{raw_answer[:80]}...'")

    # ── Step 1: Build LLM messages ─────────────────────────────────
    user_msg = build_user_message(question_text, raw_answer, profile_context)

    # ── Step 2: Call LLM ───────────────────────────────────────────
    raw_output = call_llm(SYSTEM_PROMPT, user_msg)

    # Attach raw_answer to raw_output for confidence scoring
    raw_output["raw_answer"] = raw_answer

    # ── Step 3: Validate & sanitize ────────────────────────────────
    validated = validate_extraction(raw_output)

    # ── Step 4: Map unknown tags → known taxonomy tags ─────────────
    mapped_from_unknowns = map_unknown_tags(validated.get("unknown_tags", []))
    all_tags = list(set(validated["tags"] + mapped_from_unknowns))

    # ── Step 5: Build EvidenceSpan objects ─────────────────────────
    spans = [
        EvidenceSpan(
            text=s["text"],
            tag=s["tag"],
            confidence=s["confidence"],
            source_question=question_key
        )
        for s in validated.get("evidence_spans", [])
    ]

    # ── Step 6: Compute final confidence ───────────────────────────
    final_confidence = compute_final_confidence(validated, spans, raw_answer)

    # ── Step 7: Build and return ParsedResponse ────────────────────
    result = ParsedResponse(
        session_id=session_id,
        question_key=question_key,
        raw_answer=raw_answer,
        tags=all_tags,
        evidence_spans=spans,
        unknown_tags=validated.get("unknown_tags", []),
        confidence=final_confidence,
        ambiguous=validated.get("ambiguous", False),
        clarification_prompt=validated.get("clarification_prompt"),
        needs_human_verify=needs_human_verify(final_confidence)
    )

    logger.info(
        f"[Extractor] Done: tags={result.tags}, confidence={result.confidence:.3f}, "
        f"ambiguous={result.ambiguous}, needs_verify={result.needs_human_verify}"
    )

    return result


def batch_extract(requests: list[dict]) -> list[ParsedResponse]:
    """
    Extract evidence from multiple answers at once.
    Useful for processing all Phase 1-3 answers together.

    Args:
        requests: List of dicts, each with keys:
                  session_id, question_key, question_text, raw_answer, profile_context (optional)

    Returns:
        List of ParsedResponse objects
    """
    results = []
    for req in requests:
        try:
            result = extract_evidence(
                session_id=req["session_id"],
                question_key=req["question_key"],
                question_text=req["question_text"],
                raw_answer=req["raw_answer"],
                profile_context=req.get("profile_context")
            )
            results.append(result)
        except Exception as e:
            logger.error(f"[Extractor] Failed for question={req.get('question_key')}: {e}")
            # Return a low-confidence fallback instead of crashing
            results.append(ParsedResponse(
                session_id=req["session_id"],
                question_key=req["question_key"],
                raw_answer=req.get("raw_answer", ""),
                tags=[],
                evidence_spans=[],
                unknown_tags=[],
                confidence=0.0,
                ambiguous=True,
                clarification_prompt="Could you elaborate a bit more on that?",
                needs_human_verify=True
            ))
    return results
