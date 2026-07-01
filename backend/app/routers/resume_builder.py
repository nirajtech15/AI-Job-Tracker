import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user_id

from app.models.models import (
    Resume,
    GeneratedResume,
)

from app.schemas import ResumeBuilderRequest

from app.core.ai_service import generate_resume


router = APIRouter(
    prefix="/api/resume-builder",
    tags=["Resume Builder"],
)


@router.post("/generate")
def generate_ai_resume(
    data: ResumeBuilderRequest,
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
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    result = generate_resume(
        resume.resume_text,
        data.target_role,
    )

    # Delete previous generated resume
    db.query(GeneratedResume).filter(
        GeneratedResume.user_id == user_id
    ).delete()

    # Convert dict/list to string
    summary = result.get("summary", "")

    experience = json.dumps(
        result.get("experience", []),
        indent=2,
        ensure_ascii=False,
    )

    skills = json.dumps(
        result.get("skills", {}),
        indent=2,
        ensure_ascii=False,
    )

    projects = json.dumps(
        result.get("projects", []),
        indent=2,
        ensure_ascii=False,
    )

    row = GeneratedResume(
        user_id=user_id,
        resume_id=resume.id,
        title=result.get("title", ""),
        summary=summary,
        experience=experience,
        skills=skills,
        projects=projects,
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row


@router.get("/")
def get_generated_resume(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    return (
        db.query(GeneratedResume)
        .filter(
            GeneratedResume.user_id == user_id
        )
        .first()
    )