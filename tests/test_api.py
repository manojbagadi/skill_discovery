# tests/test_api.py — API endpoint tests for Module R
# Uses FastAPI's TestClient — no server needed, no real LLM calls.
# Run with: pytest tests/test_api.py -v

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.api import app
from backend.parser.schemas import ParsedResponse, EvidenceSpan

client = TestClient(app)

# ── Mock ParsedResponse for successful extraction ──────────
MOCK_RESULT = ParsedResponse(
    session_id="test_session",
    question_key="procrastination",
    raw_answer="I open Figma and design UIs",
    tags=["ui", "visual", "creative"],
    evidence_spans=[
        EvidenceSpan(text="open Figma and design UIs", tag="ui", confidence=0.95, source_question="procrastination")
    ],
    unknown_tags=[],
    confidence=0.91,
    ambiguous=False,
    clarification_prompt=None,
    needs_human_verify=False
)

MOCK_AMBIGUOUS_RESULT = ParsedResponse(
    session_id="test_session",
    question_key="peer_help",
    raw_answer="idk stuff",
    tags=[],
    evidence_spans=[],
    unknown_tags=[],
    confidence=0.0,
    ambiguous=True,
    clarification_prompt="Can you tell me more about what people ask you for help with?",
    needs_human_verify=True
)


# ══════════════════════════════════════════════
# INFO ENDPOINTS
# ══════════════════════════════════════════════

def test_root_returns_endpoint_list():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data
    assert "POST /extract" in data["endpoints"]


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert "model" in data
    assert "confidence_threshold" in data


def test_tags_returns_full_list():
    response = client.get("/tags")
    assert response.status_code == 200
    data = response.json()
    assert "tags" in data
    assert data["total"] > 0
    assert "visual" in data["tags"]
    assert "backend" in data["tags"]


# ══════════════════════════════════════════════
# POST /extract
# ══════════════════════════════════════════════

@patch("backend.api.extract_evidence", return_value=MOCK_RESULT)
def test_extract_single_success(mock_extract):
    response = client.post("/extract", json={
        "session_id": "test_session",
        "question_key": "procrastination",
        "question_text": "When you procrastinate, what do you open?",
        "raw_answer": "I open Figma and design UIs for hours"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test_session"
    assert "ui" in data["tags"]
    assert data["ambiguous"] == False
    assert data["confidence"] > 0.7


@patch("backend.api.extract_evidence", return_value=MOCK_AMBIGUOUS_RESULT)
def test_extract_detects_ambiguous_answer(mock_extract):
    response = client.post("/extract", json={
        "session_id": "test_session",
        "question_key": "peer_help",
        "question_text": "What do people come to you for help with?",
        "raw_answer": "idk stuff"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["ambiguous"] == True
    assert data["needs_human_verify"] == True
    assert data["clarification_prompt"] is not None


def test_extract_rejects_empty_answer():
    response = client.post("/extract", json={
        "session_id": "test_session",
        "question_key": "procrastination",
        "question_text": "When you procrastinate, what do you open?",
        "raw_answer": ""
    })
    assert response.status_code == 422


def test_extract_rejects_missing_question_text():
    response = client.post("/extract", json={
        "session_id": "test_session",
        "question_key": "procrastination",
        "question_text": "",
        "raw_answer": "I open YouTube"
    })
    assert response.status_code == 422


def test_extract_with_profile_context():
    """Test that profile_context is accepted without error."""
    with patch("backend.api.extract_evidence", return_value=MOCK_RESULT):
        response = client.post("/extract", json={
            "session_id": "test_session",
            "question_key": "flow_state",
            "question_text": "What do you spend hours on?",
            "raw_answer": "I design app mockups",
            "profile_context": {"tags_so_far": ["visual"], "hardware": "low_pc"}
        })
    assert response.status_code == 200


# ══════════════════════════════════════════════
# POST /extract/batch
# ══════════════════════════════════════════════

@patch("backend.api.batch_extract", return_value=[MOCK_RESULT, MOCK_AMBIGUOUS_RESULT])
def test_batch_extract_returns_summary(mock_batch):
    response = client.post("/extract/batch", json={
        "requests": [
            {
                "session_id": "s1",
                "question_key": "procrastination",
                "question_text": "When you procrastinate?",
                "raw_answer": "I open Figma"
            },
            {
                "session_id": "s1",
                "question_key": "peer_help",
                "question_text": "Who comes to you for help?",
                "raw_answer": "idk stuff"
            }
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert "summary" in data
    assert "avg_confidence" in data["summary"]
    assert data["summary"]["ambiguous_count"] == 1


def test_batch_rejects_empty_list():
    response = client.post("/extract/batch", json={"requests": []})
    assert response.status_code == 422


def test_batch_rejects_over_limit():
    """Max 20 items per batch."""
    response = client.post("/extract/batch", json={
        "requests": [
            {
                "session_id": "s1",
                "question_key": f"q{i}",
                "question_text": "Question?",
                "raw_answer": "Some answer"
            }
            for i in range(25)   # Over the limit of 20
        ]
    })
    assert response.status_code == 422
