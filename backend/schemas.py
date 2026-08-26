from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any

class LearnerEvidenceVector(BaseModel):
    institution_id: int
    interest_tags: List[str] = []
    procrastination_anchors: List[str] = []
    perceived_strengths: List[str] = []
    daily_available_minutes: int = Field(default=45, ge=15, le=240)
    hardware_level: Literal["mobile_only", "low_spec_pc", "high_spec_pc"] = "low_spec_pc"
    uncertain_fields: List[str] = []

class SkillHypothesisScore(BaseModel):
    institution_id: int
    skill_id: str
    skill_name: str
    taxonomy_version: int
    weights_version: int
    overall_score: float = Field(ge=0, le=100)
    interest_score: float = Field(ge=0, le=100)
    time_score: float = Field(ge=0, le=100)
    hardware_score: float = Field(ge=0, le=100)
    experiment_evidence_score: float = Field(ge=0, le=100)
    explanation: str

class ProfileRequest(BaseModel):
    institution_id: int
    answers: List[str]

class PlanTask(BaseModel):
    day: int
    title: str
    description: str
    minutes: int
    tier: Literal["minimum", "standard", "stretch"]
    expected_output: str

class PlanResponse(BaseModel):
    hypothesis_id: str
    template_version: int
    tasks: List[PlanTask]
