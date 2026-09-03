from collections.abc import Generator

from fastapi import Depends, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.jwt import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.repositories import user_repository

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
    token = request.cookies.get(settings.access_cookie_name)
    if not token:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.unauthorized", "Chưa đăng nhập")

    # JWT access token: hết hạn -> auth.token_expired (frontend nên refresh),
    # chữ ký/định dạng sai -> auth.invalid_token
    payload = decode_access_token(token)
    user_id = int(payload.get("sub", 0)) if str(payload.get("sub", "")).isdigit() else 0

    user = user_repository.find_by_id(db, user_id)
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
