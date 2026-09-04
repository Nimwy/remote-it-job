from datetime import UTC, datetime, timedelta

import jwt as pyjwt
import pytest

from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.jwt import create_access_token, decode_access_token

settings = get_settings()


def test_create_and_decode_access_token():
    token = create_access_token(42, "hr")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == "hr"
    assert payload["type"] == "access"


def test_expired_token_raises_token_expired():
    now = datetime.now(UTC)
    token = pyjwt.encode(
        {"sub": "1", "type": "access", "iat": now - timedelta(hours=1), "exp": now - timedelta(minutes=1)},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    with pytest.raises(APIError) as exc:
        decode_access_token(token)
    assert exc.value.code == "auth.token_expired"


def test_invalid_signature_raises_invalid_token():
    token = pyjwt.encode(
        {"sub": "1", "type": "access", "iat": datetime.now(UTC), "exp": datetime.now(UTC) + timedelta(minutes=5)},
        "wrong-secret",
        algorithm=settings.jwt_algorithm,
    )
    with pytest.raises(APIError) as exc:
        decode_access_token(token)
    assert exc.value.code == "auth.invalid_token"


def test_wrong_type_raises_invalid_token():
    token = pyjwt.encode(
        {"sub": "1", "type": "refresh", "iat": datetime.now(UTC), "exp": datetime.now(UTC) + timedelta(minutes=5)},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    with pytest.raises(APIError) as exc:
        decode_access_token(token)
    assert exc.value.code == "auth.invalid_token"
