import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://remoteit:remoteit@localhost:5432/remoteit"
    secret_key: str = "change-me-in-production"
    cors_origins: list[str] = ["http://localhost:5173"]
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    frontend_url: str = "http://localhost:5173"
    session_cookie_name: str = "session"
    session_max_age_seconds: int = 60 * 60 * 24 * 7
    page_size_default: int = 20
    page_size_max: int = 100

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
