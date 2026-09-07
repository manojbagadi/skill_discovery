import sys
import os
import json
import logging
from typing import List, Optional
from datetime import datetime

# Ensure local directory is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

import models
import schemas
import scorer

# Module R NLP extraction components
try:
    from parser.extraction_prompt import KNOWN_TAGS
    from parser import extract_evidence, batch_extract, ParsedResponse, HUMAN_VERIFY_THRESHOLD
    MODULE_R_AVAILABLE = True
except Exception as e:
    MODULE_R_AVAILABLE = False
    KNOWN_TAGS = [
        "ui_components", "figma", "wireframing", "canva", "design_tokens", "visual_layout",
        "python", "data_analysis", "sql", "automation", "api", "web_scraping",
        "html", "css", "javascript", "react", "frontend", "backend",
        "git", "debugging", "linux", "cloud", "docker", "testing",
        "content_writing", "technical_writing", "documentation", "storyboarding",
        "game_dev", "3d_modeling", "blender", "audio_editing", "video_editing",
        "machine_learning", "nlp", "computer_vision", "prompt_engineering"
    ]

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("skill_discovery_api")

# ─────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────
DB_PATH = os.path.join(CURRENT_DIR, "sih_skill_discovery.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Skillcraft Discovery Platform API",
    description="Unified API integrating Behavioral NLP Extraction, Dynamic Capacity Scoring, and 5-Day Micro-Experiment Roadmap.",
    version="2.0.0"
)

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
    try:
        if db.query(models.Institution).count() == 0:
            inst = models.Institution(name="National Sandbox University")
            db.add(inst)
            db.commit()
            db.refresh(inst)
            
            # Configure SIH scoring weights (Cold Start: Interest 40%, Time 30%, Hardware 30%)
            weights = models.ConfigWeights(
                institution_id=inst.id, version=1, is_active=True,
                cold_start_interest=0.40, cold_start_time=0.30, cold_start_hardware=0.30,
                post_exp_interest=0.30, post_exp_time=0.15, post_exp_hardware=0.10, post_exp_evidence=0.45
            )
            db.add(weights)
            
            # Hardware Feasibility Matrix (Mobile, Low-Spec Laptop, High-Spec Workstation)
            hw_mappings = [
                ("mobile_only", "mobile_only", 100), ("mobile_only", "low_spec_pc", 20), ("mobile_only", "high_spec_pc", 0),
                ("low_spec_pc", "mobile_only", 100), ("low_spec_pc", "low_spec_pc", 100), ("low_spec_pc", "high_spec_pc", 40),
                ("high_spec_pc", "mobile_only", 100), ("high_spec_pc", "low_spec_pc", 100), ("high_spec_pc", "high_spec_pc", 100),
            ]
            for u_hw, s_hw, s in hw_mappings:
                db.add(models.HardwareScoreMatrix(institution_id=inst.id, user_hw_level=u_hw, skill_hw_level=s_hw, score=s))
                
            # Pivot thresholds for honest reflection
            db.add(models.PivotThresholds(institution_id=inst.id, deepen_threshold=70.0, adjust_threshold=55.0))
            
            # Seed 37 core skills from JSON taxonomy
            TAXONOMY_PATH = os.path.join(CURRENT_DIR, "taxonomy.json")
            if os.path.exists(TAXONOMY_PATH):
                with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
                    tax_data = json.load(f)
                    for skill in tax_data:
                        db_skill = models.SkillTaxonomy(
                            institution_id=inst.id, version=1, is_active=True,
                            skill_id=skill["skill_id"], family=skill.get("family", "Practical Tech"),
                            name=skill["name"], time_to_first_output=skill.get("time_to_first_output", 45),
                            min_hardware=skill.get("min_hardware", "low_spec_pc")
                        )
                        db.add(db_skill)
                        for t in skill.get("tags", []):
                            db.add(models.Tag(institution_id=inst.id, skill_id=skill["skill_id"], tag_name=t, is_approved=True))
                        
            # Seed 5-day action template for UI/UX wireframing
            tasks = [
                {"day": 1, "title": "First Screen in Figma", "description": "Set up a free Figma account. Create one clean mobile screen for a campus canteen app.", "minutes": 30, "expected_output": "Figma share link or screenshot"},
                {"day": 2, "title": "UI Building Blocks", "description": "Add 2 reusable components: a top navigation header and an item card with pricing.", "minutes": 40, "expected_output": "Figma design canvas screenshot"},
                {"day": 3, "title": "Color & Typography Hierarchy", "description": "Choose a 2-color palette (primary + background) and readable font scale. Document your reason.", "minutes": 45, "expected_output": "Side-by-side comparison screen"},
                {"day": 4, "title": "Interactive Click-Through Flow", "description": "Connect your home screen to a checkout screen using Figma prototype connections.", "minutes": 45, "expected_output": "Clickable prototype link"},
                {"day": 5, "title": "Peer Usability Review", "description": "Show your 2-screen flow to one classmate. Note what confused them and write a 3-bullet reflection.", "minutes": 30, "expected_output": "Peer feedback summary"}
            ]
            for t in tasks:
                db.add(models.TaskTemplate(
                    institution_id=inst.id, skill_id="vis_01", hardware_level="low_spec_pc",
                    minute_band=t["minutes"], version=1, is_active=True, day=t["day"],
                    title=t["title"], description=t["description"], expected_output=t["expected_output"]
                ))
                
            db.commit()
            logger.info("Database successfully seeded with SIH benchmark data.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

seed_db()

# ─────────────────────────────────────────────
# NATURAL MENTOR HEURISTIC (1000+ Student Mindset Modeling)
# ─────────────────────────────────────────────
KEYWORD_TAG_MAP = {
    # 1. Video, Reels, Shorts & Social Media
    "reel": ["video_editing", "capcut", "after_effects", "motion"],
    "reels": ["video_editing", "capcut", "after_effects", "motion"],
    "short": ["video_editing", "capcut", "after_effects", "motion"],
    "shorts": ["video_editing", "capcut", "after_effects", "motion"],
    "instagram": ["video_editing", "capcut", "motion", "content_creation"],
    "insta": ["video_editing", "capcut", "motion"],
    "tiktok": ["video_editing", "capcut", "motion"],
    "scroll": ["video_editing", "capcut", "motion"],
    "scrolling": ["video_editing", "capcut", "motion"],
    "video": ["video_editing", "capcut", "after_effects", "motion"],
    "videos": ["video_editing", "capcut", "after_effects", "motion"],
    "edit": ["video_editing", "capcut", "audio_editing"],
    "editing": ["video_editing", "capcut", "audio_editing"],
    "youtube": ["video_editing", "content_creation", "storytelling"],
    "meme": ["video_editing", "content_creation", "visual_layout"],
    "memes": ["video_editing", "content_creation", "visual_layout"],

    # 2. Competitive Gaming & Esports
    "game": ["game_dev", "3d_modeling", "interactive", "python"],
    "games": ["game_dev", "3d_modeling", "interactive", "python"],
    "gaming": ["game_dev", "3d_modeling", "interactive", "python"],
    "bgmi": ["game_dev", "interactive", "python"],
    "pubg": ["game_dev", "interactive", "python"],
    "free fire": ["game_dev", "interactive", "python"],
    "freefire": ["game_dev", "interactive", "python"],
    "valorant": ["game_dev", "interactive", "python"],
    "gta": ["game_dev", "3d_modeling", "interactive"],
    "playstation": ["game_dev", "interactive", "3d_modeling"],
    "cod": ["game_dev", "interactive", "python"],
    "clutch": ["game_dev", "interactive"],
    "squad": ["game_dev", "interactive"],
    "play": ["game_dev", "interactive"],

    # 3. Introspection, Overthinking & Deep Mental Processing (Maps to Technical Writing & Thought Architecture)
    "think": ["technical_writing", "documentation", "storytelling"],
    "thinking": ["technical_writing", "documentation", "storytelling"],
    "thought": ["technical_writing", "documentation", "storytelling"],
    "thoughts": ["technical_writing", "documentation", "storytelling"],
    "overthink": ["technical_writing", "documentation", "storytelling"],
    "overthinking": ["technical_writing", "documentation", "storytelling"],
    "waste": ["technical_writing", "documentation", "storytelling"],
    "wasting": ["technical_writing", "documentation", "storytelling"],
    "myself": ["technical_writing", "documentation", "storytelling"],
    "me": ["technical_writing", "documentation"],
    "alone": ["technical_writing", "documentation"],
    "mind": ["technical_writing", "documentation"],
    "daydream": ["technical_writing", "storytelling"],
    "reflect": ["technical_writing", "documentation"],
    "anxious": ["technical_writing", "documentation"],
    "future": ["technical_writing", "documentation"],

    # 4. Binge-Watching, Anime, Movies & Narrative Fiction
    "anime": ["storytelling", "content_creation", "technical_writing"],
    "naruto": ["storytelling", "content_creation"],
    "manga": ["storytelling", "content_creation"],
    "netflix": ["storytelling", "content_creation", "video_editing"],
    "movie": ["storytelling", "video_editing", "content_creation"],
    "movies": ["storytelling", "video_editing", "content_creation"],
    "series": ["storytelling", "content_creation"],
    "kdrama": ["storytelling", "content_creation"],
    "k-drama": ["storytelling", "content_creation"],
    "story": ["storytelling", "content_creation", "technical_writing"],
    "stories": ["storytelling", "content_creation", "technical_writing"],
    "cinema": ["storytelling", "video_editing"],

    # 5. Sports, Cricket, IPL, Fantasy & Stock Market Numbers
    "cricket": ["data_analysis", "python", "pandas", "visualization"],
    "ipl": ["data_analysis", "python", "pandas", "visualization"],
    "csk": ["data_analysis", "python", "pandas"],
    "rcb": ["data_analysis", "python", "pandas"],
    "stats": ["data_analysis", "python", "pandas", "visualization"],
    "statistics": ["data_analysis", "python", "pandas"],
    "score": ["data_analysis", "python", "pandas"],
    "scores": ["data_analysis", "python", "pandas"],
    "dream11": ["data_analysis", "python", "pandas"],
    "football": ["data_analysis", "python", "visualization"],
    "stock": ["data_analysis", "python", "pandas", "sql"],
    "stocks": ["data_analysis", "python", "pandas", "sql"],
    "market": ["data_analysis", "python", "pandas"],
    "crypto": ["data_analysis", "python", "backend"],
    "excel": ["data_analysis", "sql", "automation"],
    "math": ["data_analysis", "machine_learning", "python"],
    "numbers": ["data_analysis", "python", "pandas"],

    # 6. Automation, Shortcuts & Backend Logic
    "automate": ["automation", "python", "backend", "api_design"],
    "automation": ["automation", "python", "backend", "api_design"],
    "shortcut": ["automation", "python", "backend"],
    "shortcuts": ["automation", "python", "backend"],
    "script": ["python", "automation", "backend"],
    "bot": ["python", "automation", "backend", "api_design"],
    "crawler": ["web_scraping", "python", "automation"],
    "python": ["python", "pandas", "data_analysis", "automation"],
    "backend": ["backend", "api_design", "sql", "database"],
    "database": ["sql", "database", "backend"],
    "sql": ["sql", "database", "data_analysis"],
    "code": ["python", "javascript", "backend", "api_design"],
    "coding": ["python", "javascript", "backend", "frontend"],

    # 7. Hardware, Gadgets, Tinkering & IoT
    "robot": ["robotics", "arduino", "hardware", "embedded"],
    "robots": ["robotics", "arduino", "hardware", "embedded"],
    "arduino": ["arduino", "iot", "electronics", "embedded"],
    "iot": ["iot", "arduino", "networking", "embedded"],
    "hardware": ["hardware", "electronics", "arduino"],
    "circuit": ["electronics", "pcb_design", "hardware"],
    "circuits": ["electronics", "pcb_design", "hardware"],
    "gadget": ["electronics", "arduino", "hardware"],
    "gadgets": ["electronics", "arduino", "hardware"],
    "remote": ["electronics", "hardware", "arduino"],
    "wire": ["electronics", "hardware", "arduino"],
    "sensor": ["iot", "arduino", "hardware"],
    "sensors": ["iot", "arduino", "hardware"],
    "drone": ["robotics", "hardware", "embedded"],

    # 8. Web & Frontend
    "web": ["html", "css", "javascript", "responsive_design"],
    "website": ["html", "css", "javascript", "frontend"],
    "websites": ["html", "css", "javascript", "frontend"],
    "frontend": ["react", "javascript", "html", "css"],
    "react": ["react", "javascript", "frontend", "ui_components"],
    "html": ["html", "css", "responsive_design"],
    "css": ["html", "css", "responsive_design"],

    # 9. Low Energy, Procrastination & "Doing Nothing"
    "lazy": ["technical_writing", "documentation"],
    "nothing": ["technical_writing", "documentation"],
    "sleep": ["technical_writing", "documentation"],
    "sleeping": ["technical_writing", "documentation"],
    "bed": ["technical_writing", "documentation"],
    "bored": ["technical_writing", "documentation"],
    "procrastinate": ["technical_writing", "documentation"],
    "procrastinating": ["technical_writing", "documentation"],

    # 10. Photography, Doodling & Brand Aesthetics
    "photo": ["visual_layout", "canva", "design_tokens"],
    "photos": ["visual_layout", "canva", "design_tokens"],
    "photography": ["visual_layout", "canva"],
    "lightroom": ["visual_layout", "canva"],
    "draw": ["visual_layout", "canva", "storytelling"],
    "drawing": ["visual_layout", "canva"],
    "sketch": ["visual_layout", "canva"],
    "art": ["visual_layout", "canva", "3d_modeling"],
    "poster": ["visual_layout", "poster_formatting", "canva"],
    "canva": ["visual_layout", "poster_formatting", "canva"],
    "aesthetic": ["visual_layout", "design_tokens", "canva"],

    # 11. Audio & Music
    "music": ["audio_editing", "video_editing"],
    "songs": ["audio_editing", "video_editing"],
    "spotify": ["audio_editing", "content_creation"],
    "headphone": ["audio_editing", "video_editing"],
    "headphones": ["audio_editing", "video_editing"],

    # 12. Cybersecurity & System Tinkering
    "hack": ["cybersecurity", "linux", "backend"],
    "hacking": ["cybersecurity", "linux", "backend"],
    "cyber": ["cybersecurity", "linux", "backend"],
    "cybersecurity": ["cybersecurity", "linux", "backend"],
    "kali": ["linux", "cybersecurity", "debugging"],
    "linux": ["linux", "backend", "debugging"],

    # 13. UI/UX & Wireframing (RESERVED STRICTLY FOR EXPLICIT FIGMA / UI / WIREFRAME INPUTS)
    "figma": ["figma", "ui_components", "wireframing"],
    "wireframe": ["figma", "ui_components", "wireframing"],
    "wireframing": ["figma", "ui_components", "wireframing"],
    "ui design": ["figma", "ui_components", "wireframing", "user_research"],
    "ux design": ["figma", "ui_components", "wireframing", "user_research"]
}

import re

def extract_tags_human_heuristic(answers: List[str]) -> schemas.LearnerEvidenceVector:
    joined = " ".join(answers).lower()
    found_tags = set()
    procrastination = []
    strengths = []
    
    # Match multi-word keys first, then single words using word boundaries
    sorted_keys = sorted(KEYWORD_TAG_MAP.keys(), key=lambda k: len(k), reverse=True)
    for kw in sorted_keys:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, joined, re.IGNORECASE):
            found_tags.update(KEYWORD_TAG_MAP[kw])
            if kw in ["reel", "reels", "short", "shorts", "youtube", "anime", "movie", "movies", "game", "games", "bgmi", "netflix", "scroll"]:
                procrastination.append(kw)
            if kw in ["think", "thought", "overthink", "waste", "myself"]:
                procrastination.append("deep introspection")
                strengths.append("reflective thought architecture")
            if kw in ["cricket", "stats", "ipl", "math", "code", "python", "excel"]:
                strengths.append("quantitative analysis")
            if kw in ["gadget", "arduino", "circuit", "hardware"]:
                strengths.append("hands-on engineering")
                
    # Balanced non-biased fallback if nothing recognized
    if not found_tags:
        # Default to universal beginner-friendly web technology, NOT Figma/UI
        found_tags = {"html", "css", "responsive_design", "javascript"}
        procrastination = ["browsing digital content"]
        strengths = ["curiosity to create online"]

    return schemas.LearnerEvidenceVector(
        institution_id=1,
        interest_tags=list(found_tags)[:5],
        procrastination_anchors=procrastination or ["exploring new ideas"],
        perceived_strengths=strengths or ["fast learner"],
        daily_available_minutes=45,
        hardware_level="low_spec_pc",
        uncertain_fields=[]
    )

