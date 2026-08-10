from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="user")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content_type = Column(String, nullable=False)
    original_content = Column(Text, nullable=False)
    source_url = Column(String, nullable=True)

    credibility_score = Column(Float, nullable=True)
    bias_score = Column(Float, nullable=True)
    manipulation_score = Column(Float, nullable=True)

    claims_json = Column(Text, nullable=True)
    bias_details_json = Column(Text, nullable=True)
    factcheck_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_type = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    xp_earned = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)


class SourceRating(Base):
    __tablename__ = "source_ratings"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(String, nullable=True)
    analyses_count = Column(Integer, default=0)
    quizzes_completed = Column(Integer, default=0)
    debates_participated = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)
    badges_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Debate(Base):
    __tablename__ = "debates"

    id = Column(String, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    side_a_label = Column(String, default="For")
    side_b_label = Column(String, default="Against")
    participants_json = Column(Text, default='{"a": [], "b": []}')
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)


class DebateArgument(Base):
    __tablename__ = "debate_arguments"

    id = Column(String, primary_key=True, index=True)
    debate_id = Column(String, ForeignKey("debates.id"), nullable=False)
    username = Column(String, nullable=False)
    side = Column(String, nullable=False)
    argument = Column(Text, nullable=False)
    fact_check_json = Column(Text, nullable=True)
    votes_up = Column(Integer, default=0)
    votes_down = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
