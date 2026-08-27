from typing import TYPE_CHECKING

from app.core.config import get_settings

if TYPE_CHECKING:
    from fastapi import Response

settings = get_settings()


def set_session_cookie(response: "Response", token: str) -> None:
    """Đặt cookie session HTTP-only; Secure bật khi production (cookie_secure)."""
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_max_age_seconds,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )


def clear_session_cookie(response: "Response") -> None:
    response.delete_cookie(settings.session_cookie_name)
