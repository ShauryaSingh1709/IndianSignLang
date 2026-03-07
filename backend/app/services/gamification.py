from sqlalchemy.orm import Session
from app.models.database_models import User, Achievement, UserAchievement, UserProgress
from typing import List
import math

class GamificationService:
    
    def calculate_xp(self, accuracy: float, lesson_id: int) -> int:
        """Calculate XP based on accuracy"""
        base_xp = 10
        if accuracy >= 0.95:
            multiplier = 3.0
        elif accuracy >= 0.85:
            multiplier = 2.0
        elif accuracy >= 0.70:
            multiplier = 1.5
        else:
            multiplier = 1.0
        return int(base_xp * multiplier)
    
    async def award_xp(self, user_id: int, xp: int, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp_points += xp
            user.level = self.calculate_level(user.xp_points)
            db.commit()
    
    def calculate_level(self, xp: int) -> int:
        """Level formula: level = floor(sqrt(xp/100)) + 1"""
        return math.floor(math.sqrt(xp / 100)) + 1
    
    async def check_achievements(self, user_id: int, db: Session) -> List[dict]:
        user = db.query(User).filter(User.id == user_id).first()
        new_achievements = []
        
        all_achievements = db.query(Achievement).all()
        earned_ids = {ua.achievement_id for ua in user.achievements}
        
        for achievement in all_achievements:
            if achievement.id in earned_ids:
                continue
            
            earned = False
            
            if achievement.condition_type == "streak":
                earned = user.streak_days >= achievement.condition_value
            elif achievement.condition_type == "signs_learned":
                earned = user.total_signs_learned >= achievement.condition_value
            elif achievement.condition_type == "xp":
                earned = user.xp_points >= achievement.condition_value
            elif achievement.condition_type == "level":
                earned = user.level >= achievement.condition_value
            
            if earned:
                ua = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id
                )
                db.add(ua)
                user.xp_points += achievement.xp_reward
                new_achievements.append({
                    "name": achievement.name,
                    "description": achievement.description,
                    "icon": achievement.icon,
                    "xp_reward": achievement.xp_reward
                })
        
        if new_achievements:
            db.commit()
        
        return new_achievements