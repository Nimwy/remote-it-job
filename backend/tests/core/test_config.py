import pytest
from pydantic import ValidationError
from sqlalchemy import make_url

from app.core.config import Settings

BASE = {
    "db_host": "127.0.0.1",
    "db_name": "remoteit",
    "db_user": "remoteit",
    "db_password": "p@ss:w/rd%$x",
    "secret_key": "dev-key",
    "cors_origins": ["http://localhost:3000"],
    "frontend_url": "http://localhost:3000",
    "admin_email": "admin@example.com",
    "admin_password": "admin-pass",
}


def make(**overrides) -> Settings:
    # _env_file=None: không đọc backend/.env của máy đang chạy test
    return Settings(_env_file=None, **{**BASE, **overrides})


def test_database_url_encodes_special_characters_in_password():
    url = make_url(make().database_url)
    assert url.password == "p@ss:w/rd%$x"
    assert url.host == "127.0.0.1"
    assert url.database == "remoteit"


@pytest.mark.parametrize("field", ["db_password", "secret_key", "admin_password", "db_host"])
def test_required_field_rejects_empty_value(field):
    with pytest.raises(ValidationError):
        make(**{field: ""})


def test_secrets_are_masked_in_repr():
    assert "p@ss" not in repr(make())


def test_production_requires_long_secret_key():
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        make(env="production", cookie_secure=True, secret_key="short")


def test_production_requires_secure_cookie():
    with pytest.raises(ValidationError, match="COOKIE_SECURE"):
        make(env="production", cookie_secure=False, secret_key="x" * 32)


def test_production_valid_config():
    s = make(env="production", cookie_secure=True, secret_key="x" * 32)
    assert s.is_production


def test_env_rejects_unknown_value():
    with pytest.raises(ValidationError):
        make(env="staging")
