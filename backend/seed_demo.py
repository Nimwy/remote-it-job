from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher

from app.core.slug import slugify, unique_slug
from app.db.session import SessionLocal
from app.models.category import Category
from app.models.contact import ContactChannel, UserContact
from app.models.job import Job, JobStatus, JobType
from app.models.job_tag import JobTag
from app.models.tag import Tag
from app.models.user import User, UserRole, UserStatus

ph = PasswordHasher()


def seed_demo():
    with SessionLocal() as db:
        # HR accounts
        hr = db.query(User).filter(User.email == "demo.hr@remoteit.vn").first()
        if not hr:
            hr = User(
                role=UserRole.hr,
                name="Công ty ABC",
                email="demo.hr@remoteit.vn",
                password_hash=ph.hash("demo123"),
                company_name="Công ty ABC",
                status=UserStatus.active,
            )
            db.add(hr)
            db.flush()
            db.add(UserContact(user_id=hr.id, channel=ContactChannel.email, value="hr@abc.vn"))
            db.add(UserContact(user_id=hr.id, channel=ContactChannel.telegram, value="@abc_hr"))
            db.add(UserContact(user_id=hr.id, channel=ContactChannel.phone, value="+84 912 345 678"))

        if db.query(Job).count() > 0:
            db.commit()
            print("Jobs already exist, skipping.")
            return

        categories = {c.slug: c for c in db.query(Category).all()}
        tags = {t.slug: t for t in db.query(Tag).all()}
        existing_slugs = {s for (s,) in db.query(Job.slug).all()}

        def add_job(title, cat_slug, tag_slugs, job_type, location, salary_min, salary_max, desc, reqs, status=JobStatus.approved):
            base = slugify(title)
            slug = unique_slug(base, existing_slugs)
            existing_slugs.add(slug)
            job = Job(
                hr_id=hr.id,
                category_id=categories[cat_slug].id,
                title=title,
                slug=slug,
                job_type=job_type,
                location=location,
                timezone="UTC+7",
                salary_min=salary_min,
                salary_max=salary_max,
                currency="USD",
                description=desc,
                requirements=reqs,
                status=status,
                expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            )
            db.add(job)
            db.flush()
            for slug in tag_slugs:
                if slug in tags:
                    db.add(JobTag(job_id=job.id, tag_id=tags[slug].id))

        add_job(
            "Fullstack Developer",
            "fullstack",
            ["react", "nodejs", "postgresql"],
            JobType.fulltime,
            "Việt Nam",
            2000, 3500,
            "Xây dựng và duy trì các ứng dụng web fullstack cho nền tảng thương mại điện tử. Làm việc trực tiếp với team product và design.",
            "- 3+ năm kinh nghiệm fullstack\n- Thành thạo React và Node.js\n- Kinh nghiệm PostgreSQL\n- Tiếng Anh giao tiếp",
        )
        add_job(
            "React Developer",
            "frontend",
            ["react", "typescript", "docker"],
            JobType.contract,
            "Singapore",
            1800, 3000,
            "Phát triển giao diện người dùng cho sản phẩm SaaS. Tối ưu hiệu năng và trải nghiệm người dùng.",
            "- 2+ năm kinh nghiệm React\n- Thành thạo TypeScript\n- Hiểu biết về REST/GraphQL",
        )
        add_job(
            "DevOps Engineer",
            "devops-sysadmin",
            ["docker", "aws", "kubernetes"],
            JobType.fulltime,
            "Mỹ (Remote)",
            3000, 4500,
            "Thiết kế và vận hành hạ tầng cloud. Tự động hóa quy trình CI/CD.",
            "- Kinh nghiệm AWS\n- Docker và Kubernetes\n- Scripting Python/Bash",
        )
        add_job(
            "Backend Developer (Python)",
            "backend",
            ["python", "fastapi", "postgresql"],
            JobType.fulltime,
            "Việt Nam",
            1500, 2500,
            "Xây dựng API backend cho hệ thống thanh toán. Làm việc với FastAPI và PostgreSQL.",
            "- 2+ năm Python\n- Kinh nghiệm FastAPI\n- SQL thành thạo",
        )
        add_job(
            "Mobile Developer",
            "mobile",
            ["react", "typescript"],
            JobType.freelance,
            "Toàn cầu",
            1200, 2200,
            "Phát triển ứng dụng di động cross-platform cho startup fintech.",
            "- Kinh nghiệm React Native\n- TypeScript",
        )

        db.commit()
        print("Demo data seeded: 5 jobs, 1 HR (demo.hr@remoteit.vn / demo123)")


if __name__ == "__main__":
    seed_demo()
