"""Add source_ratings table with seed data

Revision ID: 002_source_ratings
Revises: 001_initial
Create Date: 2024-01-02 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002_source_ratings"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    source_ratings = op.create_table(
        "source_ratings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("domain", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.bulk_insert(source_ratings, [
        {"domain": "bbc.com", "name": "BBC", "score": 98, "category": "Public Broadcasting"},
        {"domain": "reuters.com", "name": "Reuters", "score": 99, "category": "Wire Service"},
        {"domain": "apnews.com", "name": "Associated Press", "score": 99, "category": "Wire Service"},
        {"domain": "nytimes.com", "name": "New York Times", "score": 90, "category": "Newspaper"},
        {"domain": "theguardian.com", "name": "The Guardian", "score": 88, "category": "Newspaper"},
        {"domain": "wikipedia.org", "name": "Wikipedia", "score": 85, "category": "Encyclopedia"},
        {"domain": "foxnews.com", "name": "Fox News", "score": 65, "category": "Cable News"},
        {"domain": "cnn.com", "name": "CNN", "score": 75, "category": "Cable News"},
        {"domain": "infowars.com", "name": "InfoWars", "score": 10, "category": "Conspiracy"},
        {"domain": "washingtonpost.com", "name": "Washington Post", "score": 88, "category": "Newspaper"},
        {"domain": "aljazeera.com", "name": "Al Jazeera", "score": 82, "category": "International News"},
        {"domain": "nature.com", "name": "Nature", "score": 97, "category": "Scientific Journal"},
        {"domain": "sciencedirect.com", "name": "ScienceDirect", "score": 95, "category": "Scientific Journal"},
        {"domain": "snopes.com", "name": "Snopes", "score": 90, "category": "Fact Checker"},
        {"domain": "politifact.com", "name": "PolitiFact", "score": 88, "category": "Fact Checker"},
        {"domain": "dailymail.co.uk", "name": "Daily Mail", "score": 45, "category": "Tabloid"},
        {"domain": "breitbart.com", "name": "Breitbart", "score": 30, "category": "Partisan Media"},
        {"domain": "buzzfeed.com", "name": "BuzzFeed", "score": 55, "category": "Digital Media"},
        {"domain": "npr.org", "name": "NPR", "score": 92, "category": "Public Broadcasting"},
        {"domain": "economist.com", "name": "The Economist", "score": 91, "category": "Magazine"},
    ])


def downgrade() -> None:
    op.drop_table("source_ratings")
