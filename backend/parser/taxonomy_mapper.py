# taxonomy_mapper.py — Module R: LLM Parser & NLP Scaffold
# Maps unknown/synonym tags returned by the LLM to the closest known taxonomy tag.

import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# TAG SYNONYM MAP
# Add more synonyms as you discover them during testing.
# Key   = what the LLM might say (lowercase)
# Value = official taxonomy tag to map it to
# ─────────────────────────────────────────────
TAG_SYNONYMS: dict[str, str] = {
    # Visual / Design synonyms
    "design": "visual",
    "art": "creative",
    "photography": "visual",
    "drawing": "illustration",
    "sketching": "illustration",
    "photoshop": "visual",
    "figma": "ui",
    "canva": "visual",
    "graphic design": "visual",
    "3d modeling": "3d",
    "blender": "3d",
    "animation": "motion",
    "after effects": "motion",

    # Frontend synonyms
    "html": "frontend",
    "javascript": "frontend",
    "typescript": "frontend",
    "website building": "frontend",
    "web design": "ui",
    "responsive design": "css",

    # Backend synonyms
    "coding": "problem-solving",
    "programming": "problem-solving",
    "python": "backend",
    "node": "backend",
    "django": "backend",
    "flask": "backend",
    "fastapi": "backend",
    "sql": "databases",
    "mysql": "databases",
    "mongodb": "databases",
    "rest api": "apis",
    "api building": "apis",

    # AI / ML synonyms
    "machine learning": "ml",
    "deep learning": "ml",
    "neural networks": "ai",
    "data science": "data",
    "data analysis": "data",
    "statistics": "statistics",
    "nlp": "ai",
    "computer vision": "ai",
    "chatgpt": "ai",
    "llm": "ai",

    # Content / Communication synonyms
    "blogging": "writing",
    "copywriting": "writing",
    "youtube": "video",
    "video making": "video",
    "podcasting": "audio",
    "teaching others": "teaching",
    "explaining": "communication",
    "presenting": "communication",
    "social media": "content",
    "community management": "community",

    # Hardware / IoT synonyms
    "arduino": "embedded",
    "raspberry pi": "hardware",
    "circuits": "electronics",
    "soldering": "electronics",
    "robotics": "hardware",
    "iot devices": "iot",
    "microcontrollers": "embedded",

    # General behavioral
    "gaming": "logic",
    "math": "math",
    "science": "logic",
    "solving problems": "problem-solving",
    "fixing bugs": "debugging",
    "research": "research",
    "teamwork": "collaboration",
    "management": "leadership",
    "organizing": "leadership",
    "music": "creative",
    "reading": "research",
}


def map_unknown_tags(unknown_tags: list[str]) -> list[str]:
    """
    Map unknown/synonym tags to nearest known taxonomy tags.

    Args:
        unknown_tags: List of tags returned by LLM that are NOT in KNOWN_TAGS

    Returns:
        List of mapped known taxonomy tags (duplicates removed)
    """
    mapped = []
    for tag in unknown_tags:
        normalized = tag.lower().strip()
        if normalized in TAG_SYNONYMS:
            mapped_tag = TAG_SYNONYMS[normalized]
            mapped.append(mapped_tag)
            logger.info(f"[Mapper] '{tag}' → '{mapped_tag}'")
        else:
            logger.warning(f"[Mapper] No synonym found for unknown tag: '{tag}' — skipping")

    return list(set(mapped))  # Remove duplicates


def get_all_known_tags() -> list[str]:
    """Return all known taxonomy tags (for use in prompts and validation)."""
    from .extraction_prompt import KNOWN_TAGS
    return KNOWN_TAGS
