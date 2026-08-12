from datetime import datetime, timedelta, timezone

import hashlib

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import generate_session_token, hash_password, verify_password
from app.models.session import Session as SessionModel
from app.models.user import User, UserStatus
from app.schemas.user import UserCreate

settings = get_settings()


def register_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được đăng ký",
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        company_name=data.company_name,
        status=UserStatus.pending,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    return user


def create_session(db: Session, user: User) -> str:
    raw_token, token_hash = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.session_max_age_seconds)

    session = SessionModel(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()
    return raw_token


def resolve_google_user(db: Session, google_id: str, email: str, name: str) -> User:
    user = db.query(User).filter(User.google_id == google_id).first()
    if user:
        return user

    user = db.query(User).filter(User.email == email).first()
    if user:
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        return user

    user = User(
        name=name,
        email=email,
        google_id=google_id,
        status=UserStatus.pending,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_session(db: Session, token: str) -> None:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    session = db.query(SessionModel).filter(SessionModel.token_hash == token_hash).first()
    if session:
        db.delete(session)
        db.commit()


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản không có mật khẩu",
        )

    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không đúng",
        )

    user.password_hash = hash_password(new_password)
    db.commit()
