# backend/api.py — Module R: LLM Parser & NLP Scaffold
# FastAPI REST API — exposes the parser as HTTP endpoints for teammates M1 and M3.

import os
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from backend.parser import extract_evidence, batch_extract, ParsedResponse, HUMAN_VERIFY_THRESHOLD
from backend.parser.extraction_prompt import KNOWN_TAGS

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="Module R — LLM Parser & NLP Scaffold",
    description=(
        "Converts raw student answers into structured, tagged, "
        "confidence-scored evidence for the Skill Discovery Engine."
    ),
    version="1.0.0",
)

# Allow all origins during development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────────

class ExtractionRequest(BaseModel):
    """
    What you receive from Backend API (J) / teammates.
    M1 sends session_id + profile_context from DB.
    """
    session_id: str
    question_key: str                        # e.g. "procrastination", "flow_state"
    question_text: str                       # The actual question asked to student
    raw_answer: str                          # Student's raw answer
    profile_context: Optional[dict] = None  # Tags found so far from DB (S)


class BatchExtractionRequest(BaseModel):
    """Batch process multiple answers at once (e.g., all Phase 1-3 answers)."""
    requests: List[ExtractionRequest]


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    model: str
    provider: str
    confidence_threshold: float


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/", tags=["Info"])
def root():
    """API root — shows available endpoints."""
    return {
        "module": "R — LLM Parser & NLP Scaffold",
        "version": "1.0.0",
        "endpoints": {
            "POST /extract":        "Extract evidence from a single student answer",
            "POST /extract/batch":  "Extract evidence from multiple answers at once",
            "GET  /health":         "Health check + config info",
            "GET  /tags":           "List all known taxonomy tags",
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
def health_check():
    """
    Health check endpoint.
    Teammates can call this to verify Module R is running.
    """
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat() + "Z",
        model=os.getenv("LLM_MODEL", "groq/compound-mini"),
        provider=os.getenv("LLM_PROVIDER", "groq"),
        confidence_threshold=HUMAN_VERIFY_THRESHOLD
    )


@app.get("/tags", tags=["Info"])
def get_known_tags():
    """
    Returns the full list of known taxonomy tags.
    M2 (Taxonomy) and M3 (Scoring Engine) can use this to verify alignment.
    """
    return {
        "total": len(KNOWN_TAGS),
        "tags": sorted(KNOWN_TAGS)
    }


@app.post("/extract", response_model=ParsedResponse, tags=["Extraction"])
def extract_single(request: ExtractionRequest):
    """
    Extract behavioral evidence from a single student answer.

    **Receives from**: Backend API (J) — student raw text + DB (S) profile context
    **Sends to**:      Backend API (J) — validated ParsedResponse

    ## Example
    ```json
    {
      "session_id": "abc123",
      "question_key": "procrastination",
      "question_text": "When you procrastinate, what do you open?",
      "raw_answer": "I open Figma and design UIs for hours",
      "profile_context": { "tags_so_far": ["visual"] }
    }
    ```
    """
    logger.info(f"[API] /extract  session={request.session_id}  q={request.question_key}")

    if not request.raw_answer or not request.raw_answer.strip():
        raise HTTPException(status_code=422, detail="raw_answer cannot be empty")

    if not request.question_text or not request.question_text.strip():
        raise HTTPException(status_code=422, detail="question_text cannot be empty")

    try:
        result = extract_evidence(
            session_id=request.session_id,
            question_key=request.question_key,
            question_text=request.question_text,
            raw_answer=request.raw_answer,
            profile_context=request.profile_context
        )
        logger.info(
            f"[API] Done: tags={result.tags} "
            f"confidence={result.confidence:.2f} "
            f"ambiguous={result.ambiguous}"
        )
        return result

    except Exception as e:
        logger.error(f"[API] Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract/batch", tags=["Extraction"])
def extract_batch(request: BatchExtractionRequest):
    """
    Extract evidence from multiple student answers in one call.
    Useful for processing all Phase 1-3 answers together.

    Returns a list of ParsedResponse objects (one per input).
    Failed extractions return a low-confidence fallback instead of crashing.

    ## Use case
    After a student completes Phase 1-3 (11 questions total),
    M1 sends all 11 answers here in one batch call.
    """
    logger.info(f"[API] /extract/batch  count={len(request.requests)}")

    if not request.requests:
        raise HTTPException(status_code=422, detail="requests list cannot be empty")

    if len(request.requests) > 20:
        raise HTTPException(status_code=422, detail="Max 20 requests per batch call")

    raw_requests = [
        {
            "session_id": r.session_id,
            "question_key": r.question_key,
            "question_text": r.question_text,
            "raw_answer": r.raw_answer,
            "profile_context": r.profile_context
        }
        for r in request.requests
    ]

    results = batch_extract(raw_requests)

    return {
        "total": len(results),
        "results": [r.model_dump() for r in results],
        "summary": {
            "avg_confidence": round(
                sum(r.confidence for r in results) / len(results), 3
            ),
            "ambiguous_count": sum(1 for r in results if r.ambiguous),
            "needs_verify_count": sum(1 for r in results if r.needs_human_verify),
            "all_tags_found": list(set(
                tag for r in results for tag in r.tags
            ))
        }
    }


# ─────────────────────────────────────────────
# ERROR HANDLERS
# ─────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[API] Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )
