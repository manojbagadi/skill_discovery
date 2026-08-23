"""
Skill Discovery Engine - Deterministic Scoring Engine & Pydantic Validation
SIH 2026 Hackathon Core Component
"""

import json
from pathlib import Path
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Pydantic Schemas (Identical to SIH Problem Statement Document)
# ---------------------------------------------------------------------------

class LearnerEvidenceVector(BaseModel):
    interest_tags: List[str] = Field(description="Extracted domain tags matching predefined taxonomy keywords")
    procrastination_anchors: List[str] = Field(description="Tools or activities opened during procrastination")
    perceived_strengths: List[str] = Field(description="Tasks peers request help with or self-identified strengths")
    daily_available_minutes: int = Field(ge=15, le=240, description="Available daily minutes")
    hardware_level: Literal["mobile_only", "low_spec_pc", "high_spec_pc"] = Field(description="Hardware access constraint")
    uncertain_fields: List[str] = Field(default_factory=list, description="Fields needing user clarification")


class SkillHypothesisScore(BaseModel):
    skill_id: str
    skill_name: str
    family: str
    overall_score: float = Field(ge=0, le=100)
    interest_score: float = Field(ge=0, le=100)
    time_score: float = Field(ge=0, le=100)
    hardware_score: float = Field(ge=0, le=100)
    experiment_evidence_score: float = Field(ge=0, le=100)
    explanation: str
    starter_task: str


# ---------------------------------------------------------------------------
# 2. System Prompt Template (For NLU Parsing Layer)
# ---------------------------------------------------------------------------

EXTRACTION_SYSTEM_PROMPT = """
You are an expert NLU parser for the Skill Discovery Engine.
Your job is ONLY to extract evidence tags and constraints from student answers into a structured JSON schema.

RULES:
1. Do NOT suggest skills or give advice. Only parse the text.
2. Map reported interests, tools, and habits into lowercase keyword tags.
3. Classify hardware access into: "mobile_only", "low_spec_pc", or "high_spec_pc".
4. Output MUST conform strictly to the requested JSON schema.

JSON SCHEMA REQUIREMENT:
{
  "interest_tags": ["list", "of", "keywords"],
  "procrastination_anchors": ["list", "of", "tools"],
  "perceived_strengths": ["list", "of", "activities"],
  "daily_available_minutes": integer_between_15_and_240,
  "hardware_level": "mobile_only | low_spec_pc | high_spec_pc",
  "uncertain_fields": []
}
"""


# ---------------------------------------------------------------------------
# 3. Deterministic Scoring Engine
# ---------------------------------------------------------------------------

