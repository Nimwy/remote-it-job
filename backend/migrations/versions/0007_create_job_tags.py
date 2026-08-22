"""create_job_tags

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "job_tags",
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"]),
        sa.PrimaryKeyConstraint("job_id", "tag_id"),
    )


def downgrade() -> None:
    op.drop_table("job_tags")
