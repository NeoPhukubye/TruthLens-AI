from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import json

from app.services.ai_client import ai_json_request
from app.prompts import DEBATE_MODERATOR, DEBATE_SUMMARIZER
from app.database import get_db
from app.models.models import Debate, DebateArgument

router = APIRouter()

# In-memory fallback when no database is configured
_memory_debates: dict[str, dict] = {}
_memory_arguments: dict[str, list[dict]] = {}


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
    vote: str


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
    ai_moderation: list = []
    argument_count: int = 0


class DebateSummaryResponse(BaseModel):
    summary: str
    side_a_strongest: str
    side_b_strongest: str
    key_insights: list[str]
    unresolved_questions: list[str]
    winner: str
    winner_reasoning: str


def debate_to_response(debate: Debate, arguments: list[DebateArgument]) -> dict:
    participants = json.loads(debate.participants_json) if debate.participants_json else {"a": [], "b": []}
    args = []
    for arg in arguments:
        fact_check = json.loads(arg.fact_check_json) if arg.fact_check_json else None
        args.append({
            "id": arg.id,
            "username": arg.username,
            "side": arg.side,
            "argument": arg.argument,
            "timestamp": arg.created_at.isoformat() if arg.created_at else "",
            "fact_check": fact_check,
            "votes": {"up": arg.votes_up, "down": arg.votes_down},
        })
    return {
        "id": debate.id,
        "topic": debate.topic,
        "description": debate.description,
        "side_a_label": debate.side_a_label,
        "side_b_label": debate.side_b_label,
        "participants": participants,
        "arguments": args,
        "status": debate.status,
        "created_at": debate.created_at.isoformat() if debate.created_at else "",
        "ai_moderation": [],
        "argument_count": len(args),
    }


@router.post("/create", response_model=DebateResponse)
async def create_debate(request: CreateDebateRequest, db: AsyncSession = Depends(get_db)):
    debate_id = str(uuid.uuid4())[:8]
    
    if db is None:
        # In-memory fallback
        _memory_debates[debate_id] = {
            "id": debate_id, "topic": request.topic, "description": request.description,
            "side_a_label": request.side_a_label, "side_b_label": request.side_b_label,
            "participants": {"a": [], "b": []}, "status": "active",
            "created_at": datetime.utcnow().isoformat(),
        }
        _memory_arguments[debate_id] = []
        return {**_memory_debates[debate_id], "arguments": [], "ai_moderation": [], "argument_count": 0}
    
    debate = Debate(
        id=debate_id,
        topic=request.topic,
        description=request.description,
        side_a_label=request.side_a_label,
        side_b_label=request.side_b_label,
    )
    db.add(debate)
    await db.commit()
    await db.refresh(debate)
    return debate_to_response(debate, [])


