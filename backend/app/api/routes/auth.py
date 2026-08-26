from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.oauth import oauth
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    authenticate_user,
    change_password,
    create_session,
    delete_session,
    register_user,
    resolve_google_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = register_user(db, data)
    return user


@router.post("/login", response_model=UserResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    raw_token = create_session(db, user)

    response.set_cookie(
        key=settings.session_cookie_name,
        value=raw_token,
        max_age=settings.session_max_age_seconds,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return user


@router.get("/google/login")
async def google_login(request: Request):
    if not settings.google_client_id:
        raise APIError(status.HTTP_501_NOT_IMPLEMENTED, "auth.google_not_configured", "Google OAuth chưa được cấu hình")
    return await oauth.google.authorize_redirect(request, settings.google_redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, response: Response, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo")
    if not userinfo:
        raise APIError(status.HTTP_400_BAD_REQUEST, "auth.google_missing_info", "Không lấy được thông tin Google")

    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name") or email

    if not google_id or not email:
        raise APIError(status.HTTP_400_BAD_REQUEST, "auth.google_missing_identity", "Thiếu thông tin Google identity")

    user = resolve_google_user(db, google_id, email, name)
    raw_token = create_session(db, user)

    response.set_cookie(
        key=settings.session_cookie_name,
        value=raw_token,
        max_age=settings.session_max_age_seconds,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return RedirectResponse(url=settings.frontend_url)


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        delete_session(db, token)

    response.delete_cookie(settings.session_cookie_name)
    return {"detail": "Đã đăng xuất"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password_endpoint(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    change_password(db, current_user, data.current_password, data.new_password)
    return {"detail": "Đổi mật khẩu thành công"}
