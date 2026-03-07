from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.database_models import Lesson, Sign, UserProgress, User, DifficultyLevel
from app.services.auth_services import get_current_user
from app.services.gamification import GamificationService

router = APIRouter()
gamification = GamificationService()

class LessonResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    order_index: int
    xp_reward: int
    estimated_minutes: int
    thumbnail_url: Optional[str]
    total_signs: int
    user_progress: Optional[dict] = None
    
    class Config:
        from_attributes = True

class SignResponse(BaseModel):
    id: int
    name: str
    hindi_translation: str
    english_translation: str
    description: str
    video_url: str
    image_url: str
    gif_url: Optional[str]
    model_label: str
    tips: list
    common_mistakes: list
    difficulty_score: float
    
    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    sign_id: int
    accuracy_score: float
    time_spent_seconds: int

@router.get("/", response_model=List[LessonResponse])
async def get_lessons(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lesson).filter(Lesson.is_published == True)
    
    if category:
        query = query.filter(Lesson.category == category)
    if difficulty:
        query = query.filter(Lesson.difficulty == difficulty)
    
    lessons = query.order_by(Lesson.order_index).all()
    
    result = []
    for lesson in lessons:
        # Get user progress for this lesson
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.lesson_id == lesson.id,
            UserProgress.sign_id == None
        ).first()
        
        lesson_dict = {
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "category": lesson.category,
            "difficulty": lesson.difficulty.value,
            "order_index": lesson.order_index,
            "xp_reward": lesson.xp_reward,
            "estimated_minutes": lesson.estimated_minutes,
            "thumbnail_url": lesson.thumbnail_url,
            "total_signs": len(lesson.signs),
            "user_progress": {
                "status": progress.status if progress else "not_started",
                "accuracy_score": progress.accuracy_score if progress else 0,
            } if progress else {"status": "not_started", "accuracy_score": 0}
        }
        result.append(lesson_dict)
    
    return result

@router.get("/{lesson_id}/signs", response_model=List[SignResponse])
async def get_lesson_signs(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    signs = db.query(Sign).filter(
        Sign.lesson_id == lesson_id
    ).order_by(Sign.order_in_lesson).all()
    
    return signs

@router.post("/{lesson_id}/progress")
async def update_progress(
    lesson_id: int,
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find or create progress record
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id,
        UserProgress.sign_id == progress_data.sign_id
    ).first()
    
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            sign_id=progress_data.sign_id,
            status="in_progress"
        )
        db.add(progress)
    
    progress.attempts += 1
    progress.accuracy_score = (
        (progress.accuracy_score * (progress.attempts - 1) + progress_data.accuracy_score) 
        / progress.attempts
    )
    progress.time_spent_seconds += progress_data.time_spent_seconds
    
    if progress.accuracy_score > progress.best_score:
        progress.best_score = progress.accuracy_score
    
    if progress_data.accuracy_score >= 0.7:  # 70% threshold
        progress.status = "completed"
        from datetime import datetime
        progress.completed_at = datetime.utcnow()
    
    db.commit()
    
    # Award XP
    xp_earned = gamification.calculate_xp(progress_data.accuracy_score, lesson_id)
    await gamification.award_xp(current_user.id, xp_earned, db)
    
    # Check achievements
    new_achievements = await gamification.check_achievements(current_user.id, db)
    
    return {
        "message": "Progress updated",
        "xp_earned": xp_earned,
        "new_achievements": new_achievements
    }