# TruthLens AI

**See Beyond the Headlines.**

Empowering youth to verify, understand, and critically evaluate digital information.

## Overview

TruthLens AI is a Media & Information Literacy platform that teaches users *why* something is trustworthy or suspicious, not just a binary verdict. It combines AI-powered analysis with educational content to build critical thinking skills.

## Features

- **AI Claim Analyzer** - Extract claims, facts, entities, and statistics from any content
- **Credibility Score** - Multi-dimensional credibility assessment with explanations
- **Bias Detector** - Identify political bias, emotional manipulation, propaganda, and clickbait
- **Fact Check Assistant** - Verify claims with evidence and learn how to fact-check yourself
- **AI Image Detector** - Analyze images for AI generation and manipulation indicators
- **Source Quality Checker** - Rate websites and domains for reliability
- **Learn Mode** - Step-by-step media literacy lessons with practical exercises
- **Quiz Mode** - Daily quizzes with XP system to gamify learning
- **Dashboard** - Track your critical thinking progress

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Vite, Recharts, Framer Motion |
| Backend | FastAPI, Python, Pydantic, SQLAlchemy |
| Database | PostgreSQL |
| AI | Fireworks AI / OpenAI (configurable) |
| Deployment | Docker, Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- An AI API key (Fireworks AI or OpenAI)

### Quick Start with Docker

```bash
cp .env.example .env
# Edit .env with your AI_API_KEY
docker compose up
```

Frontend: http://localhost:3000
Backend API: http://localhost:8000/docs

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/analyze/` | POST | Analyze content for claims |
| `/api/credibility/` | POST | Get credibility score |
| `/api/bias/` | POST | Detect bias |
| `/api/factcheck/` | POST | Fact-check claims |
| `/api/images/analyze` | POST | Analyze image authenticity |
| `/api/sources/check` | POST | Check source quality |
| `/api/learn/lesson` | POST | Get educational lesson |
| `/api/quiz/generate` | POST | Generate quiz questions |

## Project Structure

```
truthlens-ai/
├── frontend/           # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API client services
│   │   └── lib/        # Utilities
│   └── Dockerfile
├── backend/            # FastAPI + Python
│   ├── app/
│   │   ├── api/routes/ # API route handlers
│   │   ├── models/     # SQLAlchemy models
│   │   ├── database/   # DB session & config
│   │   ├── services/   # Business logic
│   │   ├── agents/     # AI agent logic
│   │   ├── prompts/    # AI prompt templates
│   │   └── utils/      # Shared utilities
│   ├── tests/
│   └── Dockerfile
├── .github/workflows/  # CI/CD
├── docker-compose.yml
└── .env.example
```

## License

MIT
