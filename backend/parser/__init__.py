# __init__.py — Module R: LLM Parser & NLP Scaffold
# Public API — import from here, not individual files.

from .evidence_extractor import extract_evidence, batch_extract
from .schemas import ParsedResponse, EvidenceSpan, ExtractionRequest
from .confidence_scorer import HUMAN_VERIFY_THRESHOLD

__all__ = [
    "extract_evidence",
    "batch_extract",
    "ParsedResponse",
    "EvidenceSpan",
    "ExtractionRequest",
    "HUMAN_VERIFY_THRESHOLD",
]
