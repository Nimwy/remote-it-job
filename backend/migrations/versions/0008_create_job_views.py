"""create_job_views

Revision ID: 0008
Revises: 0007
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "job_views",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("visitor_key", sa.String(length=64), nullable=False),
        sa.Column("viewed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "visitor_key"),
    )


def downgrade() -> None:
    op.drop_table("job_views")
