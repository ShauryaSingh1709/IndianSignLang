from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.api.auth import get_current_user
from app.models.database_models import User
from app.models.database_models import Lesson, UserProgress
from app.schemas.progress import (
    ProgressCreate,
    ProgressUpdate,
    ProgressResponse,
    UserProgressStats
)

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/stats", response_model=UserProgressStats)
async def get_user_progress_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall progress statistics for current user"""
    
    total_lessons = db.query(Lesson).count()
    completed_lessons = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == True
    ).count()
    
    in_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == False
    ).count()
    
    # Calculate average score
    avg_score = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id
    ).with_entities(
        db.func.avg(UserProgress.score)
    ).scalar() or 0
    
    # Get total XP
    total_xp = current_user.total_xp or 0
    
    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "in_progress": in_progress,
        "completion_rate": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
        "average_score": round(avg_score, 2),
        "total_xp": total_xp,
        "current_streak": current_user.streak_days or 0
    }


@router.get("/lessons", response_model=List[ProgressResponse])
async def get_lesson_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress for all lessons"""
    
    progress_records = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id
    ).all()
    
    return progress_records


@router.get("/lessons/{lesson_id}", response_model=ProgressResponse)
async def get_specific_lesson_progress(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress for a specific lesson"""
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found for this lesson"
        )
    
    return progress


@router.post("/lessons/{lesson_id}", response_model=ProgressResponse)
async def create_or_update_progress(
    lesson_id: int,
    progress_data: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update lesson progress"""
    
    # Check if lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if progress already exists
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if existing_progress:
        # Update existing progress
        existing_progress.score = max(existing_progress.score, progress_data.score)
        existing_progress.completed = progress_data.completed or existing_progress.completed
        existing_progress.time_spent += progress_data.time_spent
        existing_progress.last_accessed = datetime.utcnow()
        
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    else:
        # Create new progress
        new_progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            score=progress_data.score,
            completed=progress_data.completed,
            time_spent=progress_data.time_spent,
            last_accessed=datetime.utcnow()
        )
        
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        
        # Update user XP
        if progress_data.completed:
            xp_earned = lesson.xp_reward or 10
            current_user.total_xp = (current_user.total_xp or 0) + xp_earned
            db.commit()
        
        return new_progress


@router.put("/lessons/{lesson_id}", response_model=ProgressResponse)
async def update_lesson_progress(
    lesson_id: int,
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update existing lesson progress"""
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    # Update fields
    if progress_data.score is not None:
        progress.score = max(progress.score, progress_data.score)
    
    if progress_data.completed is not None:
        was_completed = progress.completed
        progress.completed = progress_data.completed
        
        # Award XP if newly completed
        if progress_data.completed and not was_completed:
            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
            if lesson:
                xp_earned = lesson.xp_reward or 10
                current_user.total_xp = (current_user.total_xp or 0) + xp_earned
    
    if progress_data.time_spent is not None:
        progress.time_spent += progress_data.time_spent
    
    progress.last_accessed = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    
    return progress


@router.delete("/lessons/{lesson_id}")
async def reset_lesson_progress(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset progress for a specific lesson"""
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    db.delete(progress)
    db.commit()
    
    return {"message": "Progress reset successfully"}