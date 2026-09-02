# confidence_scorer.py — Module R: LLM Parser & NLP Scaffold
# Computes the final overall confidence score for a parsed extraction.

import logging
from typing import List

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# THRESHOLD CONFIG
# Below HUMAN_VERIFY_THRESHOLD → needs_human_verify = True
# ─────────────────────────────────────────────
HUMAN_VERIFY_THRESHOLD = 0.65


def compute_final_confidence(
    raw_output: dict,
    spans: list,
    raw_answer: str
) -> float:
    """
    Compute overall confidence from multiple signals.

    Scoring breakdown:
      - LLM's self-reported confidence     (base)
      - Evidence span count bonus          (+0.02 per span, max +0.10)
      - Ambiguity penalty                  (-0.20 if ambiguous)
      - Very short answer penalty          (-0.15 if < 10 chars)
      - No tags found penalty              (-0.25 if tags list is empty)
      - Unknown tags only penalty          (-0.10 if all tags were unmapped)

    Args:
        raw_output: The raw dict from the LLM
        spans:      List of EvidenceSpan objects already validated
        raw_answer: The original student answer string

    Returns:
        Float between 0.0 and 1.0
    """
    base = float(raw_output.get("overall_confidence", 0.5))

    # Bonus: more evidence spans = more grounded extraction
    span_bonus = min(0.10, len(spans) * 0.02)

    # Penalty: ambiguous answer
    ambiguity_penalty = -0.20 if raw_output.get("ambiguous", False) else 0.0

    # Penalty: answer is too short to extract meaningful signals
    short_answer_penalty = -0.15 if len(raw_answer.strip()) < 10 else 0.0

    # Penalty: LLM found zero valid tags
    no_tags_penalty = -0.25 if not raw_output.get("tags") else 0.0

    # Penalty: LLM only returned unknown tags (none mapped to taxonomy)
    all_unknown_penalty = (
        -0.10
        if raw_output.get("unknown_tags") and not raw_output.get("tags")
        else 0.0
    )

    final = base + span_bonus + ambiguity_penalty + short_answer_penalty + no_tags_penalty + all_unknown_penalty

    # Clamp to [0.0, 1.0]
    final = round(max(0.0, min(1.0, final)), 3)

    logger.info(
        f"[Confidence] base={base:.2f} span_bonus={span_bonus:.2f} "
        f"ambiguity={ambiguity_penalty:.2f} short={short_answer_penalty:.2f} "
        f"no_tags={no_tags_penalty:.2f} → final={final:.3f}"
    )

    return final


def needs_human_verify(confidence: float) -> bool:
    """Return True if confidence is below the human verification threshold."""
    return confidence < HUMAN_VERIFY_THRESHOLD
