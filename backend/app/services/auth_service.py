import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.logging import logger
from app.core.security import generate_session_token, hash_password, verify_password
from app.models.session import Session as SessionModel
from app.models.user import User, UserStatus
from app.repositories import session_repository, user_repository
from app.schemas.user import UserCreate

settings = get_settings()


def register_user(db: Session, data: UserCreate) -> User:
    existing = user_repository.find_by_email(db, data.email)
    if existing:
        raise APIError(status.HTTP_409_CONFLICT, "auth.email_exists", "Email đã được đăng ký")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        company_name=data.company_name,
        status=UserStatus.pending,
    )
    user_repository.create(db, user)
    db.commit()
    db.refresh(user)
    logger.info("HR registered email=%s id=%s", data.email, user.id)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = user_repository.find_by_email(db, email)
    if not user or not user.password_hash:
        logger.warning("Login failed for email=%s reason=not_found", email)
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_credentials", "Email hoặc mật khẩu không đúng")

    if not verify_password(password, user.password_hash):
        logger.warning("Login failed for email=%s reason=bad_password", email)
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_credentials", "Email hoặc mật khẩu không đúng")

    logger.info("Login success email=%s id=%s", email, user.id)
    return user


def create_session(db: Session, user: User) -> str:
    raw_token, token_hash = generate_session_token()
    expires_at = datetime.now(UTC) + timedelta(seconds=settings.session_max_age_seconds)

    # B-07: xoá session cũ của user khi đăng nhập lại — chỉ giữ 1 session hiện hành
    session_repository.delete_for_user(db, user.id)
    # Dọn các session hết hạn (vệ sinh dữ liệu, chạy nhẹ nhàng khi login)
    session_repository.delete_expired(db)

    session = SessionModel(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    session_repository.create(db, session)
    db.commit()
    db.flush()
    return raw_token


def resolve_google_user(db: Session, google_id: str, email: str, name: str) -> User:
    user = user_repository.find_by_google_id(db, google_id)
    if user:
        return user

    user = user_repository.find_by_email(db, email)
    if user:
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        logger.info("Google linked to existing user id=%s email=%s", user.id, email)
        return user

    user = User(
        name=name,
        email=email,
        google_id=google_id,
        status=UserStatus.pending,
    )
    user_repository.create(db, user)
    db.commit()
    db.refresh(user)
    logger.info("Google new HR id=%s email=%s", user.id, email)
    return user


def delete_session(db: Session, token: str) -> None:
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    session = session_repository.find_by_token_hash(db, token_hash)
    if session:
        session_repository.delete_by_token_hash(db, token_hash)
        db.commit()


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not user.password_hash:
        raise APIError(status.HTTP_400_BAD_REQUEST, "auth.no_password", "Tài khoản không có mật khẩu")

    if not verify_password(current_password, user.password_hash):
        raise APIError(status.HTTP_400_BAD_REQUEST, "auth.invalid_current_password", "Mật khẩu hiện tại không đúng")

    user.password_hash = hash_password(new_password)
    db.commit()
