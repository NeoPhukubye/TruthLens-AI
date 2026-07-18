from fastapi import APIRouter
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class QuizRequest(BaseModel):
    topic: str = "general"  # general, bias, sources, claims, images
    difficulty: str = "medium"


class QuizOption(BaseModel):
    text: str
    is_correct: bool


class QuizQuestion(BaseModel):
    question: str
    options: list[QuizOption]
    explanation: str
    xp: int


class QuizResponse(BaseModel):
    topic: str
    questions: list[QuizQuestion]


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

    prompt = f"""Generate a media literacy quiz on topic: "{request.topic}"
Difficulty: {request.difficulty}
Generate 5 multiple-choice questions.

Each question should test the user's ability to identify misinformation, bias, or unreliable sources.

Respond in JSON:
{{
  "topic": "{request.topic}",
  "questions": [
    {{
      "question": "Question text",
      "options": [
        {{"text": "Option A", "is_correct": false}},
        {{"text": "Option B", "is_correct": true}},
        {{"text": "Option C", "is_correct": false}},
        {{"text": "Option D", "is_correct": false}}
      ],
      "explanation": "Why the correct answer is right and what to learn from this",
      "xp": 10
    }}
  ]
}}"""

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": "You are a media literacy quiz creator. Create engaging, educational questions that test critical thinking about information. Make questions realistic with headlines or scenarios users might actually encounter."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return QuizResponse(**result)
