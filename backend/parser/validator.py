# validator.py — Module R: LLM Parser & NLP Scaffold
# Validates and sanitizes raw LLM JSON output before further processing.

import re
import logging
from .extraction_prompt import KNOWN_TAGS

logger = logging.getLogger(__name__)

# Required keys in every LLM response
REQUIRED_KEYS = {"tags", "evidence_spans", "overall_confidence", "ambiguous"}


def validate_extraction(raw: dict) -> dict:
    """
    Validate and sanitize the raw JSON output from the LLM.

    Checks performed:
      1. All required keys are present
      2. Tags are filtered to only known taxonomy tags
      3. Confidence values are clamped to [0.0, 1.0]
      4. Evidence spans have non-empty, non-trivial text
      5. Each span's tag is a known taxonomy tag
      6. Clarification prompt is present when ambiguous=True

    Args:
        raw: Raw dict parsed from LLM JSON output

    Returns:
        Sanitized dict ready for further processing

    Raises:
        ValueError: If required keys are missing or structure is invalid
    """
    # ── 1. Check required keys ──────────────────────────────────────
    missing = REQUIRED_KEYS - set(raw.keys())
    if missing:
        raise ValueError(f"LLM output missing required keys: {missing}")

    # ── 2. Filter tags to only known taxonomy tags ──────────────────
    original_tags = raw.get("tags", [])
    filtered_tags = [t for t in original_tags if isinstance(t, str) and t.strip() in KNOWN_TAGS]
    removed = set(original_tags) - set(filtered_tags)
    if removed:
        logger.warning(f"[Validator] Removed non-taxonomy tags from 'tags': {removed}")
    raw["tags"] = filtered_tags

    # ── 3. Clamp overall_confidence to [0.0, 1.0] ──────────────────
    try:
        raw["overall_confidence"] = max(0.0, min(1.0, float(raw["overall_confidence"])))
    except (TypeError, ValueError):
        logger.warning("[Validator] Invalid overall_confidence — defaulting to 0.5")
        raw["overall_confidence"] = 0.5

    # ── 4. Validate evidence spans ─────────────────────────────────
    valid_spans = []
    for span in raw.get("evidence_spans", []):
        text = span.get("text", "").strip()
        tag = span.get("tag", "").strip()
        confidence = span.get("confidence", 0.5)

        # Skip spans with trivial text (less than 4 chars)
        if len(text) < 4:
            logger.warning(f"[Validator] Skipping span with trivial text: '{text}'")
            continue

        # Skip spans with tags not in known taxonomy
        if tag not in KNOWN_TAGS:
            logger.warning(f"[Validator] Span has unknown tag '{tag}' — adding to unknown_tags")
            raw.setdefault("unknown_tags", []).append(tag)
            continue

        # Clamp span confidence
        try:
            confidence = max(0.0, min(1.0, float(confidence)))
        except (TypeError, ValueError):
            confidence = 0.5

        valid_spans.append({
            "text": text,
            "tag": tag,
            "confidence": confidence
        })

    raw["evidence_spans"] = valid_spans

    # ── 5. Ensure unknown_tags is a list ───────────────────────────
    if not isinstance(raw.get("unknown_tags"), list):
        raw["unknown_tags"] = []

    # ── 6. Ambiguity check ─────────────────────────────────────────
    if raw.get("ambiguous") and not raw.get("clarification_prompt"):
        logger.warning(
            "[Validator] ambiguous=True but no clarification_prompt provided — adding generic one"
        )
        raw["clarification_prompt"] = (
            "Could you tell me a bit more about what you enjoy doing in your free time?"
        )

    logger.info(
        f"[Validator] Validated: {len(raw['tags'])} tags, "
        f"{len(raw['evidence_spans'])} spans, "
        f"confidence={raw['overall_confidence']:.2f}, "
        f"ambiguous={raw['ambiguous']}"
    )

    return raw


def is_valid_tag(tag: str) -> bool:
    """Quick check if a tag is in the known taxonomy."""
    return tag.strip().lower() in KNOWN_TAGS


def sanitize_text(text: str) -> str:
    """Remove excessive whitespace and non-printable characters from extracted text."""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\x20-\x7E]', '', text)
    return text.strip()
