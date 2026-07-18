from fastapi import APIRouter
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class LearnRequest(BaseModel):
    topic: str  # e.g., "bias detection", "source verification", "image analysis"
    level: str = "beginner"  # beginner, intermediate, advanced


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
    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

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

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": "You are a media literacy educator. Create engaging, practical lessons that teach critical thinking skills. Make content age-appropriate and actionable."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return LearnResponse(**result)
