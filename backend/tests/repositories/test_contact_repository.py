from app.models.contact import ContactChannel, UserContact
from app.repositories import contact_repository
from tests.factories import create_user


def test_contact_repository(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    contact_repository.create(db, UserContact(user_id=user.id, channel=ContactChannel.email, value="hr@example.com"))
    db.commit()
    assert db.query(UserContact).count() == 1

    contact_repository.delete_for_user(db, user.id)
    db.commit()
    assert db.query(UserContact).count() == 0
