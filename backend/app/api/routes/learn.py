from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_client import ai_json_request

router = APIRouter()


class LearnRequest(BaseModel):
    topic: str
    level: str = "beginner"


class LessonStep(BaseModel):
    step_number: int
    title: str
    content: str
    example: str | None = None
    tip: str | None = None


class LearnResponse(BaseModel):
    topic: str
    level: str
    title: str
    introduction: str
    steps: list[LessonStep]
    key_takeaways: list[str]
    practice_exercise: str


@router.post("/lesson", response_model=LearnResponse)
async def get_lesson(request: LearnRequest):
    prompt = f"""Create an educational lesson on media literacy topic: "{request.topic}"
Level: {request.level}

The lesson should teach users HOW to critically evaluate information themselves.
Include practical steps, real examples, and exercises.

Respond in JSON:
{{
  "topic": "{request.topic}",
  "level": "{request.level}",
  "title": "Engaging lesson title",
  "introduction": "Brief intro explaining why this skill matters",
  "steps": [
    {{
      "step_number": 1,
      "title": "Step title",
      "content": "Detailed explanation",
      "example": "Real-world example",
      "tip": "Pro tip"
    }}
  ],
  "key_takeaways": ["takeaway 1", "takeaway 2"],
  "practice_exercise": "An exercise the user can try right now"
}}"""

    result = await ai_json_request(
        system_prompt="You are a media literacy educator. Create engaging, practical lessons that teach critical thinking skills. Make content age-appropriate and actionable.",
        user_prompt=prompt,
        temperature=0.5,
    )
    return LearnResponse(**result)
