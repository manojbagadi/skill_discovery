import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, engine, UserProfile, SkillHypothesis, ExperimentLog, Base
from scoring_engine import LearnerEvidenceVector, ScoringEngine

app = FastAPI(title="Skill Discovery Engine API")

# Setup CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

scoring_engine = ScoringEngine(taxonomy_path="taxonomy.json")

# 1. POST Profile Data -> Parse & Score
@app.post("/api/profile/analyze")
def analyze_profile(evidence: LearnerEvidenceVector, db: Session = Depends(get_db)):
    # 1. Filter tags against taxonomy
    valid_interests, uncertain_interests = scoring_engine.validate_and_filter_tags(evidence.interest_tags)
    
    # 2. Get top 3 hypotheses based on cold-start score
    top_matches = scoring_engine.rank_hypotheses(evidence, top_n=3)
    
    # In a real app we'd save to DB here, but for MVP we just return to frontend
    return {
        "status": "success",
        "valid_tags_found": valid_interests,
        "uncertain_tags": uncertain_interests,
        "hypotheses": [match.model_dump() for match in top_matches]
    }

# 2. POST Select Hypothesis -> Start Experiment
@app.post("/api/experiment/start")
def start_experiment(hypothesis_data: dict, db: Session = Depends(get_db)):
    # Basic mock: save hypothesis choice
    new_hypo = SkillHypothesis(
        user_id=1, # Hardcoded for demo
        skill_id=hypothesis_data["skill_id"],
        skill_name=hypothesis_data["skill_name"],
        overall_score=hypothesis_data["overall_score"],
        starter_task=hypothesis_data["starter_task"]
    )
    db.add(new_hypo)
    db.commit()
    db.refresh(new_hypo)
    return {"status": "started", "hypothesis_id": new_hypo.id}

# 3. POST Log Daily Signal
@app.post("/api/experiment/log")
def log_experiment_day(log_data: dict, db: Session = Depends(get_db)):
    new_log = ExperimentLog(
        hypothesis_id=log_data["hypothesis_id"],
        day_number=log_data["day_number"],
        minutes_spent=log_data["minutes_spent"],
        experience_rating=log_data["experience_rating"],
        artifact_produced=log_data.get("artifact_produced", ""),
        notes=log_data.get("notes", "")
    )
    db.add(new_log)
    db.commit()
    return {"status": "logged"}

# 4. GET Dashboard Data
@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Fetch active hypothesis and its logs
    active_hypo = db.query(SkillHypothesis).filter(SkillHypothesis.status == "active").first()
    if not active_hypo:
        return {"status": "no_active_experiment"}
        
    logs = db.query(ExperimentLog).filter(ExperimentLog.hypothesis_id == active_hypo.id).all()
    
    return {
        "active_hypothesis": active_hypo,
        "logs": logs
    }
