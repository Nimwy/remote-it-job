from sqlalchemy.orm import Session

from app.models.job_view import JobView


def find(db: Session, job_id: int, visitor_key: str) -> JobView | None:
    return db.query(JobView).filter(JobView.job_id == job_id, JobView.visitor_key == visitor_key).first()


def create(db: Session, job_view: JobView) -> JobView:
    db.add(job_view)
    return job_view


def delete_for_job(db: Session, job_id: int) -> None:
    db.query(JobView).filter(JobView.job_id == job_id).delete()
