from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import json

from app.database import get_db
from app.models.models import Analysis, QuizResult, UserProgress, User, Debate, DebateArgument
from app.api.routes.auth import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get or create user progress
    result = await db.execute(select(UserProgress).where(UserProgress.user_id == current_user.id))
    progress = result.scalar_one_or_none()
    if not progress:
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)

    # Get analysis count
    analyses_result = await db.execute(
        select(func.count(Analysis.id)).where(Analysis.user_id == current_user.id)
    )
    analyses_count = analyses_result.scalar() or 0

    # Get quiz stats
    quiz_result = await db.execute(
        select(func.count(QuizResult.id), func.sum(QuizResult.xp_earned)).where(QuizResult.user_id == current_user.id)
    )
    quiz_row = quiz_result.one()
    quizzes_completed = quiz_row[0] or 0
    total_quiz_xp = quiz_row[1] or 0

    # Get weekly activity (last 7 days of analyses)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_result = await db.execute(
        select(Analysis.created_at).where(
            Analysis.user_id == current_user.id,
            Analysis.created_at >= week_ago
        )
    )
    weekly_analyses = weekly_result.scalars().all()
    
    # Group by day of week
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    weekly_data = {d: 0 for d in day_names}
    for dt in weekly_analyses:
        day_name = day_names[dt.weekday()]
        weekly_data[day_name] += 1

    badges = json.loads(progress.badges_json) if progress.badges_json else []

    return {
        "stats": {
            "articles_checked": analyses_count,
            "avg_credibility": 0,  # Will be calculated from actual analyses
            "quizzes_completed": quizzes_completed,
            "lessons_completed": progress.lessons_completed,
            "debates_participated": progress.debates_participated,
            "total_xp": progress.total_xp + total_quiz_xp,
            "level": progress.level,
            "streak_days": progress.streak_days,
        },
        "weekly_activity": [{"day": d, "checks": c} for d, c in weekly_data.items()],
        "badges": badges,
        "level_progress": {
            "current_level": progress.level,
            "current_xp": progress.total_xp + total_quiz_xp,
            "xp_for_next_level": progress.level * 100,
        },
    }


@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserProgress, User.username)
        .join(User, User.id == UserProgress.user_id)
        .order_by(UserProgress.total_xp.desc())
        .limit(20)
    )
    rows = result.all()
    return {
        "leaderboard": [
            {
                "username": row.username,
                "xp": row.UserProgress.total_xp,
                "level": row.UserProgress.level,
                "streak": row.UserProgress.streak_days,
                "badges_count": len(json.loads(row.UserProgress.badges_json)) if row.UserProgress.badges_json else 0,
            }
            for row in rows
        ]
    }
