from sqlalchemy import (
    Column, Integer, String, Float, Boolean, 
    DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class DifficultyLevel(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Gamification
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime, nullable=True)
    total_signs_learned = Column(Integer, default=0)
    accuracy_rate = Column(Float, default=0.0)
    
    # Relationships
    progress = relationship("UserProgress", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    category = Column(String(100))
    difficulty = Column(Enum(DifficultyLevel))
    order_index = Column(Integer)
    xp_reward = Column(Integer, default=10)
    estimated_minutes = Column(Integer, default=5)
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True)
    
    # Relationships
    signs = relationship("Sign", back_populates="lesson")
    progress_records = relationship("UserProgress", back_populates="lesson")

class Sign(Base):
    __tablename__ = "signs"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    name = Column(String(100))
    hindi_translation = Column(String(200))
    english_translation = Column(String(200))
    description = Column(Text)
    video_url = Column(String(500))
    image_url = Column(String(500))
    gif_url = Column(String(500), nullable=True)
    model_label = Column(String(100))
    tips = Column(JSON)
    common_mistakes = Column(JSON)
    difficulty_score = Column(Float, default=1.0)
    order_in_lesson = Column(Integer)
    
    lesson = relationship("Lesson", back_populates="signs")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    sign_id = Column(Integer, ForeignKey("signs.id"), nullable=True)
    
    status = Column(String(50), default="not_started")
    accuracy_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    best_score = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress_records")
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text)
    icon = Column(String(500))
    xp_reward = Column(Integer)
    condition_type = Column(String(50))
    condition_value = Column(Integer)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    score = Column(Float)
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    time_taken_seconds = Column(Integer)
    answers_data = Column(JSON)
    
    user = relationship("User", back_populates="quiz_attempts")
    created_at = Column(DateTime, server_default=func.now())