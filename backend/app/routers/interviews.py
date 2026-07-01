from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Interview, JobApplication
from app.schemas import InterviewCreate, InterviewOut
from app.core.security import get_current_user_id
from app.models.models import InterviewAnswer, InterviewQA
from app.schemas import (
    InterviewEvaluationRequest,
    InterviewEvaluationResponse,
)
from app.core.ai_service import evaluate_interview_answer

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])

@router.post(
    "/evaluate",
    response_model=InterviewEvaluationResponse,
)
def evaluate_answer(
    data: InterviewEvaluationRequest,
    db: Session = Depends(get_db),
):
    qa = (
        db.query(InterviewQA)
        .filter(
            InterviewQA.id == data.qa_id
        )
        .first()
    )

    if not qa:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    result = evaluate_interview_answer(
        qa.question,
        data.user_answer,
    )

    answer = InterviewAnswer(
        qa_id=qa.id,
        user_answer=data.user_answer,

        overall_score=result["overall_score"],
        technical_score=result["technical_score"],
        communication_score=result["communication_score"],
        confidence_score=result["confidence_score"],
        grammar_score=result["grammar_score"],

        feedback=result["feedback"],
        mistakes=result["mistakes"],
        better_answer=result["better_answer"],
        tips=result["tips"],
    )

    db.add(answer)

    db.commit()

    return result
@router.post("/{job_id}", response_model=InterviewOut)
def add_interview(
    job_id: int,
    data: InterviewCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    interview = Interview(job_id=job_id, **data.model_dump())
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/{job_id}", response_model=List[InterviewOut])
def get_interviews(
    job_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db.query(Interview).filter(Interview.job_id == job_id).all()


@router.put("/{interview_id}", response_model=InterviewOut)
def update_interview(
    interview_id: int,
    data: InterviewCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(interview, field, value)
    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/{interview_id}")
def delete_interview(
    interview_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(interview)
    db.commit()
    return {"success": True}