class ScoringEngine:
    def __init__(self, taxonomy_path: str = "taxonomy.json"):
        path = Path(taxonomy_path)
        if not path.exists():
            # Fallback relative to current script directory
            path = Path(__file__).parent / "taxonomy.json"
        
        with open(path, "r", encoding="utf-8") as f:
            self.taxonomy = json.load(f)
            
        # Build controlled vocabulary set from taxonomy tags
        self.controlled_vocabulary = set()
        for item in self.taxonomy:
            self.controlled_vocabulary.update(item["tags"])

    def validate_and_filter_tags(self, tags: List[str]) -> tuple[List[str], List[str]]:
        """Filters extracted tags against controlled vocabulary."""
        valid_tags = []
        uncertain_tags = []
        for tag in tags:
            tag_clean = tag.lower().strip().replace(" ", "_")
            if tag_clean in self.controlled_vocabulary:
                valid_tags.append(tag_clean)
            else:
                uncertain_tags.append(tag_clean)
        return valid_tags, uncertain_tags

    def calculate_cold_start_score(
        self, learner: LearnerEvidenceVector, skill: dict
    ) -> SkillHypothesisScore:
        """
        Cold-Start Formula (First-time user):
        Cold-Start Score = 0.40 * Interest Fit + 0.30 * Time Feasibility + 0.30 * Hardware Access
        """
        # 1. Interest Fit (Overlap between learner tags & skill tags)
        combined_learner_tags = set(
            learner.interest_tags + learner.procrastination_anchors + learner.perceived_strengths
        )
        skill_tags = set(skill["tags"])
        
        overlap = combined_learner_tags.intersection(skill_tags)
        if combined_learner_tags:
            interest_fit = min(100.0, (len(overlap) / max(1, len(skill_tags))) * 100.0 * 1.5)
        else:
            interest_fit = 0.0

        # 2. Time Feasibility (Can starter task be done within daily minutes?)
        req_minutes = skill.get("time_to_first_output", 45)
        if learner.daily_available_minutes >= req_minutes:
            time_fit = 100.0
        else:
            ratio = learner.daily_available_minutes / float(req_minutes)
            time_fit = max(0.0, ratio * 100.0)

        # 3. Hardware/Tool Access
        hw_levels = {"mobile_only": 1, "low_spec_pc": 2, "high_spec_pc": 3}
        learner_hw = hw_levels.get(learner.hardware_level, 1)
        skill_req_hw = hw_levels.get(skill.get("min_hardware", "low_spec_pc"), 2)

        if learner_hw >= skill_req_hw:
            hardware_fit = 100.0
        elif learner_hw == 1 and skill_req_hw == 2:
            hardware_fit = 40.0  # Mobile attempting basic PC task
        else:
            hardware_fit = 10.0

        # Cold Start Weighting: 40% Interest, 30% Time, 30% Hardware
        overall_score = round(
            (0.40 * interest_fit) + (0.30 * time_fit) + (0.30 * hardware_fit), 1
        )

        explanation_parts = []
        if overlap:
            explanation_parts.append(f"Matched signals: {', '.join(overlap)}.")
        else:
            explanation_parts.append("Low direct tag overlap; exploring general domain fit.")
        explanation_parts.append(f"Requires {req_minutes} mins/day ({learner.daily_available_minutes} mins available).")

        return SkillHypothesisScore(
            skill_id=skill["skill_id"],
            skill_name=skill["name"],
            family=skill["family"],
            overall_score=overall_score,
            interest_score=round(interest_fit, 1),
            time_score=round(time_fit, 1),
            hardware_score=round(hardware_fit, 1),
            experiment_evidence_score=0.0,  # 0.0 for cold start
            explanation=" ".join(explanation_parts),
            starter_task=skill["starter_task"]
        )

    def rank_hypotheses(
        self, learner: LearnerEvidenceVector, top_n: int = 3
    ) -> List[SkillHypothesisScore]:
        """Ranks all taxonomy skills and returns top_n scored hypotheses."""
        scores = []
        for skill in self.taxonomy:
            score_obj = self.calculate_cold_start_score(learner, skill)
            scores.append(score_obj)
        
        # Sort descending by overall_score
        scores.sort(key=lambda x: x.overall_score, reverse=True)
        return scores[:top_n]


# ---------------------------------------------------------------------------
# 4. Self-Test / Verification Execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Testing Skill Discovery Engine Scoring Module...")
    engine = ScoringEngine()

    # Sample Learner Evidence Input
    sample_learner = LearnerEvidenceVector(
        interest_tags=["visual_layout", "ui_components", "css_animations"],
        procrastination_anchors=["canva", "figma"],
        perceived_strengths=["poster_formatting", "resume_layout"],
        daily_available_minutes=45,
        hardware_level="low_spec_pc"
    )

    top_matches = engine.rank_hypotheses(sample_learner, top_n=3)

    print("\n" + "=" * 60)
    print("TOP RANKED SKILL HYPOTHESES FOR SAMPLE LEARNER:")
    print("=" * 60)
    for idx, match in enumerate(top_matches, 1):
        print(f"\n#{idx} {match.skill_name} ({match.family})")
        print(f"   Overall Score : {match.overall_score}/100")
        print(f"   Breakdown     : Interest={match.interest_score} | Time={match.time_score} | Hardware={match.hardware_score}")
        print(f"   Explanation   : {match.explanation}")
        print(f"   Starter Task  : {match.starter_task}")
    print("\n" + "=" * 60)
    print("Test Complete. Scoring engine works deterministically!")
