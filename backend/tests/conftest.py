import os

os.environ["RATE_LIMIT_ENABLED"] = "false"

# Settings không còn default cho biến bắt buộc -> cấp giá trị test (không phải secret)
# nếu môi trường chưa đặt, để pytest chạy được ở mọi nơi (docker compose, CI, máy dev).
os.environ.setdefault("DB_HOST", "db")
os.environ.setdefault("DB_NAME", "remoteit_test")
os.environ.setdefault("DB_USER", "remoteit")
os.environ.setdefault("DB_PASSWORD", "remoteit")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("CORS_ORIGINS", '["http://localhost:3000"]')
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("ADMIN_EMAIL", "admin@remoteit.vn")
os.environ.setdefault("ADMIN_PASSWORD", "admin123")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app import models  # noqa: F401
from app.api.dependencies import get_db
from app.db.session import Base
from app.main import app

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg2://remoteit:remoteit@db:5432/remoteit_test"
)

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _schema():
    """Tạo schema một lần ở đầu session thay vì mỗi test (T-07)."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Session nhanh dùng rollback thay vì create/drop mỗi test (T-07)."""
    connection = engine.connect()
    trans = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
