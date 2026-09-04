# tests/test_extractor.py — Module R: LLM Parser & NLP Scaffold
# Unit tests for the full extraction pipeline.
# Run with: pytest tests/ -v

import pytest
from unittest.mock import patch, MagicMock

# ─────────────────────────────────────────────
# We mock the LLM call so tests run without API keys.
# ─────────────────────────────────────────────

MOCK_CLEAR_RESPONSE = {
    "tags": ["visual", "ui", "creative"],
    "evidence_spans": [
        {"text": "design random UI components in Figma", "tag": "ui", "confidence": 0.95},
        {"text": "hours on motion design tutorials", "tag": "visual", "confidence": 0.88},
    ],
    "unknown_tags": [],
    "overall_confidence": 0.91,
    "ambiguous": False,
    "clarification_prompt": None,
}

MOCK_AMBIGUOUS_RESPONSE = {
    "tags": [],
    "evidence_spans": [],
    "unknown_tags": [],
    "overall_confidence": 0.2,
    "ambiguous": True,
    "clarification_prompt": "Could you tell me more about what you enjoy doing?",
}

MOCK_UNKNOWN_TAGS_RESPONSE = {
    "tags": ["visual"],
    "evidence_spans": [
        {"text": "I love doing photography", "tag": "visual", "confidence": 0.80},
    ],
    "unknown_tags": ["photography", "coding"],
    "overall_confidence": 0.75,
    "ambiguous": False,
    "clarification_prompt": None,
}


# ══════════════════════════════════════════════
# TESTS: evidence_extractor
# ══════════════════════════════════════════════

@patch("backend.parser.evidence_extractor.call_llm", return_value=MOCK_CLEAR_RESPONSE)
def test_clear_creative_answer_extracts_tags(mock_llm):
    """Student clearly describes visual/UI activity → correct tags extracted."""
    from backend.parser import extract_evidence

    result = extract_evidence(
        session_id="test_001",
        question_key="procrastination",
        question_text="When you procrastinate, what do you open?",
        raw_answer="I open Figma and design random UI components for hours, and watch motion design tutorials"
    )

    assert "visual" in result.tags
    assert "ui" in result.tags
    assert result.confidence > 0.7
    assert result.ambiguous == False
    assert result.needs_human_verify == False
    assert len(result.evidence_spans) == 2


@patch("backend.parser.evidence_extractor.call_llm", return_value=MOCK_AMBIGUOUS_RESPONSE)
def test_vague_answer_triggers_ambiguity(mock_llm):
    """Short, vague answer → ambiguous=True, needs_human_verify=True."""
    from backend.parser import extract_evidence

    result = extract_evidence(
        session_id="test_002",
        question_key="flow_state",
        question_text="What have you spent 3 hours on without noticing?",
        raw_answer="stuff"
    )

    assert result.ambiguous == True
    assert result.needs_human_verify == True
    assert result.clarification_prompt is not None
    assert len(result.clarification_prompt) > 5


@patch("backend.parser.evidence_extractor.call_llm", return_value=MOCK_UNKNOWN_TAGS_RESPONSE)
def test_unknown_tags_get_mapped(mock_llm):
    """Unknown tag 'photography' → mapped to 'visual'."""
    from backend.parser import extract_evidence

    result = extract_evidence(
        session_id="test_003",
        question_key="procrastination",
        question_text="When you procrastinate, what do you open?",
        raw_answer="I love doing photography and coding games"
    )

    # "photography" should be mapped to "visual", "coding" to "problem-solving"
    assert "visual" in result.tags
    assert "problem-solving" in result.tags


# ══════════════════════════════════════════════
# TESTS: taxonomy_mapper
# ══════════════════════════════════════════════

def test_photography_maps_to_visual():
    from backend.parser.taxonomy_mapper import map_unknown_tags
    result = map_unknown_tags(["photography"])
    assert "visual" in result


def test_coding_maps_to_problem_solving():
    from backend.parser.taxonomy_mapper import map_unknown_tags
    result = map_unknown_tags(["coding"])
    assert "problem-solving" in result


def test_unknown_with_no_synonym_returns_empty():
    from backend.parser.taxonomy_mapper import map_unknown_tags
    result = map_unknown_tags(["xyzabc123"])
    assert result == []


def test_multiple_unknowns_mapped():
    from backend.parser.taxonomy_mapper import map_unknown_tags
    result = map_unknown_tags(["photography", "arduino", "blogging"])
    assert "visual" in result
    assert "embedded" in result
    assert "writing" in result


# ══════════════════════════════════════════════
# TESTS: confidence_scorer
# ══════════════════════════════════════════════

def test_high_confidence_not_flagged_for_verify():
    from backend.parser.confidence_scorer import needs_human_verify
    assert needs_human_verify(0.9) == False


def test_low_confidence_flagged_for_verify():
    from backend.parser.confidence_scorer import needs_human_verify
    assert needs_human_verify(0.4) == True


def test_confidence_clamped_to_range():
    from backend.parser.confidence_scorer import compute_final_confidence
    raw = {"overall_confidence": 0.5, "ambiguous": False, "tags": ["visual"], "unknown_tags": []}
    spans = []
    result = compute_final_confidence(raw, spans, "I love Figma")
    assert 0.0 <= result <= 1.0


# ══════════════════════════════════════════════
# TESTS: validator
# ══════════════════════════════════════════════

def test_validator_removes_invalid_tags():
    from backend.parser.validator import validate_extraction
    raw = {
        "tags": ["visual", "INVALID_TAG_XYZ", "ui"],
        "evidence_spans": [],
        "overall_confidence": 0.8,
        "ambiguous": False,
        "unknown_tags": [],
    }
    validated = validate_extraction(raw)
    assert "INVALID_TAG_XYZ" not in validated["tags"]
    assert "visual" in validated["tags"]
    assert "ui" in validated["tags"]


def test_validator_raises_on_missing_keys():
    from backend.parser.validator import validate_extraction
    raw = {"tags": ["visual"]}  # Missing required keys
    with pytest.raises(ValueError, match="missing required keys"):
        validate_extraction(raw)


def test_validator_adds_clarification_when_ambiguous_but_missing():
    from backend.parser.validator import validate_extraction
    raw = {
        "tags": [],
        "evidence_spans": [],
        "overall_confidence": 0.3,
        "ambiguous": True,
        "clarification_prompt": None,  # Missing — should be auto-added
        "unknown_tags": [],
    }
    validated = validate_extraction(raw)
    assert validated["clarification_prompt"] is not None
    assert len(validated["clarification_prompt"]) > 5


def test_validator_clamps_confidence():
    from backend.parser.validator import validate_extraction
    raw = {
        "tags": ["visual"],
        "evidence_spans": [],
        "overall_confidence": 1.5,  # Out of range
        "ambiguous": False,
        "unknown_tags": [],
    }
    validated = validate_extraction(raw)
    assert validated["overall_confidence"] <= 1.0
