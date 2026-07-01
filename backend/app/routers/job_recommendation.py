from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import json

from app.database import get_db
from app.core.security import get_current_user_id

from app.models.models import (
    Resume,
    JobApplication,
    JobRecommendation,
)

from app.schemas import (
    JobRecommendationRequest,
    JobRecommendationResponse,
)

from app.core.ai_service import recommend_job

router = APIRouter(
    prefix="/api/job-recommendation",
    tags=["Job Recommendation"],
)

@router.get("/")
def get_recommendations(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(JobRecommendation)
        .filter(
            JobRecommendation.user_id == user_id
        )
        .order_by(JobRecommendation.created_at.desc())
        .all()
    )
@router.post(
    "/generate",
    response_model=JobRecommendationResponse,
)
def generate_recommendation(
    data: JobRecommendationRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == data.resume_id,
            Resume.user_id == user_id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(404, "Resume not found")

    job = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == data.job_id,
            JobApplication.user_id == user_id,
        )
        .first()
    )

    if not job:
        raise HTTPException(404, "Job not found")

    result = recommend_job(
        resume.resume_text,
        job.job_description,
    )

    db.query(JobRecommendation).filter(
        JobRecommendation.user_id == user_id,
        JobRecommendation.job_id == job.id,
    ).delete()

    row = JobRecommendation(
        user_id=user_id,
        job_id=job.id,
        match_score=result["match_score"],
        strengths=json.dumps(result["strengths"]),
        missing_skills=json.dumps(result["missing_skills"]),
        recommendation=result["recommendation"],
        priority=result["priority"],
    )

    db.add(row)

    db.commit()

    return result
