"""add_job_slug

Revision ID: a6486bc274b6
Revises: bdddfb613ea9
Create Date: 2026-08-22 16:23:51.522057
"""
import re
import unicodedata
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a6486bc274b6'
down_revision: Union[str, None] = 'bdddfb613ea9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.strip().lower())
    slug = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    slug = slug.replace("đ", "d")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def upgrade() -> None:
    op.add_column('jobs', sa.Column('slug', sa.String(length=220), nullable=True))

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, title FROM jobs")).fetchall()
    seen: set[str] = set()
    for job_id, title in rows:
        base = _slugify(title) or "job"
        slug = base
        counter = 2
        while slug in seen:
            slug = f"{base}-{counter}"
            counter += 1
        seen.add(slug)
        bind.execute(
            sa.text("UPDATE jobs SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": job_id},
        )

    op.alter_column('jobs', 'slug', nullable=False)
    op.create_index(op.f('ix_jobs_slug'), 'jobs', ['slug'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_jobs_slug'), table_name='jobs')
    op.drop_column('jobs', 'slug')
