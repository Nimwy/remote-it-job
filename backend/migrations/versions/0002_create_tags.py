"""create_tags

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("slug", sa.String(length=60), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )


def downgrade() -> None:
    op.drop_table("tags")
