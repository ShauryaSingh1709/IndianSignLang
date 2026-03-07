from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProgressBase(BaseModel):
    score: int = Field(ge=0, le=100)
    completed: bool = False
    time_spent: int = Field(default=0, ge=0)  # in seconds


class ProgressCreate(ProgressBase):
    pass


class ProgressUpdate(BaseModel):
    score: Optional[int] = Field(None, ge=0, le=100)
    completed: Optional[bool] = None
    time_spent: Optional[int] = Field(None, ge=0)


class ProgressResponse(ProgressBase):
    id: int
    user_id: int
    lesson_id: int
    last_accessed: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class UserProgressStats(BaseModel):
    total_lessons: int
    completed_lessons: int
    in_progress: int
    completion_rate: float
    average_score: float
    total_xp: int
    current_streak: int