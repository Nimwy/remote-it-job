from argon2 import PasswordHasher

from app.db.session import SessionLocal, engine
from app.models import Base, Category, Tag, User
from app.models.user import UserRole, UserStatus

ph = PasswordHasher()


def seed():
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        admin = db.query(User).filter(User.email == "admin@remoteit.vn").first()
        if not admin:
            admin = User(
                role=UserRole.admin,
                name="Admin",
                email="admin@remoteit.vn",
                password_hash=ph.hash("admin123"),
                status=UserStatus.active,
            )
            db.add(admin)

        categories_data = [
            ("Backend", "backend", 1),
            ("Frontend", "frontend", 2),
            ("Fullstack", "fullstack", 3),
            ("Mobile", "mobile", 4),
            ("DevOps / SysAdmin", "devops-sysadmin", 5),
            ("Data / AI / ML", "data-ai-ml", 6),
            ("QA / Test", "qa-test", 7),
            ("UI/UX Designer", "ui-ux-designer", 8),
        ]
        for name, slug, sort_order in categories_data:
            if not db.query(Category).filter(Category.slug == slug).first():
                db.add(Category(name=name, slug=slug, sort_order=sort_order))

        tags_data = [
            ("React", "react"),
            ("TypeScript", "typescript"),
            ("Python", "python"),
            ("FastAPI", "fastapi"),
            ("Node.js", "nodejs"),
            ("PostgreSQL", "postgresql"),
            ("Docker", "docker"),
            ("Vue.js", "vuejs"),
            ("AWS", "aws"),
            ("Go", "go"),
            ("Java", "java"),
            ("Kubernetes", "kubernetes"),
        ]
        for name, slug in tags_data:
            if not db.query(Tag).filter(Tag.slug == slug).first():
                db.add(Tag(name=name, slug=slug))

        db.commit()

    print("Seed completed.")


if __name__ == "__main__":
    seed()
