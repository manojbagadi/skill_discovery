# llm_client.py — Module R: LLM Parser & NLP Scaffold
# Uses native Groq SDK for Groq provider; OpenAI SDK for others.

import os
import json
import re
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# CONFIG — set via .env file
# ─────────────────────────────────────────────
LLM_PROVIDER   = os.getenv("LLM_PROVIDER", "groq")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
LOCAL_LLM_URL  = os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1")
DEFAULT_MODEL  = os.getenv("LLM_MODEL", "groq/compound-mini")


def _extract_json_from_text(text: str) -> dict:
    """
    Fallback JSON extractor for models that return JSON inside prose or code blocks.
    """
    # Direct parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Inside ```json ... ``` block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # First {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Could not extract valid JSON from response:\n{text[:300]}")


def _call_groq(system_prompt: str, user_message: str, model: str,
               temperature: float, max_tokens: int) -> str:
    """Call Groq using the native Groq SDK."""
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message}
        ],
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content


def _call_openai(system_prompt: str, user_message: str, model: str,
                 temperature: float, max_tokens: int) -> str:
    """Call OpenAI (or local LLM) using the OpenAI SDK."""
    from openai import OpenAI
    if LLM_PROVIDER == "local":
        client = OpenAI(base_url=LOCAL_LLM_URL, api_key="local")
    else:
        client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message}
        ],
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content


def call_llm(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.1,
    max_tokens: int = 500,
    max_retries: int = 3
) -> dict:
    """
    Call the configured LLM and return parsed JSON output.
    Uses native Groq SDK for Groq provider.
    Retries on rate limits and connection errors.
    """
    model = model or DEFAULT_MODEL
    logger.info(f"[LLM] Provider={LLM_PROVIDER} model={model}")

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"[LLM] Attempt {attempt}/{max_retries}")

            if LLM_PROVIDER == "groq":
                raw = _call_groq(system_prompt, user_message, model, temperature, max_tokens)
            else:
                raw = _call_openai(system_prompt, user_message, model, temperature, max_tokens)

            logger.debug(f"[LLM] Raw: {raw[:200]}")
            return json.loads(raw)

        except Exception as e:
            last_error = e
            err_str = str(e)

            if "rate_limit_exceeded" in err_str or "429" in err_str:
                wait = 10 * attempt   # 10s, 20s, 30s
                logger.warning(f"[LLM] Rate limit. Waiting {wait}s...")
                time.sleep(wait)
            elif "connection" in err_str.lower() or "Connection" in err_str:
                wait = 3 * attempt    # 3s, 6s, 9s
                logger.warning(f"[LLM] Connection error. Waiting {wait}s...")
                time.sleep(wait)
            elif "json" in err_str.lower():
                raise ValueError(f"LLM returned non-JSON: {e}")
            else:
                wait = 3
                logger.warning(f"[LLM] Error attempt {attempt}: {e}. Waiting {wait}s...")
                time.sleep(wait)

    raise RuntimeError(f"LLM API call failed after {max_retries} retries: {last_error}")