# ─────────────────────────────────────────────
# CORE API ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/", tags=["Info"])
def read_root():
    return {
        "platform": "Skillcraft Discovery Platform",
        "problem_statement": "SIH26202",
        "status": "online",
        "database": "sqlite_connected",
        "taxonomy_skills_count": 37
    }

@app.get("/health", tags=["Info"])
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": "connected",
        "module_r": "active" if MODULE_R_AVAILABLE else "standalone_mode"
    }

@app.get("/tags", tags=["Info"])
def get_tags():
    return {
        "total": len(KNOWN_TAGS),
        "tags": sorted(KNOWN_TAGS)
    }

@app.post("/parse")
def parse_evidence(req: schemas.ProfileRequest, db: Session = Depends(get_db)):
    """
    Analyzes student answers using AI mentor or smart natural heuristic.
    Extracts authentic tags without synthetic jargon.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    
    if gemini_api_key and not gemini_api_key.startswith("AQ."):
        try:
            from google import genai
            client = genai.Client(api_key=gemini_api_key)
            prompt = f"""
            You are an experienced, warm mentor counseling an engineering student in India to discover practical tech skills.
            Student inputs: {req.answers}
            
            Return strictly a JSON object with this schema:
            {{
                "institution_id": {req.institution_id},
                "interest_tags": ["list of strings from known tech skills"],
                "procrastination_anchors": ["activities they do when relaxing"],
                "perceived_strengths": ["practical qualities they show"],
                "daily_available_minutes": 45,
                "hardware_level": "low_spec_pc",
                "uncertain_fields": []
            }}
            """
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]
            parsed = json.loads(raw.strip())
            return {"type": "evidence", "data": schemas.LearnerEvidenceVector(**parsed).model_dump()}
        except Exception as e:
            logger.warning(f"Cloud LLM call bypassed: {e}. Using deterministic student profile extractor.")
            
    # Deterministic, dependable fallback that never crashes
    evidence = extract_tags_human_heuristic(req.answers)
    return {"type": "evidence", "data": evidence.model_dump()}

@app.post("/score", response_model=List[schemas.SkillHypothesisScore], tags=["Scoring"])
def score_hypothesis(evidence: schemas.LearnerEvidenceVector, db: Session = Depends(get_db)):
    """
    Ranks the 37 skill taxonomy hypotheses based on the student's constraints and interests.
    """
    results = scorer.evaluate_all_skills(evidence, db)
    return results[:3]

@app.post("/plan", response_model=schemas.PlanResponse, tags=["Roadmap"])
def generate_plan(hypothesis: schemas.SkillHypothesisScore, db: Session = Depends(get_db)):
    """
    Generates a 5-day hands-on micro-experiment roadmap tailored to the student's selected skill.
    """
    templates = db.query(models.TaskTemplate).filter(
        models.TaskTemplate.institution_id == hypothesis.institution_id,
        models.TaskTemplate.skill_id == hypothesis.skill_id, 
        models.TaskTemplate.is_active == True
    ).order_by(models.TaskTemplate.day).all()
    
    if templates:
        tasks = [
            schemas.PlanTask(
                day=t.day, title=t.title, description=t.description, 
                minutes=t.minute_band, tier="standard", expected_output=t.expected_output
            ) for t in templates
        ]
        return schemas.PlanResponse(hypothesis_id=hypothesis.skill_id, template_version=templates[0].version, tasks=tasks)
        
    # Structured hands-on practical plan template
    skill_name = hypothesis.skill_name
    fallback_tasks = [
        schemas.PlanTask(
            day=1, title="Tools Setup & Hello World",
            description=f"Install necessary lightweight tools for {skill_name}. Complete your very first working test file or project canvas.",
            minutes=30, tier="standard", expected_output="Screenshot of initial workspace setup"
        ),
        schemas.PlanTask(
            day=2, title="Core Building Blocks",
            description=f"Explore the 2 most important building blocks in {skill_name}. Replicate a beginner exercise step-by-step.",
            minutes=45, tier="standard", expected_output="Completed exercise artifact"
        ),
        schemas.PlanTask(
            day=3, title="50% Sample Remake",
            description=f"Find a standard real-world example of {skill_name}. Rebuild at least 50% of it using your own styling or data.",
            minutes=45, tier="standard", expected_output="Working project clone screenshot or link"
        ),
        schemas.PlanTask(
            day=4, title="Original Micro-Project",
            description=f"Build one mini project from scratch in {skill_name} that solves a small personal or student campus problem.",
            minutes=60, tier="standard", expected_output="Finished mini-project artifact"
        ),
        schemas.PlanTask(
            day=5, title="Peer Demo & Reflection",
            description="Demonstrate your output to a friend or mentor for 5 minutes. Note their feedback and rate your genuine enjoyment.",
            minutes=30, tier="standard", expected_output="Brief 3-bullet reflection & peer review note"
        )
    ]
    return schemas.PlanResponse(hypothesis_id=hypothesis.skill_id, template_version=1, tasks=fallback_tasks)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


