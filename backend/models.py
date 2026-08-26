from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    created_at = Column(String)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    locale = Column(String, default="en-US")
    created_at = Column(String)

class ConfigWeights(Base):
    __tablename__ = "config_weights"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    version = Column(Integer)
    is_active = Column(Boolean, default=True)
    cold_start_interest = Column(Float)
    cold_start_time = Column(Float)
    cold_start_hardware = Column(Float)
    post_exp_interest = Column(Float)
    post_exp_time = Column(Float)
    post_exp_hardware = Column(Float)
    post_exp_evidence = Column(Float)
    created_at = Column(String)

class HardwareScoreMatrix(Base):
    __tablename__ = "hardware_score_matrix"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    user_hw_level = Column(String)
    skill_hw_level = Column(String)
    score = Column(Float)

class PivotThresholds(Base):
    __tablename__ = "pivot_thresholds"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    deepen_threshold = Column(Float)
    adjust_threshold = Column(Float)

class SkillTaxonomy(Base):
    __tablename__ = "skill_taxonomy"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    version = Column(Integer)
    is_active = Column(Boolean, default=True)
    skill_id = Column(String)
    family = Column(String)
    name = Column(String)
    time_to_first_output = Column(Integer)
    min_hardware = Column(String)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    skill_id = Column(String)
    tag_name = Column(String)
    is_approved = Column(Boolean, default=True)

class TaskTemplate(Base):
    __tablename__ = "task_templates"
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    skill_id = Column(String)
    hardware_level = Column(String)
    minute_band = Column(Integer)
    version = Column(Integer)
    is_active = Column(Boolean, default=True)
    day = Column(Integer)
    title = Column(String)
    description = Column(String)
    expected_output = Column(String)

class LearnerEvidence(Base):
    __tablename__ = "learner_evidence"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    signals = Column(JSON) # e.g. [{"type": "procrastination", "tag": "figma"}, ...]
    daily_available_minutes = Column(Integer)
    hardware_level = Column(String)
    uncertain_fields = Column(JSON)
    created_at = Column(String)

class SkillHypothesis(Base):
    __tablename__ = "skill_hypotheses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    evidence_id = Column(Integer, ForeignKey("learner_evidence.id"))
    taxonomy_version = Column(Integer)
    weights_version = Column(Integer)
    skill_id = Column(String)
    skill_name = Column(String)
    overall_score = Column(Float)
    interest_score = Column(Float)
    time_score = Column(Float)
    hardware_score = Column(Float)
    rank = Column(Integer)
    created_at = Column(String)

class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    hypothesis_id = Column(Integer, ForeignKey("skill_hypotheses.id"))
    template_version = Column(Integer)
    skill_id = Column(String)
    start_date = Column(String)
    status = Column(String)  # active, completed, paused

class ExperimentLog(Base):
    __tablename__ = "experiment_logs"
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    day_number = Column(Integer)
    experience_rating = Column(Integer)
    planned_minutes = Column(Integer)
    actual_minutes = Column(Integer)
    artifact_confirmed = Column(Boolean)
    skip_reason = Column(String, nullable=True)
    friction_type = Column(String, nullable=True)
    note = Column(String, nullable=True)
    logged_at = Column(String)
