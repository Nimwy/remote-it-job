from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


def find_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def find_by_google_id(db: Session, google_id: str) -> User | None:
    return db.query(User).filter(User.google_id == google_id).first()


def find_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def find_hr_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id, User.role == UserRole.hr).first()


def create(db: Session, user: User) -> User:
    db.add(user)
    db.flush()
    return user


def list_hr_users(
    db: Session,
    search: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[User], int]:
    query = db.query(User).filter(User.role == UserRole.hr)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like)))
    if status:
        query = query.filter(User.status == status)
    query = query.order_by(User.created_at.desc())

    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    return users, total
