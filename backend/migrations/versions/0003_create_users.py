"""create_users

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("role", sa.Enum("hr", "admin", name="userrole"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("google_id", sa.String(length=255), nullable=True),
        sa.Column("company_name", sa.String(length=150), nullable=True),
        sa.Column("avatar", sa.String(length=500), nullable=True),
        sa.Column("status", sa.Enum("pending", "active", "blocked", name="userstatus"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )


def downgrade() -> None:
    op.drop_table("users")
    sa.Enum(name="userrole").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="userstatus").drop(op.get_bind(), checkfirst=True)
