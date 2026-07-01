from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user_id
from app.models.models import JobApplication, Resume, InterviewAnswer,Interview

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/analytics")
def dashboard_analytics(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    jobs = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == user_id)
        .all()
    )

    total = len(jobs)

    saved = len([j for j in jobs if j.status == "saved"])
    applied = len([j for j in jobs if j.status == "applied"])
    interview = len([j for j in jobs if j.status == "interview"])
    offer = len([j for j in jobs if j.status == "offer"])
    rejected = len([j for j in jobs if j.status == "rejected"])

    avg_match = (
        db.query(func.avg(JobApplication.match_score))
        .filter(JobApplication.user_id == user_id)
        .scalar()
    )

    avg_match = round(avg_match or 0)

    avg_ats = (
        db.query(func.avg(Resume.ats_score))
        .filter(Resume.user_id == user_id)
        .scalar()
    )

    avg_ats = round(avg_ats or 0)

    interview_score = (
        db.query(func.avg(InterviewAnswer.overall_score))
        .scalar()
    )

    interview_score = round(interview_score or 0)

    return {
        "total_jobs": total,
        "saved": saved,
        "applied": applied,
        "interview": interview,
        "offer": offer,
        "rejected": rejected,
        "avg_match_score": avg_match,
        "avg_ats": avg_ats,
        "avg_interview_score": interview_score,
    }

@router.get("/chart")
def dashboard_chart(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    last30 = date.today() - timedelta(days=29)

    rows = (
        db.query(
            JobApplication.applied_date,
            func.count(JobApplication.id),
        )
        .filter(
            JobApplication.user_id == user_id,
            JobApplication.applied_date >= last30,
        )
        .group_by(JobApplication.applied_date)
        .all()
    )

    return [
        {
            "date": str(r[0]),
            "count": r[1],
        }
        for r in rows
    ]

@router.get("/reminders")
def reminders(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    return (
        db.query(JobApplication)
        .filter(
            JobApplication.user_id == user_id,
            JobApplication.follow_up_date != None,
        )
        .order_by(JobApplication.follow_up_date)
        .limit(10)
        .all()
    )
    from datetime import date


@router.get("/insights")
def dashboard_insights(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    jobs = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == user_id)
        .all()
    )

    total = len(jobs)

    best = max(
        jobs,
        key=lambda x: x.match_score or 0,
        default=None,
    )

    followups = len([
        j for j in jobs
        if j.follow_up_date
        and j.follow_up_date >= date.today()
    ])

    return {
        "total_jobs": total,
        "best_company": best.company if best else "-",
        "best_score": best.match_score if best else 0,
        "followups": followups,
    }
@router.get("/upcoming")
def upcoming_interviews(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    return (
        db.query(Interview)
        .join(JobApplication)
        .filter(JobApplication.user_id == user_id)
        .order_by(Interview.scheduled_at.asc())
        .limit(5)
        .all()
    )