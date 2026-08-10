from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json

from app.database import get_db
from app.models.models import UserProgress, User
from app.api.routes.auth import get_current_user

router = APIRouter()

BADGES = [
    {"id": "first_analysis", "name": "First Steps", "description": "Complete your first content analysis", "icon": "search", "requirement": {"analyses_count": 1}},
    {"id": "five_analyses", "name": "Fact Finder", "description": "Complete 5 content analyses", "icon": "shield", "requirement": {"analyses_count": 5}},
    {"id": "quiz_master", "name": "Quiz Master", "description": "Complete 10 quizzes", "icon": "brain", "requirement": {"quizzes_completed": 10}},
    {"id": "debater", "name": "Critical Debater", "description": "Participate in 3 debates", "icon": "message-square", "requirement": {"debates_participated": 3}},
    {"id": "streak_3", "name": "On Fire", "description": "Maintain a 3-day streak", "icon": "flame", "requirement": {"streak_days": 3}},
    {"id": "streak_7", "name": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "trophy", "requirement": {"streak_days": 7}},
    {"id": "level_5", "name": "MIL Apprentice", "description": "Reach Level 5", "icon": "award", "requirement": {"level": 5}},
    {"id": "level_10", "name": "MIL Expert", "description": "Reach Level 10", "icon": "star", "requirement": {"level": 10}},
]

XP_REWARDS = {
    "analysis": 15,
    "quiz_complete": 25,
    "quiz_perfect": 50,
    "debate_argument": 10,
    "lesson_complete": 20,
    "streak_bonus": 5,
}


def calculate_level(xp: int) -> int:
    level = 1
    threshold = 100
    while xp >= threshold:
        level += 1
        xp -= threshold
        threshold = level * 100
    return level


def check_new_badges(progress: UserProgress) -> list[dict]:
    current_badges = json.loads(progress.badges_json) if progress.badges_json else []
    current_badge_ids = {b["id"] for b in current_badges}
    new_badges = []
    
    for badge in BADGES:
        if badge["id"] in current_badge_ids:
            continue
        req = badge["requirement"]
        earned = True
        for key, value in req.items():
            if getattr(progress, key, 0) < value:
                earned = False
                break
        if earned:
            new_badges.append({"id": badge["id"], "name": badge["name"], "earned_at": datetime.utcnow().isoformat()})
    
    return new_badges


class RecordActivityRequest(BaseModel):
    activity_type: str  # "analysis", "quiz", "debate", "lesson"
    xp_earned: int = 0


@router.post("/record-activity")
async def record_activity(request: RecordActivityRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserProgress).where(UserProgress.user_id == current_user.id))
    progress = result.scalar_one_or_none()
    if not progress:
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        await db.flush()

    # Update streak
    today = datetime.utcnow().strftime("%Y-%m-%d")
    if progress.last_activity_date != today:
        yesterday = (datetime.utcnow() - __import__('datetime').timedelta(days=1)).strftime("%Y-%m-%d")
        if progress.last_activity_date == yesterday:
            progress.streak_days += 1
        elif progress.last_activity_date != today:
            progress.streak_days = 1
        progress.last_activity_date = today

    # Update counts
    xp_gain = request.xp_earned or XP_REWARDS.get(request.activity_type, 10)
    if request.activity_type == "analysis":
        progress.analyses_count += 1
        xp_gain = XP_REWARDS["analysis"]
    elif request.activity_type == "quiz":
        progress.quizzes_completed += 1
    elif request.activity_type == "debate":
        progress.debates_participated += 1
        xp_gain = XP_REWARDS["debate_argument"]
    elif request.activity_type == "lesson":
        progress.lessons_completed += 1
        xp_gain = XP_REWARDS["lesson_complete"]

    # Add streak bonus
    if progress.streak_days >= 3:
        xp_gain += XP_REWARDS["streak_bonus"]

    progress.total_xp += xp_gain
    progress.level = calculate_level(progress.total_xp)

    # Check for new badges
    new_badges = check_new_badges(progress)
    if new_badges:
        current_badges = json.loads(progress.badges_json) if progress.badges_json else []
        current_badges.extend(new_badges)
        progress.badges_json = json.dumps(current_badges)

    await db.commit()
    await db.refresh(progress)

    return {
        "xp_earned": xp_gain,
        "total_xp": progress.total_xp,
        "level": progress.level,
        "streak_days": progress.streak_days,
        "new_badges": new_badges,
    }


@router.get("/badges")
async def get_badges(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserProgress).where(UserProgress.user_id == current_user.id))
    progress = result.scalar_one_or_none()
    earned_badges = json.loads(progress.badges_json) if progress and progress.badges_json else []
    earned_ids = {b["id"] for b in earned_badges}

    return {
        "earned": earned_badges,
        "available": [b for b in BADGES if b["id"] not in earned_ids],
        "all_badges": BADGES,
    }


@router.get("/xp-rewards")
async def get_xp_rewards():
    return {"rewards": XP_REWARDS, "level_formula": "Each level requires level_number * 100 XP"}
