from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_client import ai_json_request

router = APIRouter()


class QuizRequest(BaseModel):
    topic: str = "general"
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

    result = await ai_json_request(
        system_prompt="You are a media literacy quiz creator. Create engaging, educational questions that test critical thinking about information. Make questions realistic with headlines or scenarios users might actually encounter.",
        user_prompt=prompt,
        temperature=0.7,
    )
    return QuizResponse(**result)