@router.get("/list", response_model=list[DebateResponse])
async def list_debates(status: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    if db is None:
        result = list(_memory_debates.values())
        if status:
            result = [d for d in result if d["status"] == status]
        return [
            {**d, "arguments": _memory_arguments.get(d["id"], []), "ai_moderation": [], "argument_count": len(_memory_arguments.get(d["id"], []))}
            for d in result
        ]
    query = select(Debate)
    if status:
        query = query.where(Debate.status == status)
    result = await db.execute(query.order_by(Debate.created_at.desc()))
    debates = result.scalars().all()
    
    responses = []
    for debate in debates:
        args_result = await db.execute(
            select(DebateArgument).where(DebateArgument.debate_id == debate.id).order_by(DebateArgument.created_at)
        )
        args = args_result.scalars().all()
        responses.append(debate_to_response(debate, args))
    return responses


@router.get("/{debate_id}", response_model=DebateResponse)
async def get_debate(debate_id: str, db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        d = _memory_debates[debate_id]
        return {**d, "arguments": _memory_arguments.get(debate_id, []), "ai_moderation": [], "argument_count": len(_memory_arguments.get(debate_id, []))}
    result = await db.execute(select(Debate).where(Debate.id == debate_id))
    debate = result.scalar_one_or_none()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    args_result = await db.execute(
        select(DebateArgument).where(DebateArgument.debate_id == debate_id).order_by(DebateArgument.created_at)
    )
    args = args_result.scalars().all()
    return debate_to_response(debate, args)


@router.get("/{debate_id}/poll")
async def poll_debate(debate_id: str, since: int = Query(0), db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        args = _memory_arguments.get(debate_id, [])
        return {"arguments": args[since:], "total_count": len(args), "status": _memory_debates[debate_id]["status"]}
    result = await db.execute(select(Debate).where(Debate.id == debate_id))
    debate = result.scalar_one_or_none()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    args_result = await db.execute(
        select(DebateArgument).where(DebateArgument.debate_id == debate_id).order_by(DebateArgument.created_at)
    )
    all_args = args_result.scalars().all()
    new_args = all_args[since:]
    return {
        "arguments": [
            {
                "id": a.id, "username": a.username, "side": a.side, "argument": a.argument,
                "timestamp": a.created_at.isoformat() if a.created_at else "",
                "fact_check": json.loads(a.fact_check_json) if a.fact_check_json else None,
                "votes": {"up": a.votes_up, "down": a.votes_down},
            } for a in new_args
        ],
        "total_count": len(all_args),
        "status": debate.status,
    }


@router.post("/{debate_id}/join", response_model=DebateResponse)
async def join_debate(debate_id: str, request: JoinDebateRequest, db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        if request.side not in ("a", "b"):
            raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
        d = _memory_debates[debate_id]
        if request.username not in d["participants"][request.side]:
            d["participants"][request.side].append(request.username)
        return {**d, "arguments": _memory_arguments.get(debate_id, []), "ai_moderation": [], "argument_count": len(_memory_arguments.get(debate_id, []))}
    result = await db.execute(select(Debate).where(Debate.id == debate_id))
    debate = result.scalar_one_or_none()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    if request.side not in ("a", "b"):
        raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
    
    participants = json.loads(debate.participants_json) if debate.participants_json else {"a": [], "b": []}
    if request.username not in participants[request.side]:
        participants[request.side].append(request.username)
        debate.participants_json = json.dumps(participants)
        await db.commit()
        await db.refresh(debate)
    
    args_result = await db.execute(
        select(DebateArgument).where(DebateArgument.debate_id == debate_id).order_by(DebateArgument.created_at)
    )
    args = args_result.scalars().all()
    return debate_to_response(debate, args)


@router.post("/{debate_id}/argue", response_model=ArgumentResponse)
async def post_argument(debate_id: str, request: PostArgumentRequest, db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        debate_data = _memory_debates[debate_id]
        if debate_data["status"] != "active":
            raise HTTPException(status_code=400, detail="Debate is no longer active")
    else:
        result = await db.execute(select(Debate).where(Debate.id == debate_id))
        debate_obj = result.scalar_one_or_none()
        if not debate_obj:
            raise HTTPException(status_code=404, detail="Debate not found")
        if debate_obj.status != "active":
            raise HTTPException(status_code=400, detail="Debate is no longer active")
        debate_data = {"topic": debate_obj.topic, "side_a_label": debate_obj.side_a_label, "side_b_label": debate_obj.side_b_label}

    if request.side not in ("a", "b"):
        raise HTTPException(status_code=400, detail="Side must be 'a' or 'b'")
    if not request.argument.strip():
        raise HTTPException(status_code=400, detail="Argument cannot be empty")

    side_label = debate_data["side_a_label"] if request.side == "a" else debate_data["side_b_label"]
    prompt = f"""Debate topic: "{debate_data['topic']}"
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

    arg_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()

    if db is None:
        arg_entry = {
            "id": arg_id, "username": request.username, "side": request.side,
            "argument": request.argument, "timestamp": now,
            "fact_check": fact_check, "votes": {"up": 0, "down": 0},
        }
        _memory_arguments.setdefault(debate_id, []).append(arg_entry)
        return arg_entry

    db_arg = DebateArgument(
        id=arg_id, debate_id=debate_id, username=request.username,
        side=request.side, argument=request.argument,
        fact_check_json=json.dumps(fact_check),
    )
    db.add(db_arg)
    await db.commit()
    await db.refresh(db_arg)
    return {
        "id": arg_id, "username": request.username, "side": request.side,
        "argument": request.argument,
        "timestamp": db_arg.created_at.isoformat() if db_arg.created_at else now,
        "fact_check": fact_check, "votes": {"up": 0, "down": 0},
    }


@router.post("/{debate_id}/arguments/{argument_id}/vote")
async def vote_argument(debate_id: str, argument_id: str, request: VoteRequest, db: AsyncSession = Depends(get_db)):
    if request.vote not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Vote must be 'up' or 'down'")
    if db is None:
        for arg in _memory_arguments.get(debate_id, []):
            if arg["id"] == argument_id:
                arg["votes"][request.vote] += 1
                return {"votes": arg["votes"]}
        raise HTTPException(status_code=404, detail="Argument not found")
    result = await db.execute(select(DebateArgument).where(DebateArgument.id == argument_id, DebateArgument.debate_id == debate_id))
    arg = result.scalar_one_or_none()
    if not arg:
        raise HTTPException(status_code=404, detail="Argument not found")
    if request.vote == "up":
        arg.votes_up += 1
    else:
        arg.votes_down += 1
    await db.commit()
    return {"votes": {"up": arg.votes_up, "down": arg.votes_down}}


@router.post("/{debate_id}/summarize", response_model=DebateSummaryResponse)
async def summarize_debate(debate_id: str, db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        all_args = _memory_arguments.get(debate_id, [])
        if not all_args:
            raise HTTPException(status_code=400, detail="No arguments to summarize")
        debate_data = _memory_debates[debate_id]
        side_a_args = [a["argument"] for a in all_args if a["side"] == "a"]
        side_b_args = [a["argument"] for a in all_args if a["side"] == "b"]
        topic = debate_data["topic"]
        side_a_label = debate_data["side_a_label"]
        side_b_label = debate_data["side_b_label"]
    else:
        result = await db.execute(select(Debate).where(Debate.id == debate_id))
        debate = result.scalar_one_or_none()
        if not debate:
            raise HTTPException(status_code=404, detail="Debate not found")
        args_result = await db.execute(
            select(DebateArgument).where(DebateArgument.debate_id == debate_id).order_by(DebateArgument.created_at)
        )
        all_args = args_result.scalars().all()
        if not all_args:
            raise HTTPException(status_code=400, detail="No arguments to summarize")
        side_a_args = [a.argument for a in all_args if a.side == "a"]
        side_b_args = [a.argument for a in all_args if a.side == "b"]
        topic = debate.topic
        side_a_label = debate.side_a_label
        side_b_label = debate.side_b_label

    prompt = f"""Summarize this debate.

Topic: "{topic}"

{side_a_label} arguments:
{chr(10).join(f'- {a}' for a in side_a_args)}

{side_b_label} arguments:
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
    return DebateSummaryResponse(**summary)


@router.post("/{debate_id}/close", response_model=DebateResponse)
async def close_debate(debate_id: str, db: AsyncSession = Depends(get_db)):
    if db is None:
        if debate_id not in _memory_debates:
            raise HTTPException(status_code=404, detail="Debate not found")
        _memory_debates[debate_id]["status"] = "closed"
        d = _memory_debates[debate_id]
        return {**d, "arguments": _memory_arguments.get(debate_id, []), "ai_moderation": [], "argument_count": len(_memory_arguments.get(debate_id, []))}
    result = await db.execute(select(Debate).where(Debate.id == debate_id))
    debate = result.scalar_one_or_none()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    debate.status = "closed"
    await db.commit()
    await db.refresh(debate)
    args_result = await db.execute(
        select(DebateArgument).where(DebateArgument.debate_id == debate_id).order_by(DebateArgument.created_at)
    )
    args = args_result.scalars().all()
    return debate_to_response(debate, args)


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
