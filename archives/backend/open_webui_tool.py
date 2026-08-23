"""
Open WebUI Custom Tool for Skill Discovery Engine
SIH 2026 Hackathon Core Component

How to use in Open WebUI:
1. Go to Workspace -> Tools -> +
2. Paste this code.
3. Enable it for your Skill Discovery Agent.
"""

import json
from pydantic import BaseModel, Field
from typing import List

class Tools:
    def __init__(self): 
        # We define a minimal hardcoded taxonomy here for the tool so it works seamlessly inside Open WebUI without needing external files.
        self.taxonomy = [
            {
                "skill_id": "vis_03",
                "family": "Visual & Product Experience",
                "name": "Typography & Hierarchy",
                "tags": ["visual_layout", "poster_formatting", "resume_layout", "canva", "figma"],
                "time_to_first_output": 30,
                "min_hardware": "mobile_only",
                "starter_task": "Typeset a clean event poster using 2 complementary Google Fonts."
            },
            {
                "skill_id": "vis_04",
                "family": "Visual & Product Experience",
                "name": "Figma Components & Auto Layout",
                "tags": ["ui_components", "figma", "canva", "visual_layout"],
                "time_to_first_output": 45,
                "min_hardware": "low_spec_pc",
                "starter_task": "Create a reusable primary button component with Auto Layout in Figma."
            },
            {
                "skill_id": "vis_05",
                "family": "Visual & Product Experience",
                "name": "Micro-Interactions & Prototyping",
                "tags": ["ui_components", "figma", "css_animations", "framer"],
                "time_to_first_output": 45,
                "min_hardware": "low_spec_pc",
                "starter_task": "Prototype an interactive hover and active state transition for a mobile card."
            },
            {
                "skill_id": "front_04",
                "family": "Frontend & Creative Tech",
                "name": "Tailwind Utility Styling",
                "tags": ["html", "css", "tailwindcss", "ui_components", "resume_layout"],
                "time_to_first_output": 30,
                "min_hardware": "low_spec_pc",
                "starter_task": "Style a dark-mode user profile card using Tailwind CSS utility classes."
            }
            # For the MVP tool, we embed the core subset of the taxonomy to keep the tool standalone.
        ]

    def rank_skill_hypotheses(
        self,
        interest_tags: str,
        procrastination_anchors: str,
        perceived_strengths: str,
        daily_available_minutes: int,
        hardware_level: str
    ) -> str:
        """
        Calculates the cold-start skill score based on extracted student answers and returns top skill hypotheses.
        Call this tool ONLY AFTER collecting all 5 behavioral signals from the student.
        
        :param interest_tags: Comma-separated list of tags representing voluntary explorations (e.g. "video_editing, 3d_modeling").
        :param procrastination_anchors: Comma-separated list of tools used during procrastination (e.g. "canva, figma").
        :param perceived_strengths: Comma-separated list of tasks peers ask help with (e.g. "formatting_resumes").
        :param daily_available_minutes: Integer representing available daily minutes (e.g. 45).
        :param hardware_level: Must be one of: "mobile_only", "low_spec_pc", "high_spec_pc".
        :return: A JSON-formatted string of the top ranked hypotheses to present to the user.
        """
        
        # Combine all tags for interest overlap calculation
        all_tags = []
        for tag_str in [interest_tags, procrastination_anchors, perceived_strengths]:
            if tag_str:
                all_tags.extend([t.strip().lower() for t in tag_str.split(",")])
                
        combined_learner_tags = set(all_tags)
        
        scores = []
        
        for skill in self.taxonomy:
            # 1. Interest Fit
            skill_tags = set(skill["tags"])
            overlap = combined_learner_tags.intersection(skill_tags)
            interest_fit = min(100.0, (len(overlap) / max(1, len(skill_tags))) * 100.0 * 1.5) if combined_learner_tags else 0.0

            # 2. Time Fit
            req_minutes = skill.get("time_to_first_output", 45)
            if daily_available_minutes >= req_minutes:
                time_fit = 100.0
            else:
                ratio = daily_available_minutes / float(req_minutes)
                time_fit = max(0.0, ratio * 100.0)

            # 3. Hardware Fit
            hw_levels = {"mobile_only": 1, "low_spec_pc": 2, "high_spec_pc": 3}
            learner_hw = hw_levels.get(hardware_level, 1)
            skill_req_hw = hw_levels.get(skill.get("min_hardware", "low_spec_pc"), 2)

            if learner_hw >= skill_req_hw:
                hardware_fit = 100.0
            elif learner_hw == 1 and skill_req_hw == 2:
                hardware_fit = 40.0
            else:
                hardware_fit = 10.0

            # Overall Weighted Score
            overall_score = round((0.40 * interest_fit) + (0.30 * time_fit) + (0.30 * hardware_fit), 1)
            
            explanation_parts = []
            if overlap:
                explanation_parts.append(f"Matched signals: {', '.join(overlap)}.")
            else:
                explanation_parts.append("Low direct tag overlap; exploring general domain fit.")
            explanation_parts.append(f"Requires {req_minutes} mins/day ({daily_available_minutes} mins available).")
            
            scores.append({
                "skill_name": skill["name"],
                "family": skill["family"],
                "overall_score": overall_score,
                "breakdown": {
                    "interest": round(interest_fit, 1),
                    "time": round(time_fit, 1),
                    "hardware": round(hardware_fit, 1)
                },
                "explanation": " ".join(explanation_parts),
                "starter_task": skill["starter_task"]
            })
            
        # Rank descending
        scores.sort(key=lambda x: x["overall_score"], reverse=True)
        top_3 = scores[:3]
        
        return json.dumps({"status": "success", "top_hypotheses": top_3}, indent=2)
