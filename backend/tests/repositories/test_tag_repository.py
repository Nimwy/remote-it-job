from app.models.tag import Tag
from app.repositories import tag_repository
from tests.factories import create_tag


def test_tag_repository(db):
    active = create_tag(db, "React", "react")
    inactive = Tag(name="Hidden", slug="hidden", is_active=False)
    db.add(inactive)
    db.commit()

    assert tag_repository.get_by_id(db, active.id).slug == "react"
    assert tag_repository.get_by_slug(db, "react").id == active.id
    assert len(tag_repository.get_by_ids(db, [active.id, inactive.id])) == 2
    assert len(tag_repository.get_active_by_ids(db, [active.id, inactive.id])) == 1
    assert len(tag_repository.list_active(db)) == 1
    assert len(tag_repository.list_all(db)) == 2
