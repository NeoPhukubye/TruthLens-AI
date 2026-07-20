from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.services.ai_client import ai_json_request
from app.prompts import DEBATE_MODERATOR, DEBATE_SUMMARIZER

router = APIRouter()

# In-memory store (replace with DB in production)
debates: dict[str, dict] = {}


class CreateDebateRequest(BaseModel):
    topic: str
    description: str
    side_a_label: str = "For"
    side_b_label: str = "Against"


class JoinDebateRequest(BaseModel):
    username: str
    side: str


class PostArgumentRequest(BaseModel):
    username: str
    side: str
    argument: str


class VoteRequest(BaseModel):
    username: str
    vote: str  # "up" or "down"


class FactCheckResult(BaseModel):
    quality_score: float
    logical_fallacies: list[str]
    factual_claims: list[str]
    strength: str
    feedback: str
    fact_check_notes: str


class ArgumentResponse(BaseModel):
    id: str
    username: str
    side: str
    argument: str
    timestamp: str
    fact_check: FactCheckResult | None = None
    votes: dict[str, int] = {"up": 0, "down": 0}


class DebateResponse(BaseModel):
    id: str
    topic: str
    description: str
    side_a_label: str
    side_b_label: str
    participants: dict[str, list[str]]
    arguments: list[ArgumentResponse]
    status: str
    created_at: str
    ai_moderation: list
    argument_count: int = 0


class DebateSummaryResponse(BaseModel):
    summary: str
    side_a_strongest: str
    side_b_strongest: str
    key_insights: list[str]
    unresolved_questions: list[str]
    winner: str
    winner_reasoning: str


@router.post("/create", response_model=DebateResponse)
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
        "argument_count": 0,
    }
    return debates[debate_id]


@router.get("/list", response_model=list[DebateResponse])
async def list_debates(status: str | None = Query(None, description="Filter by status: active or closed")):
    result = list(debates.values())
    if status:
        result = [d for d in result if d["status"] == status]
    return result


@router.get("/{debate_id}", response_model=DebateResponse)
async def get_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    return debates[debate_id]


@router.get("/{debate_id}/poll")
async def poll_debate(debate_id: str, since: int = Query(0, description="Argument index to fetch from")):
    """Polling endpoint - returns only new arguments since the given index."""
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    debate = debates[debate_id]
    return {
        "arguments": debate["arguments"][since:],
        "total_count": len(debate["arguments"]),
        "status": debate["status"],
    }


@router.post("/{debate_id}/join", response_model=DebateResponse)
async def join_debate(debate_id: str, request: JoinDebateRequest):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    debate = debates[debate_id]
    if request.side not in ("a", "b"):
        raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
    if request.username not in debate["participants"][request.side]:
        debate["participants"][request.side].append(request.username)
    return debate


@router.post("/{debate_id}/argue", response_model=ArgumentResponse)
async def post_argument(debate_id: str, request: PostArgumentRequest):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    if debates[debate_id]["status"] != "active":
        raise HTTPException(status_code=400, detail="Debate is no longer active")
    if request.side not in ("a", "b"):
        raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
    if not request.argument.strip():
        raise HTTPException(status_code=400, detail="Argument cannot be empty")

    debate = debates[debate_id]
    argument_entry = {
        "id": str(uuid.uuid4())[:8],
        "username": request.username,
        "side": request.side,
        "argument": request.argument,
        "timestamp": datetime.utcnow().isoformat(),
        "fact_check": None,
        "votes": {"up": 0, "down": 0},
    }

    side_label = debate["side_a_label"] if request.side == "a" else debate["side_b_label"]
    prompt = f"""Debate topic: "{debate['topic']}"
This argument is from the "{side_label}" side.

Argument: "{request.argument}"

Evaluate this argument. Respond in JSON:
{{
  "quality_score": 0-10,
  "logical_fallacies": ["list any fallacies detected"],
  "factual_claims": ["claims that should be verified"],
  "strength": "weak|moderate|strong",
  "feedback": "constructive feedback to help the debater think more critically",
  "fact_check_notes": "any factual issues or things to verify"
}}"""

    fact_check = await ai_json_request(
        system_prompt=DEBATE_MODERATOR,
        user_prompt=prompt,
        temperature=0.3,
    )
    argument_entry["fact_check"] = fact_check

    debate["arguments"].append(argument_entry)
    debate["argument_count"] = len(debate["arguments"])
    return argument_entry


@router.post("/{debate_id}/arguments/{argument_id}/vote")
async def vote_argument(debate_id: str, argument_id: str, request: VoteRequest):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    if request.vote not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Vote must be 'up' or 'down'")

    debate = debates[debate_id]
    for arg in debate["arguments"]:
        if arg["id"] == argument_id:
            arg["votes"][request.vote] += 1
            return {"votes": arg["votes"]}

    raise HTTPException(status_code=404, detail="Argument not found")


@router.post("/{debate_id}/summarize", response_model=DebateSummaryResponse)
async def summarize_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")

    debate = debates[debate_id]
    if not debate["arguments"]:
        raise HTTPException(status_code=400, detail="No arguments to summarize")

    side_a_args = [a["argument"] for a in debate["arguments"] if a["side"] == "a"]
    side_b_args = [a["argument"] for a in debate["arguments"] if a["side"] == "b"]

    prompt = f"""Summarize this debate.

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
}}"""

    summary = await ai_json_request(
        system_prompt=DEBATE_SUMMARIZER,
        user_prompt=prompt,
        temperature=0.3,
    )
    debate["ai_moderation"].append({"type": "summary", "content": summary, "timestamp": datetime.utcnow().isoformat()})
    return DebateSummaryResponse(**summary)


@router.post("/{debate_id}/close", response_model=DebateResponse)
async def close_debate(debate_id: str):
    if debate_id not in debates:
        raise HTTPException(status_code=404, detail="Debate not found")
    debates[debate_id]["status"] = "closed"
    return debates[debate_id]


@router.get("/trending/topics")
async def get_trending_topics():
    return {
        "topics": [
            {"topic": "Should AI-generated content be labeled by law?", "category": "Technology", "heat": "hot"},
            {"topic": "Is social media doing more harm than good for democracy?", "category": "Society", "heat": "hot"},
            {"topic": "Should schools teach media literacy as a core subject?", "category": "Education", "heat": "trending"},
            {"topic": "Can fact-checkers remain truly unbiased?", "category": "Media", "heat": "trending"},
            {"topic": "Is citizen journalism as reliable as traditional news?", "category": "Media", "heat": "new"},
            {"topic": "Should deepfakes be criminalized even for satire?", "category": "Technology", "heat": "new"},
        ]
    }
