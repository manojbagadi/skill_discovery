from sqlalchemy import create_engine, Column, Integer, String, Float, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    interest_tags = Column(JSON)
    procrastination_anchors = Column(JSON)
    perceived_strengths = Column(JSON)
    daily_available_minutes = Column(Integer)
    hardware_level = Column(String)
    
class SkillHypothesis(Base):
    __tablename__ = "skill_hypotheses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    skill_id = Column(String)
    skill_name = Column(String)
    overall_score = Column(Float)
    starter_task = Column(String)
    status = Column(String, default="active") # active, adjusted, completed
    
class ExperimentLog(Base):
    __tablename__ = "experiment_logs"

    id = Column(Integer, primary_key=True, index=True)
    hypothesis_id = Column(Integer, index=True)
    day_number = Column(Integer)
    minutes_spent = Column(Integer)
    experience_rating = Column(String) # positive, neutral, high-friction
    artifact_produced = Column(String) # url or boolean
    notes = Column(Text, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)
