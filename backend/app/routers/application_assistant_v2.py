from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.core.security import get_current_user_id

from app.models.models import (
    JobApplication,
    ApplicationAssistant,
    Resume,
    User,
)

from app.schemas import (
    ApplicationAssistantRequest,
)

from app.core.ai_service import (
    generate_application_assistant,
)

router = APIRouter(
    prefix="/api/application-ai",
    tags=["Application AI"],
)
@router.post("/generate")
def generate_ai_application(
    data: ApplicationAssistantRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

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

    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=400,
            detail="Please upload your resume first."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    result = generate_application_assistant(
        resume_text=resume.resume_text,
        job_title=job.job_title,
        company=job.company,
        job_description=job.job_description,
        user_name=user.name,
        skills=user.skills,
        experience=user.experience_years,
        target_role=user.target_role,
    )

    db.query(ApplicationAssistant).filter(
        ApplicationAssistant.job_id == job.id,
        ApplicationAssistant.user_id == user_id,
    ).delete()

    row = ApplicationAssistant(
        user_id=user_id,
        job_id=job.id,
        readiness_score=result["readiness_score"],
        next_action=result["next_action"],
        priority=result["priority"],
        notification=result["notification"],
        email=result["email"],
        linkedin_message=result["linkedin_message"],
        followup_email=result["followup_email"],
        checklist=json.dumps(result["checklist"]),
        suggestions=json.dumps(result["suggestions"]),
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row
@router.get("/")
def history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    return (
        db.query(ApplicationAssistant)
        .filter(
            ApplicationAssistant.user_id == user_id
        )
        .order_by(
            ApplicationAssistant.created_at.desc()
        )
        .all()
    )