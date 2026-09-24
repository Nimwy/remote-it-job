from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL

# Đường dẫn tuyệt đối tới backend/.env — không phụ thuộc thư mục đang chạy (CWD).
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Cấu hình ứng dụng.

    Thứ tự ưu tiên: biến môi trường của process > backend/.env > default dưới đây.
    Biến bắt buộc (secret / khác nhau theo môi trường) KHÔNG có default: thiếu thì app
    dừng ngay khi khởi động thay vì chạy âm thầm bằng giá trị công khai.
    Danh sách đầy đủ: backend/.env.example.
    """

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8")

    # --- Bắt buộc ---
    db_host: str = Field(min_length=1)
    db_port: int = 5432
    db_name: str = Field(min_length=1)
    db_user: str = Field(min_length=1)
    db_password: SecretStr = Field(min_length=1)
    secret_key: SecretStr = Field(min_length=1)
    cors_origins: list[str] = Field(min_length=1)
    frontend_url: str = Field(min_length=1)
    admin_email: str = Field(min_length=1)
    admin_password: SecretStr = Field(min_length=1)

    # --- Môi trường ---
    env: Literal["development", "production"] = "development"
    cookie_secure: bool = False
    rate_limit_enabled: bool = True
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # --- Google OAuth (tuỳ chọn; để trống -> endpoint trả 501) ---
    google_client_id: str = ""
    google_client_secret: SecretStr = SecretStr("")
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    # --- Tinh chỉnh (default hợp lý) ---
    access_token_ttl_seconds: int = 60 * 15
    session_max_age_seconds: int = 60 * 60 * 24 * 7
    page_size_default: int = 20
    page_size_max: int = 100
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # --- Không phải cấu hình môi trường (giữ cố định) ---
    access_cookie_name: str = "access_token"
    refresh_cookie_name: str = "refresh_token"
    visitor_cookie_name: str = "visitor_id"

    @property
    def database_url(self) -> str:
        """Ghép URL từ các phần; URL.create tự percent-encode mật khẩu có ký tự đặc biệt."""
        return URL.create(
            "postgresql+psycopg2",
            username=self.db_user,
            password=self.db_password.get_secret_value(),
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        ).render_as_string(hide_password=False)

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    @model_validator(mode="after")
    def _guard_production(self) -> "Settings":
        if self.is_production:
            if len(self.secret_key.get_secret_value()) < 32:
                raise ValueError("SECRET_KEY ở production phải >= 32 ký tự (openssl rand -hex 32)")
            if not self.cookie_secure:
                raise ValueError("COOKIE_SECURE phải là true ở production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
