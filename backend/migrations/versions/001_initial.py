"""Initial tables: users, analyses, quiz_results

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("username", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "analyses",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("original_content", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("credibility_score", sa.Float(), nullable=True),
        sa.Column("bias_score", sa.Float(), nullable=True),
        sa.Column("manipulation_score", sa.Float(), nullable=True),
        sa.Column("claims_json", sa.Text(), nullable=True),
        sa.Column("bias_details_json", sa.Text(), nullable=True),
        sa.Column("factcheck_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "quiz_results",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("quiz_type", sa.String(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False),
        sa.Column("xp_earned", sa.Integer(), default=0),
        sa.Column("completed_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("quiz_results")
    op.drop_table("analyses")
    op.drop_table("users")
