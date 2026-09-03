from datetime import UTC, datetime, timedelta
from typing import Any

import jwt as pyjwt
from fastapi import status

from app.core.config import get_settings
from app.core.exceptions import APIError

settings = get_settings()


def create_access_token(user_id: int, role: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(seconds=settings.access_token_ttl_seconds),
    }
    return pyjwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Giải mã access token.

    Phân biệt hai lỗi để frontend biết khi nào cần refresh:
    - hết hạn  -> `auth.token_expired`
    - chữ ký / định dạng sai -> `auth.invalid_token`
    """
    try:
        payload = pyjwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub", "type"]},
        )
    except pyjwt.ExpiredSignatureError as exc:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.token_expired", "Token đã hết hạn") from exc
    except pyjwt.PyJWTError as exc:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_token", "Token không hợp lệ") from exc

    if payload.get("type") != "access":
        raise APIError(status.HTTP_401_UNAUTHORIZED, "auth.invalid_token", "Token không hợp lệ")

    return payload
