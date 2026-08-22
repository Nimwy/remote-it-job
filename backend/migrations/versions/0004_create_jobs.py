"""create_jobs

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-23
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hr_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("job_type", sa.Enum("fulltime", "parttime", "freelance", "contract", name="jobtype"), nullable=False),
        sa.Column("location", sa.String(length=150), nullable=True),
        sa.Column("timezone", sa.String(length=50), nullable=True),
        sa.Column("salary_min", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("salary_max", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("currency", sa.String(length=10), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requirements", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("draft", "pending", "approved", "rejected", "closed", "hidden", "expired", name="jobstatus"), nullable=False),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("views", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["hr_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_jobs_slug"), "jobs", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_jobs_slug"), table_name="jobs")
    op.drop_table("jobs")
    sa.Enum(name="jobtype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="jobstatus").drop(op.get_bind(), checkfirst=True)
