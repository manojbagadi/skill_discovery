from typing import List, Dict, Any, Tuple
import schemas
import models
from sqlalchemy.orm import Session

def compute_interest_score(user_tags: set, skill_tags: set, weight: float) -> float:
    overlap = len(user_tags.intersection(skill_tags))
    if len(skill_tags) == 0:
        return 0.0
    
    score = (overlap / 2.0) * 100.0
    return min(100.0, score) * weight

def compute_time_score(available_mins: int, required_mins: int, weight: float) -> float:
    if required_mins <= 0 or available_mins >= required_mins:
        return 100.0 * weight
    return ((available_mins / required_mins) * 100.0) * weight

def compute_hardware_score(user_hw: str, skill_hw: str, hw_matrix: List[models.HardwareScoreMatrix], weight: float) -> float:
    # Use database matrix
    for matrix_row in hw_matrix:
        if matrix_row.user_hw_level == user_hw and matrix_row.skill_hw_level == skill_hw:
            return matrix_row.score * weight
    return 0.0 # fallback

def evaluate_all_skills(evidence: schemas.LearnerEvidenceVector, db: Session) -> List[schemas.SkillHypothesisScore]:
    institution_id = evidence.institution_id
    
    # Load dynamic configurations for the specific institution
    config = db.query(models.ConfigWeights).filter(
        models.ConfigWeights.institution_id == institution_id,
        models.ConfigWeights.is_active == True
    ).order_by(models.ConfigWeights.version.desc()).first()
    
    if not config:
        raise Exception("No active config weights found for institution")
        
    hw_matrix = db.query(models.HardwareScoreMatrix).filter(
        models.HardwareScoreMatrix.institution_id == institution_id
    ).all()
    
    # Load taxonomy from database instead of JSON
    active_skills = db.query(models.SkillTaxonomy).filter(
        models.SkillTaxonomy.institution_id == institution_id,
        models.SkillTaxonomy.is_active == True
    ).all()
    
    user_tags = set(evidence.interest_tags + evidence.procrastination_anchors + evidence.perceived_strengths)
    results = []
    
    for skill in active_skills:
        # Load tags dynamically
        db_tags = db.query(models.Tag).filter(
            models.Tag.skill_id == skill.skill_id,
            models.Tag.is_approved == True
        ).all()
        skill_tags = set([t.tag_name for t in db_tags])
        
        i_score = compute_interest_score(user_tags, skill_tags, config.cold_start_interest)
        t_score = compute_time_score(evidence.daily_available_minutes, skill.time_to_first_output, config.cold_start_time)
        h_score = compute_hardware_score(evidence.hardware_level, skill.min_hardware, hw_matrix, config.cold_start_hardware)
        
        overall = i_score + t_score + h_score
        
        # Raw scores out of 100 for display
        raw_i_score = i_score / config.cold_start_interest if config.cold_start_interest else 0
        raw_t_score = t_score / config.cold_start_time if config.cold_start_time else 0
        raw_h_score = h_score / config.cold_start_hardware if config.cold_start_hardware else 0
        
        results.append(
            schemas.SkillHypothesisScore(
                institution_id=institution_id,
                skill_id=skill.skill_id,
                skill_name=skill.name,
                taxonomy_version=skill.version,
                weights_version=config.version,
                overall_score=overall,
                interest_score=raw_i_score,
                time_score=raw_t_score,
                hardware_score=raw_h_score,
                experiment_evidence_score=0.0,
                explanation=f"Based on real DB taxonomy v{skill.version} and weights v{config.version}. Intersected tags: {list(user_tags.intersection(skill_tags))}"
            )
        )
    
    results.sort(key=lambda x: x.overall_score, reverse=True)
    return results
