import pytest

from app.core.exceptions import APIError
from app.core.security import hash_password
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate
from app.services import auth_service
from tests.factories import create_user


def test_auth_register_user(db):
    data = UserCreate(name="HR", email="hr@example.com", password="secret123", company_name="Corp")
    user = auth_service.register_user(db, data)
    assert user.status == UserStatus.pending
    assert user.role == UserRole.hr
    assert user.password_hash != "secret123"


def test_auth_register_duplicate_email(db):
    data = UserCreate(name="HR", email="hr@example.com", password="secret123", company_name="Corp")
    auth_service.register_user(db, data)
    with pytest.raises(APIError) as e:
        auth_service.register_user(db, data)
    assert e.value.status_code == 409


def test_auth_authenticate_user(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr, company_name="Corp",
    )
    db.add(user)
    db.commit()

    assert auth_service.authenticate_user(db, "hr@example.com", "secret123") is not None
    with pytest.raises(APIError):
        auth_service.authenticate_user(db, "hr@example.com", "wrong")


def test_auth_create_and_delete_session(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    token = auth_service.create_session(db, user)
    assert token
    auth_service.delete_session(db, token)


def test_auth_change_password(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr,
    )
    db.add(user)
    db.commit()

    auth_service.change_password(db, user, "secret123", "newpass123")
    db.refresh(user)
    assert auth_service.authenticate_user(db, "hr@example.com", "newpass123") is not None


def test_auth_change_password_wrong_current(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr,
    )
    db.add(user)
    db.commit()

    with pytest.raises(APIError):
        auth_service.change_password(db, user, "wrong", "newpass123")
