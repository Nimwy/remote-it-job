import hashlib
from collections.abc import Generator
from datetime import UTC, datetime

from fastapi import Depends, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import APIError
from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.repositories import session_repository, user_repository

settings = get_settings()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.unauthorized", "Chưa đăng nhập")

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    session = session_repository.find_by_token_hash(db, token_hash)
    if not session:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_session", "Phiên đăng nhập không hợp lệ")

    if session.expires_at < datetime.now(UTC):
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.session_expired", "Phiên đăng nhập đã hết hạn")

    user = user_repository.find_by_id(db, session.user_id)
    if not user:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.user_not_found", "Người dùng không tồn tại")

    request.state.user_id = user.id
    return user


def require_active_hr(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.hr:
        raise APIError(status.HTTP_403_FORBIDDEN, "auth.forbidden_hr", "Không có quyền HR")

    if current_user.status != UserStatus.active:
        raise APIError(status.HTTP_403_FORBIDDEN, "auth.hr_not_active", "Tài khoản HR chưa được duyệt hoặc đã bị khóa")

    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise APIError(status.HTTP_403_FORBIDDEN, "auth.forbidden_admin", "Không có quyền Admin")

    if current_user.status != UserStatus.active:
        raise APIError(status.HTTP_403_FORBIDDEN, "auth.admin_not_active", "Tài khoản Admin không hoạt động")

    return current_user
