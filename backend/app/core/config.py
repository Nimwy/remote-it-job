from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://remoteit:remoteit@localhost:5432/remoteit"
    secret_key: str = "change-me-in-production"
    cors_origins: list[str] = ["http://localhost:3000"]
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    frontend_url: str = "http://localhost:3000"
    session_cookie_name: str = "session"
    access_cookie_name: str = "access_token"
    refresh_cookie_name: str = "refresh_token"
    jwt_algorithm: str = "HS256"
    access_token_ttl_seconds: int = 60 * 15
    session_max_age_seconds: int = 60 * 60 * 24 * 7
    env: str = "development"
    visitor_cookie_name: str = "visitor_id"
    cookie_secure: bool = False
    rate_limit_enabled: bool = True
    page_size_default: int = 20
    page_size_max: int = 100

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
