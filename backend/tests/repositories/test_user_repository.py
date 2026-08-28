from app.models.user import User, UserRole, UserStatus
from app.repositories import user_repository
from tests.factories import create_user


def test_user_repository_find_by_email(db):
    create_user(db, "hr@example.com")
    db.commit()
    assert user_repository.find_by_email(db, "hr@example.com") is not None
    assert user_repository.find_by_email(db, "nope@example.com") is None


def test_user_repository_find_by_google_id(db):
    user = User(name="G", email="g@example.com", google_id="google-123", status=UserStatus.pending, role=UserRole.hr)
    db.add(user)
    db.commit()
    assert user_repository.find_by_google_id(db, "google-123") is not None
    assert user_repository.find_by_google_id(db, "nope") is None


def test_user_repository_find_hr_by_id(db):
    hr = create_user(db, "hr@example.com")
    admin = User(name="A", email="admin@example.com", status=UserStatus.active, role=UserRole.admin)
    db.add(admin)
    db.commit()
    assert user_repository.find_hr_by_id(db, hr.id).role == UserRole.hr
    assert user_repository.find_hr_by_id(db, admin.id) is None


def test_user_repository_list_hr_users(db):
    create_user(db, "hr1@example.com", status=UserStatus.active)
    create_user(db, "hr2@example.com", status=UserStatus.pending)
    admin = User(name="A", email="admin@example.com", status=UserStatus.active, role=UserRole.admin)
    db.add(admin)
    db.commit()

    _, total = user_repository.list_hr_users(db)
    assert total == 2

    pending, total = user_repository.list_hr_users(db, status=UserStatus.pending.value)
    assert total == 1
    assert pending[0].email == "hr2@example.com"

    found, total = user_repository.list_hr_users(db, search="hr1")
    assert total == 1
    assert found[0].email == "hr1@example.com"
