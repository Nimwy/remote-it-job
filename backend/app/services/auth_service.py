import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.jwt import create_access_token
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


def create_session(db: Session, user: User) -> tuple[str, str]:
    """Tạo access token (JWT) + refresh token (opaque), lưu hash refresh vào `sessions`.

    QD1: chính sách nhiều phiên — KHÔNG xoá session cũ khi đăng nhập lại, chỉ dọn
    token đã hết hạn. Thiết bị cũ giữ nguyên phiên của mình.
    """
    access_token = create_access_token(user.id, user.role)

    raw_refresh, refresh_hash = generate_session_token()
    expires_at = datetime.now(UTC) + timedelta(seconds=settings.session_max_age_seconds)

    session_repository.delete_expired(db)

    session = SessionModel(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=expires_at,
    )
    session_repository.create(db, session)
    db.commit()
    db.flush()
    return access_token, raw_refresh


def refresh_session(db: Session, refresh_token: str) -> tuple[str, str, int]:
    """Xoay refresh token và cấp access token mới.

    Đọc refresh token (lưu hash) trong `sessions`; nếu không tồn tại/hết hạn -> 401.
    Xoay token: xoá bản ghi cũ, tạo bản ghi mới (cho phép nhiều phiên trên nhiều thiết bị).
    Trả về (access_token, refresh_token, user_id).
    """
    from hashlib import sha256

    token_hash = sha256(refresh_token.encode()).hexdigest()
    session = session_repository.find_by_token_hash(db, token_hash)
    if not session:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_session", "Phiên đăng nhập không hợp lệ")

    if session.expires_at < datetime.now(UTC):
        session_repository.delete_by_token_hash(db, token_hash)
        db.commit()
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.session_expired", "Phiên đăng nhập đã hết hạn")

    user = user_repository.find_by_id(db, session.user_id)
    if not user:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.user_not_found", "Người dùng không tồn tại")

    # Xoay refresh token
    session_repository.delete_by_token_hash(db, token_hash)
    access_token, raw_refresh = create_session(db, user)
    return access_token, raw_refresh, user.id


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
