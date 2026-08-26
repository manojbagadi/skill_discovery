from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import json
import os

import models
import schemas
import scorer

SQLALCHEMY_DATABASE_URL = "sqlite:///./sih_skill_discovery.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skill Discovery Engine API - SaaS Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_db():
    db = SessionLocal()
    if db.query(models.Institution).count() == 0:
        inst = models.Institution(name="Global Sandbox College")
        db.add(inst)
        db.commit()
        db.refresh(inst)
        
        # Add weights
        weights = models.ConfigWeights(
            institution_id=inst.id, version=1, is_active=True,
            cold_start_interest=0.40, cold_start_time=0.30, cold_start_hardware=0.30,
            post_exp_interest=0.30, post_exp_time=0.15, post_exp_hardware=0.10, post_exp_evidence=0.45
        )
        db.add(weights)
        
        # Add Hardware Matrix
        hw_mappings = [
            ("mobile_only", "mobile_only", 100), ("mobile_only", "low_spec_pc", 0), ("mobile_only", "high_spec_pc", 0),
            ("low_spec_pc", "mobile_only", 100), ("low_spec_pc", "low_spec_pc", 100), ("low_spec_pc", "high_spec_pc", 0),
            ("high_spec_pc", "mobile_only", 100), ("high_spec_pc", "low_spec_pc", 100), ("high_spec_pc", "high_spec_pc", 100),
        ]
        for u_hw, s_hw, s in hw_mappings:
            db.add(models.HardwareScoreMatrix(institution_id=inst.id, user_hw_level=u_hw, skill_hw_level=s_hw, score=s))
            
        # Pivot thresholds
        db.add(models.PivotThresholds(institution_id=inst.id, deepen_threshold=70.0, adjust_threshold=60.0))
        
        # Seed basic taxonomy from JSON
        TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "taxonomy.json")
        with open(TAXONOMY_PATH, "r") as f:
            tax_data = json.load(f)
            for skill in tax_data:
                db_skill = models.SkillTaxonomy(
                    institution_id=inst.id, version=1, is_active=True,
                    skill_id=skill["skill_id"], family=skill["family"], name=skill["name"],
                    time_to_first_output=skill["time_to_first_output"], min_hardware=skill["min_hardware"]
                )
                db.add(db_skill)
                # Seed tags
                for t in skill.get("tags", []):
                    db.add(models.Tag(institution_id=inst.id, skill_id=skill["skill_id"], tag_name=t, is_approved=True))
                    
        # Seed Task Template for vis_01 (UI/UX Fundamentals & Wireframing)
        tasks = [
            {"day": 1, "title": "Figma Setup & First Screen", "description": "Open Figma. Create one screen for a student app homepage.", "minutes": 45, "expected_output": "saved .fig file"},
            {"day": 2, "title": "Components", "description": "Add 2 components: a nav bar and a card.", "minutes": 45, "expected_output": "screenshot"},
            {"day": 3, "title": "Color Palette", "description": "Apply one color palette. Document why you chose it.", "minutes": 45, "expected_output": "short note + screenshot"},
            {"day": 4, "title": "User Flow", "description": "Add one user flow (login → home).", "minutes": 45, "expected_output": "flow screenshot"},
            {"day": 5, "title": "User Testing", "description": "Present your screen to one person. Note their reaction.", "minutes": 45, "expected_output": "written summary"}
        ]
        for t in tasks:
            db.add(models.TaskTemplate(
                institution_id=inst.id, skill_id="vis_01", hardware_level="low_spec_pc",
                minute_band=45, version=1, is_active=True, day=t["day"],
                title=t["title"], description=t["description"], expected_output=t["expected_output"]
            ))
            
        db.commit()
    db.close()

seed_db()

@app.get("/")
def read_root():
    return {"message": "Skill Discovery API Online (SaaS DB-Driven)"}

from google import genai
client = genai.Client(api_key="AQ.Ab8RN6JYm6pUASuwan5t-KyVUfHAludFZAMz5d6rLtyN08EgTg")

@app.post("/parse")
def parse_evidence(req: schemas.ProfileRequest, db: Session = Depends(get_db)):
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=f"""
        You are a human mentor trying to understand a student to help them discover practical skills they might enjoy.
        They are a first/second-year engineering student in India. They are confused about what skill to learn.
        
        Analyze their input. If you have enough information to confidently extract their interests, procrastination anchors, and perceived strengths, return strictly a JSON object with this exact schema (no markdown, no backticks, just raw JSON):
        {{
            "institution_id": {req.institution_id},
            "interest_tags": ["list of strings"],
            "procrastination_anchors": ["list of strings"],
            "perceived_strengths": ["list of strings"],
            "daily_available_minutes": integer (default 45),
            "hardware_level": "mobile_only" or "low_spec_pc" or "high_spec_pc",
            "uncertain_fields": ["list of fields you are unsure about"]
        }}
        
        HOWEVER, if their input is vague, unclear, or you need more information to understand:
        1. What they naturally do when bored/procrastinating
        2. What activities they voluntarily continue for a long time
        3. What kinds of problems people ask them to help with
        4. What they have explored without marks/pressure
        5. Their realistic time/hardware resources
        
        Then DO NOT return JSON. Instead, respond naturally as a mentor, asking ONE clarifying question. Do not explain your methodology. Do not ask generic career questions.
        
        CRITICAL EXCEPTION: If the user becomes frustrated, uncooperative, gives non-answers (like "useless stuff"), or explicitly asks for a timetable/plan, DO NOT ASK ANY MORE QUESTIONS. Break the loop immediately and return the JSON object using whatever limited information you have (even if the tags are empty strings or empty lists). NEVER ask the same question twice.
        
        Student inputs: {req.answers}
        """
        )
        text = response.text.strip()
        
        # Check if the LLM decided to ask a question instead of returning JSON
        if not text.startswith("{") and not text.startswith("```"):
            return {"type": "clarification", "message": text}
            
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        
        data = json.loads(text.strip())
        return {"type": "evidence", "data": schemas.LearnerEvidenceVector(**data).model_dump()}
    except Exception as e:
        print("LLM Parsing Failed:", str(e))
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"LLM Parsing Failed: {str(e)}. Please check if your API key is valid.")



@app.post("/score", response_model=List[schemas.SkillHypothesisScore])
def score_hypothesis(evidence: schemas.LearnerEvidenceVector, db: Session = Depends(get_db)):
    results = scorer.evaluate_all_skills(evidence, db)
    return results[:3] 

@app.post("/plan", response_model=schemas.PlanResponse)
def generate_plan(hypothesis: schemas.SkillHypothesisScore, db: Session = Depends(get_db)):
    templates = db.query(models.TaskTemplate).filter(
        models.TaskTemplate.institution_id == hypothesis.institution_id,
        models.TaskTemplate.skill_id == hypothesis.skill_id, 
        models.TaskTemplate.is_active == True
    ).order_by(models.TaskTemplate.day).all()
    
    if not templates:
        # Provide empty plan if we haven't seeded this specific skill yet
        return schemas.PlanResponse(hypothesis_id=hypothesis.skill_id, template_version=0, tasks=[])
        
    tasks = [
        schemas.PlanTask(
            day=t.day, title=t.title, description=t.description, 
            minutes=t.minute_band, tier="standard", expected_output=t.expected_output
        ) for t in templates
    ]
    
    return schemas.PlanResponse(
        hypothesis_id=hypothesis.skill_id,
        template_version=templates[0].version,
        tasks=tasks
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
