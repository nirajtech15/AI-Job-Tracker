import fitz
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Resume
from app.schemas import ResumeOut
from app.core.security import get_current_user_id
from app.schemas import ResumeAnalyzeRequest
from app.core.ai_service import analyze_resume
import json

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    pdf = fitz.open(stream=await file.read(), filetype="pdf")

    text = ""

    for page in pdf:
        text += page.get_text()

    resume = Resume(
        user_id=user_id,
        file_name=file.filename,
        resume_text=text,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume

@router.post("/analyze")
def analyze(
    data: ResumeAnalyzeRequest,
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

    result = analyze_resume(
        resume.resume_text,
        data.job_description,
    )

    resume.ats_score = result["ats_score"]
    resume.interview_probability = result["interview_probability"]
    resume.matching_skills = json.dumps(result["matching_skills"])
    resume.missing_skills = json.dumps(result["missing_skills"])
    resume.strengths = json.dumps(result["strengths"])
    resume.weaknesses = json.dumps(result["weaknesses"])
    resume.suggestions = json.dumps(result["suggestions"])
    resume.summary = result["summary"]
    resume.improved_summary = result["improved_summary"]
    resume.keyword_match_percentage = result["keyword_match_percentage"]
    resume.resume_quality = result["resume_quality"]
    resume.recruiter_recommendation = result["recruiter_recommendation"]

    db.commit()

    return result
@router.get("/", response_model=list[ResumeOut])
def get_resumes(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )

    return resumes