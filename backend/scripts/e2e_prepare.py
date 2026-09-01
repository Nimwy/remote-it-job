"""Chuẩn bị database cô lập cho e2e (T-04).

Chạy trong container backend-e2e:
  python -m scripts.e2e_prepare

Việc thực hiện:
  1. Tạo database `remoteit_e2e` nếu chưa tồn tại (kết nối tới DB admin `remoteit`).
  2. Drop + recreate schema trên DB e2e.
  3. Seed dữ liệu demo (admin, HR, categories, tags, jobs) — idempotent.
"""

import os
from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine, text

from app.core.slug import slugify, unique_slug
from app.db.session import SessionLocal, engine
from app.models import Base
from app.models.category import Category
from app.models.job import Job, JobStatus, JobType
from app.models.user import User
from seed import seed
from seed_demo import seed_demo

POSTGRES_ADMIN_URL = os.environ.get(
    "POSTGRES_ADMIN_URL", "postgresql+psycopg2://remoteit:remoteit@db:5432/remoteit"
)
E2E_DATABASE = "remoteit_e2e"


def ensure_database() -> None:
    admin_engine = create_engine(POSTGRES_ADMIN_URL, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": E2E_DATABASE},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{E2E_DATABASE}"'))
                print(f"[e2e_prepare] Created database {E2E_DATABASE}")
            else:
                print(f"[e2e_prepare] Database {E2E_DATABASE} already exists")
    finally:
        admin_engine.dispose()


def seed_pending_job() -> None:
    """Thêm một job chờ duyệt để admin test có dữ liệu xử lý (T-04)."""
    with SessionLocal() as db:
        hr = db.query(User).filter(User.email == "demo.hr@remoteit.vn").first()
        category = db.query(Category).filter(Category.slug == "qa-test").first()
        if not (hr and category):
            return
        if db.query(Job).filter(Job.title == "QA Engineer").first():
            return

        existing = {s for (s,) in db.query(Job.slug).all()}
        base = slugify("QA Engineer")
        db.add(
            Job(
                hr_id=hr.id,
                category_id=category.id,
                title="QA Engineer",
                slug=unique_slug(base, existing),
                job_type=JobType.fulltime,
                location="Việt Nam",
                timezone="UTC+7",
                description="Kiểm thử chất lượng ứng dụng web.",
                requirements="- Kinh nghiệm QA\n- Biết automation test",
                status=JobStatus.pending,
                expires_at=datetime.now(UTC) + timedelta(days=30),
            )
        )
        db.commit()
        print("[e2e_prepare] Seeded pending job 'QA Engineer'")


def prepare() -> None:
    ensure_database()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed()
    seed_demo()
    seed_pending_job()
    print("[e2e_prepare] Done.")


if __name__ == "__main__":
    prepare()
