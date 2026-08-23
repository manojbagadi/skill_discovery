"""
Skill Discovery Engine — Open WebUI Tool
SIH 2026 | Production-Grade Tool with 35-Skill Taxonomy & SQLite Session Persistence

Paste this entire file into Open WebUI: Workspace → Tools → +
Then attach it to your "Skill Discovery Mentor" model.
"""

import json
import uuid
import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional


# ============================================================
# TAXONOMY: 35 Skills across 7 Families
# ============================================================

TAXONOMY = [
    {
        "skill_id": "vis_01", "family": "Visual & Product Experience",
        "name": "UI/UX Fundamentals & Wireframing",
        "tags": ["ui_components", "figma", "wireframing", "user_research", "canva"],
        "time_to_first_output": 30, "min_hardware": "mobile_only",
        "starter_task": "Wireframe a 3-screen mobile app flow for a food delivery app in Figma.",
        "week2_task": "Conduct a 3-person usability test on your wireframes and iterate.",
        "cognitive_profile": ["visual", "systematic", "detail_oriented"]
    },
    {
        "skill_id": "vis_02", "family": "Visual & Product Experience",
        "name": "Design Systems & Tokens",
        "tags": ["ui_components", "figma", "design_tokens", "visual_layout", "canva"],
        "time_to_first_output": 45, "min_hardware": "low_spec_pc",
        "starter_task": "Create a mini design system with color palette, typography scale, and 3 reusable components.",
        "week2_task": "Apply your design system to build a 3-page app prototype.",
        "cognitive_profile": ["visual", "systematic", "organized"]
    },
    {
        "skill_id": "vis_03", "family": "Visual & Product Experience",
        "name": "Typography & Hierarchy",
        "tags": ["visual_layout", "poster_formatting", "resume_layout", "canva", "figma"],
        "time_to_first_output": 20, "min_hardware": "mobile_only",
        "starter_task": "Typeset a clean event poster using 2 complementary Google Fonts.",
        "week2_task": "Redesign your resume with strict hierarchy rules.",
        "cognitive_profile": ["visual", "detail_oriented", "aesthetic"]
    },
    {
        "skill_id": "vis_04", "family": "Visual & Product Experience",
        "name": "Figma Components & Auto Layout",
        "tags": ["ui_components", "figma", "canva", "visual_layout"],
        "time_to_first_output": 45, "min_hardware": "low_spec_pc",
        "starter_task": "Create a reusable primary button component with Auto Layout in Figma.",
        "week2_task": "Build a 3-screen mobile app prototype with your component library.",
        "cognitive_profile": ["visual", "systematic", "builder"]
    },
    {
        "skill_id": "vis_05", "family": "Visual & Product Experience",
        "name": "Micro-Interactions & Prototyping",
        "tags": ["ui_components", "figma", "css_animations", "framer"],
        "time_to_first_output": 45, "min_hardware": "low_spec_pc",
        "starter_task": "Prototype an interactive hover and active state transition for a mobile card.",
        "week2_task": "Build a full flow prototype with loading states and micro-feedback.",
        "cognitive_profile": ["visual", "creative", "motion"]
    },
    {
        "skill_id": "vis_06", "family": "Visual & Product Experience",
        "name": "3D Modeling & Spatial Design",
        "tags": ["3d_modeling", "blender", "spline", "threejs", "visual_layout"],
        "time_to_first_output": 60, "min_hardware": "high_spec_pc",
        "starter_task": "Model a simple low-poly character or product in Blender.",
        "week2_task": "Texture and light your model, render a product shot.",
        "cognitive_profile": ["spatial", "creative", "patient"]
    },
    {
        "skill_id": "vis_07", "family": "Visual & Product Experience",
        "name": "Motion Graphics & Video Editing",
        "tags": ["video_editing", "after_effects", "capcut", "motion"],
        "time_to_first_output": 40, "min_hardware": "low_spec_pc",
        "starter_task": "Create a 15-second kinetic typography animation for a quote.",
        "week2_task": "Edit a 2-minute explainer video with transitions and captions.",
        "cognitive_profile": ["visual", "creative", "motion", "storytelling"]
    },
    {
        "skill_id": "front_01", "family": "Frontend & Creative Tech",
        "name": "HTML/CSS Responsive Layouts",
        "tags": ["html", "css", "responsive_design", "visual_layout"],
        "time_to_first_output": 25, "min_hardware": "mobile_only",
        "starter_task": "Build a responsive personal landing page that works on mobile and desktop.",
        "week2_task": "Add a dark mode toggle and smooth scroll navigation.",
        "cognitive_profile": ["visual", "systematic", "builder"]
    },
    {
        "skill_id": "front_02", "family": "Frontend & Creative Tech",
        "name": "JavaScript DOM Manipulation",
        "tags": ["javascript", "html", "css", "interactive"],
        "time_to_first_output": 35, "min_hardware": "low_spec_pc",
        "starter_task": "Build a to-do list app with add/delete/mark-complete using vanilla JS.",
        "week2_task": "Add local storage persistence and a filter system.",
        "cognitive_profile": ["logical", "builder", "interactive"]
    },
    {
        "skill_id": "front_03", "family": "Frontend & Creative Tech",
        "name": "React Component Architecture",
        "tags": ["react", "javascript", "ui_components", "frontend"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Build a reusable card component with props, state, and a like button.",
        "week2_task": "Build a mini dashboard with 3 interconnected components sharing state.",
        "cognitive_profile": ["logical", "systematic", "builder"]
    },
    {
        "skill_id": "front_04", "family": "Frontend & Creative Tech",
        "name": "Tailwind Utility Styling",
        "tags": ["html", "css", "tailwindcss", "ui_components", "resume_layout"],
        "time_to_first_output": 25, "min_hardware": "low_spec_pc",
        "starter_task": "Style a dark-mode user profile card using Tailwind CSS utility classes.",
        "week2_task": "Build a responsive landing page with 3 breakpoints.",
        "cognitive_profile": ["visual", "systematic", "builder"]
    },
    {
        "skill_id": "front_05", "family": "Frontend & Creative Tech",
        "name": "Creative Coding & Generative Art",
        "tags": ["p5js", "threejs", "processing", "creative", "visual_layout"],
        "time_to_first_output": 35, "min_hardware": "low_spec_pc",
        "starter_task": "Create a generative art piece where circles spawn on mouse click with random colors.",
        "week2_task": "Build an interactive particle system responding to mouse movement.",
        "cognitive_profile": ["creative", "visual", "mathematical"]
    },
    {
        "skill_id": "front_06", "family": "Frontend & Creative Tech",
        "name": "Web Animation & GSAP",
        "tags": ["css_animations", "javascript", "gsap", "motion"],
        "time_to_first_output": 40, "min_hardware": "low_spec_pc",
        "starter_task": "Animate a page transition where content slides in with staggered timing.",
        "week2_task": "Build a scroll-triggered animation sequence for a portfolio page.",
        "cognitive_profile": ["visual", "motion", "detail_oriented"]
    },
    {
        "skill_id": "front_07", "family": "Frontend & Creative Tech",
        "name": "Mobile App Development (React Native / Flutter)",
        "tags": ["react_native", "flutter", "mobile", "frontend"],
        "time_to_first_output": 60, "min_hardware": "low_spec_pc",
        "starter_task": "Build a 2-screen note-taking app with local storage.",
        "week2_task": "Add navigation, a settings screen, and push notification placeholder.",
        "cognitive_profile": ["logical", "builder", "systematic"]
    },
    {
        "skill_id": "back_01", "family": "Backend & Systems",
        "name": "REST API Design & Development",
        "tags": ["api_design", "nodejs", "python", "backend"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Build a REST API for a book library with GET, POST, PUT, DELETE endpoints.",
        "week2_task": "Add authentication middleware and pagination.",
        "cognitive_profile": ["logical", "systematic", "abstract"]
    },
    {
        "skill_id": "back_02", "family": "Backend & Systems",
        "name": "Database Design & SQL",
        "tags": ["sql", "database", "backend", "systematic"],
        "time_to_first_output": 40, "min_hardware": "low_spec_pc",
        "starter_task": "Design a schema for a university course registration system and write 5 complex queries.",
        "week2_task": "Implement joins, subqueries, and indexing strategy for performance.",
        "cognitive_profile": ["logical", "systematic", "organized"]
    },
    {
        "skill_id": "back_03", "family": "Backend & Systems",
        "name": "Cloud Deployment & DevOps Basics",
        "tags": ["devops", "docker", "aws", "backend", "deployment"],
        "time_to_first_output": 60, "min_hardware": "low_spec_pc",
        "starter_task": "Containerize a simple Python Flask app with Docker and deploy it to Render or Railway.",
        "week2_task": "Set up CI/CD pipeline with GitHub Actions for auto-deploy.",
        "cognitive_profile": ["systematic", "abstract", "patient"]
    },
    {
        "skill_id": "back_04", "family": "Backend & Systems",
        "name": "Linux & System Administration",
        "tags": ["linux", "bash", "server", "backend", "devops"],
        "time_to_first_output": 35, "min_hardware": "low_spec_pc",
        "starter_task": "Set up a Linux VM, create users, manage permissions, and write a backup bash script.",
        "week2_task": "Configure Nginx as a reverse proxy and set up log rotation.",
        "cognitive_profile": ["systematic", "logical", "patient"]
    },
    {
        "skill_id": "back_05", "family": "Backend & Systems",
        "name": "Cybersecurity & Ethical Hacking",
        "tags": ["cybersecurity", "networking", "linux", "backend"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Perform a basic network scan with Nmap and document open ports and services.",
        "week2_task": "Complete a beginner CTF challenge on TryHackMe.",
        "cognitive_profile": ["logical", "curious", "systematic"]
    },
    {
        "skill_id": "back_06", "family": "Backend & Systems",
        "name": "System Design Fundamentals",
        "tags": ["system_design", "backend", "api_design", "scalability"],
        "time_to_first_output": 45, "min_hardware": "low_spec_pc",
        "starter_task": "Design a URL shortener. Draw the architecture, pick a database, and explain tradeoffs.",
        "week2_task": "Design a chat system. Handle concurrency, message queues, and failover.",
        "cognitive_profile": ["abstract", "systematic", "big_picture"]
    },
    {
        "skill_id": "ai_01", "family": "AI/ML & Data",
        "name": "Python for Data Analysis",
        "tags": ["python", "pandas", "data_analysis", "visualization"],
        "time_to_first_output": 35, "min_hardware": "low_spec_pc",
        "starter_task": "Clean a messy CSV dataset and create 3 insightful visualizations with matplotlib/seaborn.",
        "week2_task": "Build an automated report generator from raw data to PDF.",
        "cognitive_profile": ["logical", "systematic", "curious"]
    },
    {
        "skill_id": "ai_02", "family": "AI/ML & Data",
        "name": "Machine Learning Fundamentals",
        "tags": ["machine_learning", "python", "scikit_learn", "ai"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Train a classifier to predict iris flower species and evaluate with confusion matrix.",
        "week2_task": "Build a real-world classifier on a Kaggle dataset with feature engineering.",
        "cognitive_profile": ["mathematical", "logical", "systematic"]
    },
    {
        "skill_id": "ai_03", "family": "AI/ML & Data",
        "name": "Deep Learning & Neural Networks",
        "tags": ["deep_learning", "pytorch", "tensorflow", "ai", "python"],
        "time_to_first_output": 60, "min_hardware": "high_spec_pc",
        "starter_task": "Build and train a simple feedforward neural network on MNIST from scratch in PyTorch.",
        "week2_task": "Implement a CNN for image classification and visualize learned filters.",
        "cognitive_profile": ["mathematical", "abstract", "patient", "systematic"]
    },
    {
        "skill_id": "ai_04", "family": "AI/ML & Data",
        "name": "Natural Language Processing",
        "tags": ["nlp", "python", "transformers", "ai", "data_analysis"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Build a sentiment analyzer for movie reviews using a pre-trained transformer model.",
        "week2_task": "Fine-tune a small model on custom text classification data.",
        "cognitive_profile": ["linguistic", "logical", "curious"]
    },
    {
        "skill_id": "ai_05", "family": "AI/ML & Data",
        "name": "Computer Vision",
        "tags": ["computer_vision", "opencv", "python", "ai"],
        "time_to_first_output": 45, "min_hardware": "low_spec_pc",
        "starter_task": "Build a face detection script using OpenCV Haar cascades on webcam feed.",
        "week2_task": "Add face recognition to identify known faces vs unknown.",
        "cognitive_profile": ["visual", "mathematical", "logical"]
    },
    {
        "skill_id": "ai_06", "family": "AI/ML & Data",
        "name": "Data Engineering & Pipelines",
        "tags": ["data_engineering", "sql", "python", "etl", "backend"],
        "time_to_first_output": 55, "min_hardware": "low_spec_pc",
        "starter_task": "Build an ETL pipeline that extracts from an API, transforms with pandas, loads to SQLite.",
        "week2_task": "Add scheduling, error handling, and data validation to the pipeline.",
        "cognitive_profile": ["systematic", "logical", "organized"]
    },
    {
        "skill_id": "ai_07", "family": "AI/ML & Data",
        "name": "MLOps & Model Deployment",
        "tags": ["mlops", "docker", "api_design", "ai", "deployment"],
        "time_to_first_output": 60, "min_hardware": "low_spec_pc",
        "starter_task": "Deploy a scikit-learn model as a REST API with Flask and Docker.",
        "week2_task": "Add model versioning, A/B testing, and monitoring dashboard.",
        "cognitive_profile": ["systematic", "logical", "builder"]
    },
    {
        "skill_id": "content_01", "family": "Content & Communication",
        "name": "Technical Writing & Documentation",
        "tags": ["technical_writing", "documentation", "markdown", "communication"],
        "time_to_first_output": 30, "min_hardware": "mobile_only",
        "starter_task": "Rewrite a confusing API documentation page into a clear, example-driven guide.",
        "week2_task": "Write a full onboarding guide for a developer tool.",
        "cognitive_profile": ["linguistic", "systematic", "empathetic"]
    },
    {
        "skill_id": "content_02", "family": "Content & Communication",
        "name": "Content Creation & Storytelling",
        "tags": ["content_creation", "storytelling", "video_editing", "social_media"],
        "time_to_first_output": 35, "min_hardware": "mobile_only",
        "starter_task": "Script and record a 3-minute explainer video on a tech concept you understand.",
        "week2_task": "Create a 5-post content series with consistent visual branding.",
        "cognitive_profile": ["creative", "linguistic", "storytelling"]
    },
    {
        "skill_id": "content_03", "family": "Content & Communication",
        "name": "Community Building & Developer Advocacy",
        "tags": ["community", "developer_relations", "communication", "event_management"],
        "time_to_first_output": 40, "min_hardware": "mobile_only",
        "starter_task": "Write a welcome guide and onboarding flow for a new Discord/Slack community.",
        "week2_task": "Plan and host a virtual meetup or AMA session.",
        "cognitive_profile": ["empathetic", "social", "organized"]
    },
    {
        "skill_id": "content_04", "family": "Content & Communication",
        "name": "Digital Marketing & Growth",
        "tags": ["digital_marketing", "seo", "analytics", "social_media"],
        "time_to_first_output": 35, "min_hardware": "mobile_only",
        "starter_task": "Create a content calendar and write 3 SEO-optimized blog headlines for a tech product.",
        "week2_task": "Run a mock A/B test campaign and analyze click-through data.",
        "cognitive_profile": ["strategic", "creative", "analytical"]
    },
    {
        "skill_id": "content_05", "family": "Content & Communication",
        "name": "Public Speaking & Presentation Design",
        "tags": ["public_speaking", "presentation", "storytelling", "communication"],
        "time_to_first_output": 30, "min_hardware": "mobile_only",
        "starter_task": "Design a 10-slide deck explaining a complex topic to a non-technical audience.",
        "week2_task": "Record yourself presenting and self-critique pacing, clarity, and body language.",
        "cognitive_profile": ["linguistic", "empathetic", "visual"]
    },
    {
        "skill_id": "hw_01", "family": "Hardware & IoT",
        "name": "Arduino & Embedded Programming",
        "tags": ["arduino", "embedded", "c", "iot", "electronics"],
        "time_to_first_output": 40, "min_hardware": "low_spec_pc",
        "starter_task": "Build a temperature monitoring system with Arduino that logs data to serial monitor.",
        "week2_task": "Add LCD display and alert threshold with buzzer.",
        "cognitive_profile": ["builder", "physical", "systematic"]
    },
    {
        "skill_id": "hw_02", "family": "Hardware & IoT",
        "name": "IoT & Sensor Networks",
        "tags": ["iot", "arduino", "python", "networking", "embedded"],
        "time_to_first_output": 50, "min_hardware": "low_spec_pc",
        "starter_task": "Connect a DHT sensor to ESP32 and publish readings to a cloud dashboard via MQTT.",
        "week2_task": "Build a multi-sensor network with centralized data collection.",
        "cognitive_profile": ["builder", "systematic", "logical"]
    },
    {
        "skill_id": "hw_03", "family": "Hardware & IoT",
        "name": "PCB Design & Electronics",
        "tags": ["pcb_design", "electronics", "cad", "hardware"],
        "time_to_first_output": 60, "min_hardware": "low_spec_pc",
        "starter_task": "Design a simple LED driver circuit schematic and layout in KiCad.",
        "week2_task": "Design a full breakout board for a microcontroller.",
        "cognitive_profile": ["spatial", "detail_oriented", "patient"]
    },
    {
        "skill_id": "hw_04", "family": "Hardware & IoT",
        "name": "Robotics & Kinematics",
        "tags": ["robotics", "arduino", "python", "mechanics", "embedded"],
        "time_to_first_output": 60, "min_hardware": "high_spec_pc",
        "starter_task": "Program a 2-servo robotic arm to pick and place an object using inverse kinematics basics.",
        "week2_task": "Add computer vision to the arm for object detection and autonomous grasping.",
        "cognitive_profile": ["spatial", "mathematical", "builder", "patient"]
    },
    {
        "skill_id": "hw_05", "family": "Hardware & IoT",
        "name": "FPGA & Digital Logic Design",
        "tags": ["fpga", "verilog", "digital_logic", "hardware"],
        "time_to_first_output": 60, "min_hardware": "high_spec_pc",
        "starter_task": "Implement a 4-bit adder in Verilog and simulate with testbench waveforms.",
        "week2_task": "Build a simple state machine (traffic light controller) in Verilog.",
        "cognitive_profile": ["logical", "abstract", "detail_oriented"]
    },
]


# ============================================================
# DATABASE LAYER: SQLite Session Persistence
# ============================================================

DB_PATH = "/app/backend/data/skill_engine.db"  # Open WebUI's persistent volume


def _get_db():
    """Get a database connection, creating tables if they don't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            current_phase TEXT DEFAULT 'onboarding',
            responses TEXT DEFAULT '{}',
            matched_skill_id TEXT,
            rhythm_config TEXT,
            audit_log TEXT DEFAULT '[]',
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.commit()
    return conn


# ============================================================
# SCORING ENGINE: Production-Grade Deterministic Math
# ============================================================

HW_LEVELS = {"mobile_only": 1, "low_spec_pc": 2, "high_spec_pc": 3}


def _score_skills(
    interest_tags: List[str],
    procrastination_tags: List[str],
    strength_tags: List[str],
    daily_minutes: int,
    hardware_level: str,
    prior_attempts: str = "",
    energy_pattern: str = ""
) -> List[Dict]:
    """Deterministic scoring engine across the full 35-skill taxonomy."""

    all_learner_tags = set(t.lower().strip() for t in interest_tags + procrastination_tags + strength_tags if t.strip())
    learner_hw = HW_LEVELS.get(hardware_level, 1)
    results = []

    for skill in TAXONOMY:
        skill_tags = set(t.lower() for t in skill.get("tags", []))

        # 1. Interest Fit (40%) — Tag overlap with 1.5x amplifier
        overlap = all_learner_tags.intersection(skill_tags)
        if overlap:
            interest_fit = min(100.0, (len(overlap) / max(1, len(skill_tags))) * 100 * 1.5)
        else:
            # Domain-level fallback: check if any learner tag appears in the family name
            family_lower = skill.get("family", "").lower()
            family_match = any(tag in family_lower for tag in all_learner_tags)
            interest_fit = 25.0 if family_match else 5.0

        # 2. Time Fit (30%) — Linear scaling below threshold
        req_time = skill.get("time_to_first_output", 45)
        if daily_minutes >= req_time:
            time_fit = 100.0
        else:
            time_fit = max(0, (daily_minutes / req_time) * 100)

        # 3. Hardware Fit (30%) — Graduated penalty
        skill_hw = HW_LEVELS.get(skill.get("min_hardware", "low_spec_pc"), 2)
        if learner_hw >= skill_hw:
            hardware_fit = 100.0
        elif learner_hw + 1 >= skill_hw:
            hardware_fit = 50.0
        else:
            hardware_fit = 10.0

        # 4. Prior Attempt Penalty — If they quit something similar, penalize slightly
        prior_penalty = 0
        if prior_attempts:
            prior_lower = prior_attempts.lower()
            if any(tag in prior_lower for tag in skill_tags):
                prior_penalty = 10  # Small penalty, not disqualification

        # Weighted total
        overall = (0.40 * interest_fit) + (0.30 * time_fit) + (0.30 * hardware_fit) - prior_penalty
        overall = max(0, round(overall, 1))

        # Build explanation
        reasons = []
        if overlap:
            reasons.append(f"Matched signals: {', '.join(sorted(overlap))}")
        if daily_minutes < req_time:
            reasons.append(f"Needs {req_time}m/day, you have {daily_minutes}m")
        if learner_hw < skill_hw:
            reasons.append("Hardware might be limiting")
        if prior_penalty > 0:
            reasons.append("You've tried something similar before — it's possible but carries quit-risk")

        results.append({
            "skill_id": skill["skill_id"],
            "skill_name": skill["name"],
            "family": skill["family"],
            "overall_score": overall,
            "breakdown": {
                "interest": round(interest_fit, 1),
                "time": round(time_fit, 1),
                "hardware": round(hardware_fit, 1),
                "prior_penalty": prior_penalty
            },
            "explanation": " | ".join(reasons) if reasons else "General domain exploration",
            "starter_task": skill.get("starter_task", ""),
            "week2_task": skill.get("week2_task", ""),
            "cognitive_profile": skill.get("cognitive_profile", [])
        })

    results.sort(key=lambda x: x["overall_score"], reverse=True)
    return results


# ============================================================
# THE TOOL CLASS: All Functions the LLM Can Call
# ============================================================

class Tools:
    def __init__(self):
        pass

    # ----------------------------------------------------------
    # 1. SESSION MANAGEMENT
    # ----------------------------------------------------------

    def init_session(self, session_id: str, user_id: str) -> str:
        """
        Initialize a new discovery session for a student. Call this at the START of every new conversation.
        :param session_id: A unique session identifier (UUID recommended).
        :param user_id: A user identifier (can be username or UUID).
        :return: JSON confirmation with session details.
        """
        conn = _get_db()
        now = datetime.utcnow().isoformat()
        try:
            conn.execute(
                "INSERT OR IGNORE INTO sessions (session_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (session_id, user_id, now, now)
            )
            conn.commit()
            return json.dumps({"status": "success", "session_id": session_id, "phase": "onboarding"})
        finally:
            conn.close()

    def get_session_summary(self, session_id: str) -> str:
        """
        Retrieve the current state of a session. Call this when a returning user wants to resume.
        :param session_id: The session identifier.
        :return: JSON with current phase, collected responses, matched skill, and rhythm config.
        """
        conn = _get_db()
        try:
            row = conn.execute(
                "SELECT current_phase, responses, matched_skill_id, rhythm_config, audit_log FROM sessions WHERE session_id = ?",
                (session_id,)
            ).fetchone()
            if not row:
                return json.dumps({"status": "error", "message": "Session not found. Start a new session."})
            return json.dumps({
                "status": "success",
                "current_phase": row[0],
                "responses": json.loads(row[1]) if row[1] else {},
                "matched_skill_id": row[2],
                "rhythm_config": json.loads(row[3]) if row[3] else None,
                "audit_entries": len(json.loads(row[4])) if row[4] else 0
            }, indent=2)
        finally:
            conn.close()

    # ----------------------------------------------------------
    # 2. DATA COLLECTION
    # ----------------------------------------------------------

    def save_response(self, session_id: str, question_key: str, answer: str) -> str:
        """
        Save a student's answer to a specific discovery question. Call this AFTER every user answer during Phases 1-3.
        :param session_id: The session identifier.
        :param question_key: The key for this question (e.g., 'procrastination_app', 'flow_activity', 'peer_help', 'creation_preference', 'preferred_classes', 'yesterday_audit', 'recovery_habit', 'past_quit', 'daily_minutes', 'hardware_level', 'energy_pattern').
        :param answer: The student's answer text.
        :return: JSON confirmation.
        """
        conn = _get_db()
        try:
            row = conn.execute("SELECT responses FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not row:
                return json.dumps({"status": "error", "message": "Session not found."})

            responses = json.loads(row[0]) if row[0] else {}
            responses[question_key] = {
                "answer": answer,
                "saved_at": datetime.utcnow().isoformat()
            }
            conn.execute(
                "UPDATE sessions SET responses = ?, updated_at = ? WHERE session_id = ?",
                (json.dumps(responses), datetime.utcnow().isoformat(), session_id)
            )
            conn.commit()
            return json.dumps({
                "status": "saved",
                "question_key": question_key,
                "total_responses": len(responses)
            })
        finally:
            conn.close()

    def advance_phase(self, session_id: str, new_phase: str) -> str:
        """
        Transition the session to a new phase. Call this when all questions in a phase are answered.
        :param session_id: The session identifier.
        :param new_phase: The phase to transition to. Must be one of: 'onboarding', 'domain_filter', 'reality_anchor', 'skill_match', 'experiment_design', 'rhythm_build', 'complete'.
        :return: JSON confirmation with the new phase.
        """
        valid_phases = ["onboarding", "domain_filter", "reality_anchor", "skill_match", "experiment_design", "rhythm_build", "complete"]
        if new_phase not in valid_phases:
            return json.dumps({"status": "error", "message": f"Invalid phase. Must be one of: {valid_phases}"})

        conn = _get_db()
        try:
            conn.execute(
                "UPDATE sessions SET current_phase = ?, updated_at = ? WHERE session_id = ?",
                (new_phase, datetime.utcnow().isoformat(), session_id)
            )
            conn.commit()
            return json.dumps({"status": "phase_changed", "new_phase": new_phase})
        finally:
            conn.close()

    # ----------------------------------------------------------
    # 3. SCORING & MATCHING
    # ----------------------------------------------------------

    def rank_skill_hypotheses(
        self,
        interest_tags: str,
        procrastination_anchors: str,
        perceived_strengths: str,
        daily_available_minutes: int,
        hardware_level: str,
        prior_attempts: str = "",
        energy_pattern: str = ""
    ) -> str:
        """
        Run the deterministic scoring engine across 35 skills and return ranked hypotheses.
        Call this ONLY after collecting all behavioral signals (Phases 1-3 complete).

        :param interest_tags: Comma-separated tags from flow_activity + preferred_classes (e.g., "figma, video_editing, creative").
        :param procrastination_anchors: Comma-separated tags from procrastination_app (e.g., "canva, youtube, figma").
        :param perceived_strengths: Comma-separated tags from peer_help (e.g., "formatting_resumes, fixing_phones").
        :param daily_available_minutes: Integer of realistic daily minutes (e.g., 30).
        :param hardware_level: Must be one of: "mobile_only", "low_spec_pc", "high_spec_pc".
        :param prior_attempts: Description of skills they tried and quit (e.g., "tried coding, gave up after 2 weeks").
        :param energy_pattern: When they have most energy (e.g., "night", "morning").
        :return: JSON with top 5 ranked skill hypotheses including scores, explanations, and starter tasks.
        """
        i_tags = [t.strip() for t in interest_tags.split(",") if t.strip()]
        p_tags = [t.strip() for t in procrastination_anchors.split(",") if t.strip()]
        s_tags = [t.strip() for t in perceived_strengths.split(",") if t.strip()]

        scores = _score_skills(
            interest_tags=i_tags,
            procrastination_tags=p_tags,
            strength_tags=s_tags,
            daily_minutes=daily_available_minutes,
            hardware_level=hardware_level,
            prior_attempts=prior_attempts,
            energy_pattern=energy_pattern
        )

        return json.dumps({
            "status": "success",
            "total_skills_evaluated": len(TAXONOMY),
            "top_hypotheses": scores[:5]
        }, indent=2)

    # ----------------------------------------------------------
    # 4. EXPERIMENT DESIGN
    # ----------------------------------------------------------

    def generate_experiment(self, skill_id: str, daily_available_minutes: int, hardware_level: str) -> str:
        """
        Generate a 2-week experiment plan for a chosen skill hypothesis.
        Call this after the user picks a skill from the ranked hypotheses.

        :param skill_id: The skill_id from the ranked hypotheses (e.g., "vis_04").
        :param daily_available_minutes: Minutes available per day.
        :param hardware_level: "mobile_only", "low_spec_pc", or "high_spec_pc".
        :return: JSON with week1 task, week2 task, validation criteria, and mode settings.
        """
        skill = next((s for s in TAXONOMY if s["skill_id"] == skill_id), None)
        if not skill:
            return json.dumps({"status": "error", "message": f"Skill '{skill_id}' not found in taxonomy."})

        # Adaptive experiment based on time constraints
        if daily_available_minutes < 20:
            intensity = "micro"
            week1_modifier = "Start with just 15 minutes. "
        elif daily_available_minutes < 40:
            intensity = "standard"
            week1_modifier = ""
        else:
            intensity = "deep"
            week1_modifier = "You have enough time for focused deep work. "

        experiment = {
            "status": "success",
            "skill_id": skill_id,
            "skill_name": skill["name"],
            "family": skill["family"],
            "intensity": intensity,
            "week1_task": week1_modifier + skill.get("starter_task", ""),
            "week2_task": skill.get("week2_task", "Continue building on Week 1's work."),
            "validation_criteria": [
                "Did you look forward to the session, or dread it?",
                "Did you lose track of time at least once?",
                "Did you want to keep going when the timer went off?",
                "Did you tell someone about what you built?"
            ],
            "success_signal": "If 2+ of these are YES → this is a real signal, not a fantasy.",
            "pivot_signal": "If 0-1 are YES → we pivot. No guilt. That's exactly what this experiment was for.",
            "daily_minutes": daily_available_minutes,
            "cognitive_profile": skill.get("cognitive_profile", [])
        }

        return json.dumps(experiment, indent=2)

    # ----------------------------------------------------------
    # 5. RHYTHM GENERATION
    # ----------------------------------------------------------

    def generate_rhythm(
        self,
        skill_id: str,
        daily_available_minutes: int,
        energy_pattern: str,
        college_schedule: str = "",
        recovery_habit: str = ""
    ) -> str:
        """
        Generate a flexible weekly rhythm (not a rigid timetable) for the chosen skill.
        Call this after the user confirms the experiment.

        :param skill_id: The chosen skill_id.
        :param daily_available_minutes: Available minutes per day.
        :param energy_pattern: When they have most energy: "morning", "afternoon", "evening", or "night".
        :param college_schedule: Brief description of their college schedule (inferred from yesterday_audit).
        :param recovery_habit: How they recharge (e.g., "sleep", "scroll_social_media", "game").
        :return: JSON with weekly structure, modes, and mode-switch rules.
        """
        skill = next((s for s in TAXONOMY if s["skill_id"] == skill_id), None)
        if not skill:
            return json.dumps({"status": "error", "message": f"Skill '{skill_id}' not found."})

        # Map energy pattern to optimal slot
        energy_slots = {
            "morning": {"input_slot": "7-8 AM (before college)", "output_slot": "Morning weekend"},
            "afternoon": {"input_slot": "2-3 PM (post lunch)", "output_slot": "Afternoon weekend"},
            "evening": {"input_slot": "6-7 PM (after college)", "output_slot": "Evening deep session"},
            "night": {"input_slot": "10-11 PM (night owl mode)", "output_slot": "Late night weekend"}
        }
        slots = energy_slots.get(energy_pattern, energy_slots["evening"])

        # Calculate session structure
        input_minutes = min(daily_available_minutes // 2, 30)
        output_minutes = daily_available_minutes - input_minutes

        rhythm = {
            "status": "success",
            "skill_name": skill["name"],
            "weekly_structure": {
                "weekdays": {
                    "input_sessions": f"{input_minutes} mins × 3 days (Tue/Thu/Sat) — Watch, read, absorb",
                    "output_sessions": f"{output_minutes} mins × 2 days (Wed/Fri) — Build, practice, create",
                    "optimal_time": slots["input_slot"]
                },
                "weekend": {
                    "deep_session": f"1 longer session ({daily_available_minutes * 2} mins) on Saturday — {slots['output_slot']}",
                    "review": "15-minute Sunday review: What worked? What sucked?"
                },
                "rest_days": "Monday and Sunday are guilt-free rest days"
            },
            "modes": {
                "beast_mode": f"Full {daily_available_minutes} mins on all 5 days + weekend deep session",
                "standard_mode": f"{daily_available_minutes} mins on 3 days + weekend session",
                "maintenance_mode": "15 mins on 2 days only — just keep the thread alive",
                "recovery_mode": f"Zero skill work. Recharge via {recovery_habit or 'whatever works'}. Come back tomorrow."
            },
            "mode_switch_rules": [
                "Start in Standard Mode for Week 1.",
                "If you complete 4+ days → upgrade to Beast Mode next week.",
                "If you miss 2 days in a row → downgrade to Maintenance Mode.",
                "If you feel drained 3+ days → switch to Recovery Mode for 2 days.",
                "After Recovery → restart in Standard Mode. Never jump to Beast."
            ],
            "daily_audit_time": "9 PM every day"
        }

        return json.dumps(rhythm, indent=2)

    # ----------------------------------------------------------
    # 6. DAILY TRACKING
    # ----------------------------------------------------------

    def daily_audit(self, session_id: str, did_work: bool, blocker: str = "", notes: str = "") -> str:
        """
        Log a daily check-in entry for the student's experiment.
        Call this during the tracking/complete phase when the student reports their day.

        :param session_id: The session identifier.
        :param did_work: True if they did skill work today, False if not.
        :param blocker: If they didn't work, why: "energy", "time", "forgot", "pointless", "sick", or "".
        :param notes: Any additional notes about their day.
        :return: JSON with logged entry, streak count, and adaptive feedback.
        """
        conn = _get_db()
        try:
            row = conn.execute("SELECT audit_log FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not row:
                return json.dumps({"status": "error", "message": "Session not found."})

            audit_log = json.loads(row[0]) if row[0] else []
            entry = {
                "date": datetime.utcnow().isoformat(),
                "did_work": did_work,
                "blocker": blocker,
                "notes": notes
            }
            audit_log.append(entry)

            conn.execute(
                "UPDATE sessions SET audit_log = ?, updated_at = ? WHERE session_id = ?",
                (json.dumps(audit_log), datetime.utcnow().isoformat(), session_id)
            )
            conn.commit()

            # Calculate streak
            streak = 0
            for e in reversed(audit_log):
                if e.get("did_work"):
                    streak += 1
                else:
                    break

            # Adaptive feedback
            total_days = len(audit_log)
            work_days = sum(1 for e in audit_log if e.get("did_work"))
            completion_rate = round((work_days / max(1, total_days)) * 100, 1)

            # Mode recommendation
            if completion_rate >= 80:
                mode_suggestion = "beast_mode"
            elif completion_rate >= 50:
                mode_suggestion = "standard_mode"
            elif completion_rate >= 20:
                mode_suggestion = "maintenance_mode"
            else:
                mode_suggestion = "recovery_mode"

            # Blocker-specific feedback
            feedback = ""
            if not did_work:
                feedback_map = {
                    "energy": "Low energy is real. Consider switching your skill session to your peak energy time.",
                    "time": "Time crunch happens. Try a 10-minute micro-session tomorrow instead of skipping entirely.",
                    "forgot": "Set a phone alarm for your skill time. Forgetting means it hasn't become a cue yet.",
                    "pointless": "Feeling pointless is important data. If this persists 3+ days, we should consider pivoting to a different skill.",
                    "sick": "Rest first. Health > hustle. Resume when you're ready."
                }
                feedback = feedback_map.get(blocker, "No judgment. Show up tomorrow.")

            return json.dumps({
                "status": "logged",
                "current_streak": streak,
                "total_days": total_days,
                "work_days": work_days,
                "completion_rate": completion_rate,
                "suggested_mode": mode_suggestion,
                "feedback": feedback
            }, indent=2)
        finally:
            conn.close()