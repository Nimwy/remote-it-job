from app.models.job import JobStatus
from app.models.user import UserStatus
from app.schemas.admin import CategoryCreate, TagCreate
from app.services import admin_service
from tests.factories import create_category, create_job, create_user


def test_admin_service_job_moderation(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    db.commit()

    approved = admin_service.approve_job(db, job.id)
    assert approved.status == JobStatus.approved

    hidden = admin_service.hide_job(db, job.id)
    assert hidden.status == JobStatus.hidden

    restored = admin_service.unhide_job(db, job.id)
    assert restored.status == JobStatus.approved


def test_admin_service_reject_job(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    db.commit()

    rejected = admin_service.reject_job(db, job.id, "Thiếu thông tin")
    assert rejected.status == JobStatus.rejected
    assert rejected.rejection_reason == "Thiếu thông tin"


def test_admin_service_user_management(db):
    hr = create_user(db, "hr@example.com", status=UserStatus.pending)
    db.commit()

    approved = admin_service.approve_user(db, hr.id)
    assert approved.status == UserStatus.active

    blocked = admin_service.block_user(db, hr.id)
    assert blocked.status == UserStatus.blocked

    unblocked = admin_service.unblock_user(db, hr.id)
    assert unblocked.status == UserStatus.active


def test_admin_service_category_and_tag(db):
    category = admin_service.create_category(db, CategoryCreate(name="Security"))
    assert category.slug == "security"

    deactivated = admin_service.deactivate_category(db, category.id)
    assert deactivated.is_active is False

    tag = admin_service.create_tag(db, TagCreate(name="Rust"))
    assert tag.slug == "rust"

    deactivated_tag = admin_service.deactivate_tag(db, tag.id)
    assert deactivated_tag.is_active is False


def test_admin_category_tag_slug_unique_and_fallback(db):
    # A-06: tên khác nhau nhưng slug trùng -> tự thêm hậu tố, không 409
    tag1 = admin_service.create_tag(db, TagCreate(name="C++"))
    tag2 = admin_service.create_tag(db, TagCreate(name="C#"))
    assert tag1.slug == "c"
    assert tag2.slug == "c-2"

    # tên toàn ký tự không Latin -> fallback, không tạo slug rỗng
    category = admin_service.create_category(db, CategoryCreate(name="###"))
    assert category.slug == "muc"
