from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from openai import AsyncOpenAI
import uuid

from app.config import get_settings

router = APIRouter()
settings = get_settings()

# In-memory store (replace with DB in production)
debates: dict[str, dict] = {}


class CreateDebateRequest(BaseModel):
    topic: str
    description: str
    side_a_label: str = "For"
    side_b_label: str = "Against"


class JoinDebateRequest(BaseModel):
    username: str
    side: str  # "a" or "b"


class PostArgumentRequest(BaseModel):
    username: str
    side: str
    argument: str


class DebateResponse(BaseModel):
    id: str
    topic: str
    description: str
    side_a_label: str
    side_b_label: str
    participants: dict
    arguments: list
    status: str
    created_at: str
    ai_moderation: list


@router.post("/create")
async def create_debate(request: CreateDebateRequest):
    debate_id = str(uuid.uuid4())[:8]
    debates[debate_id] = {
        "id": debate_id,
        "topic": request.topic,
        "description": request.description,
        "side_a_label": request.side_a_label,
        "side_b_label": request.side_b_label,
        "participants": {"a": [], "b": []},
        "arguments": [],
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "ai_moderation": [],
    }
    return debates[debate_id]


@router.get("/list")
async def list_debates():
    return list(debates.values())


@router.get("/{debate_id}")
async def get_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    return debates[debate_id]


@router.post("/{debate_id}/join")
async def join_debate(debate_id: str, request: JoinDebateRequest):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    debate = debates[debate_id]
    if request.side not in ("a", "b"):
        raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
    if request.username not in debate["participants"][request.side]:
        debate["participants"][request.side].append(request.username)
    return debate


@router.post("/{debate_id}/argue")
async def post_argument(debate_id: str, request: PostArgumentRequest):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debates[debate_id]["status"] != "active":
        raise HTTPException(status_code=400, detail="Debate is no longer active")

    debate = debates[debate_id]
    argument_entry = {
        "id": str(uuid.uuid4())[:8],
        "username": request.username,
        "side": request.side,
        "argument": request.argument,
        "timestamp": datetime.utcnow().isoformat(),
        "fact_check": None,
    }

    # AI fact-check the argument
    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)
    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {
                "role": "system",
                "content": """You are a debate moderator focused on promoting critical thinking and factual accuracy.
When a debater makes an argument, evaluate it for:
1. Logical fallacies (ad hominem, straw man, false dichotomy, etc.)
2. Factual claims that need verification
3. Strength of reasoning
4. Evidence quality

Be constructive and educational. Help debaters improve their arguments.
Respond in JSON.""",
            },
            {
                "role": "user",
                "content": f"""Debate topic: "{debate['topic']}"
This argument is from the "{debate['side_a_label'] if request.side == 'a' else debate['side_b_label']}" side.

Argument: "{request.argument}"

Evaluate this argument. Respond in JSON:
{{
  "quality_score": 0-10,
  "logical_fallacies": ["list any fallacies detected"],
  "factual_claims": ["claims that should be verified"],
  "strength": "weak|moderate|strong",
  "feedback": "constructive feedback to help the debater think more critically",
  "fact_check_notes": "any factual issues or things to verify"
}}""",
            },
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    import json
    fact_check = json.loads(response.choices[0].message.content)
    argument_entry["fact_check"] = fact_check

    debate["arguments"].append(argument_entry)
    return argument_entry


@router.post("/{debate_id}/summarize")
async def summarize_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")

    debate = debates[debate_id]
    if not debate["arguments"]:
        raise HTTPException(status_code=400, detail="No arguments to summarize")

    side_a_args = [a["argument"] for a in debate["arguments"] if a["side"] == "a"]
    side_b_args = [a["argument"] for a in debate["arguments"] if a["side"] == "b"]

    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)
    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {
                "role": "system",
                "content": "You are a fair and balanced debate summarizer. Summarize both sides objectively and identify the strongest arguments from each. Promote critical thinking by highlighting what made arguments strong or weak.",
            },
            {
                "role": "user",
                "content": f"""Summarize this debate.

Topic: "{debate['topic']}"

{debate['side_a_label']} arguments:
{chr(10).join(f'- {a}' for a in side_a_args)}

{debate['side_b_label']} arguments:
{chr(10).join(f'- {a}' for a in side_b_args)}

Respond in JSON:
{{
  "summary": "overall debate summary",
  "side_a_strongest": "strongest argument from side A",
  "side_b_strongest": "strongest argument from side B",
  "key_insights": ["critical thinking insights from this debate"],
  "unresolved_questions": ["questions that need more research"],
  "winner": "a|b|tie",
  "winner_reasoning": "why one side had stronger arguments overall"
}}""",
            },
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    import json
    summary = json.loads(response.choices[0].message.content)
    debate["ai_moderation"].append({"type": "summary", "content": summary, "timestamp": datetime.utcnow().isoformat()})
    return summary


@router.post("/{debate_id}/close")
async def close_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    debates[debate_id]["status"] = "closed"
    return debates[debate_id]


@router.get("/trending/topics")
async def get_trending_topics():
    """Suggest debate topics based on current media literacy themes."""
    return {
        "topics": [
            {"topic": "Should AI-generated content be labeled by law?", "category": "Technology", "heat": "hot"},
            {"topic": "Is social media doing more harm than good for democracy?", "category": "Society", "heat": "hot"},
            {"topic": "Should schools teach media literacy as a core subject?", "category": "Education", "heat": "trending"},
            {"topic": "Can fact-checkers remain truly unbiased?", "category": "Media", "heat": "trending"},
            {"topic": "Is citizen journalism as reliable as traditional news?", "category": "Media", "heat": "new"},
            {"topic": "Should deepfakes be criminalized even for satire?",  "category": "Technology", "heat": "new"},
        ]
    }
