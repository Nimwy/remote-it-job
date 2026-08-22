"""create_user_contacts

Revision ID: 0006
Revises: 0005
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_contacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.Enum("zalo", "telegram", "linkedin", "phone", "email", name="contactchannel"), nullable=False),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "channel"),
    )


def downgrade() -> None:
    op.drop_table("user_contacts")
    sa.Enum(name="contactchannel").drop(op.get_bind(), checkfirst=True)
