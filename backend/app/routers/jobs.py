from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.database import get_db
from app.models.models import JobApplication, User
from app.schemas import JobCreate, JobUpdate, JobOut, DashboardStats
from app.core.security import get_current_user_id

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/", response_model=JobOut)
def create_job(data: JobCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    job = JobApplication(user_id=user_id, **data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[JobOut])
def list_jobs(
    status: Optional[str] = None,
    search: Optional[str] = None,
    starred: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    q = db.query(JobApplication).filter(JobApplication.user_id == user_id)
    if status and status != "all":
        q = q.filter(JobApplication.status == status)
    if search:
        term = f"%{search}%"
        q = q.filter(
            (JobApplication.job_title.ilike(term)) |
            (JobApplication.company.ilike(term))
        )
    if starred is not None:
        q = q.filter(JobApplication.is_starred == starred)
    if sort_by == "match_score":
        q = q.order_by(JobApplication.match_score.desc().nullslast())
    elif sort_by == "company":
        q = q.order_by(JobApplication.company)
    else:
        q = q.order_by(JobApplication.created_at.desc())
    return q.all()


@router.get("/stats", response_model=DashboardStats)
def get_stats(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    jobs = db.query(JobApplication).filter(JobApplication.user_id == user_id).all()
    total = len(jobs)
    statuses = {s: sum(1 for j in jobs if j.status == s) for s in ["saved", "applied", "screening", "interview", "offer", "rejected", "accepted"]}
    offers = statuses.get("offer", 0) + statuses.get("accepted", 0)
    applied = statuses.get("applied", 0)
    acceptance_rate = round((offers / applied * 100) if applied > 0 else 0, 1)
    scores = [j.match_score for j in jobs if j.match_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    return DashboardStats(
        total=total,
        saved=statuses.get("saved", 0),
        applied=applied,
        interview=statuses.get("interview", 0),
        offer=offers,
        rejected=statuses.get("rejected", 0),
        acceptance_rate=acceptance_rate,
        avg_match_score=avg_score,
    )


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, data: JobUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.patch("/{job_id}/status", response_model=JobOut)
def update_status(job_id: int, status: str, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    valid = ["saved", "applied", "screening", "interview", "offer", "rejected", "accepted"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = status
    db.commit()
    db.refresh(job)
    return job


@router.patch("/{job_id}/star", response_model=JobOut)
def toggle_star(job_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_starred = not job.is_starred
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"success": True}
