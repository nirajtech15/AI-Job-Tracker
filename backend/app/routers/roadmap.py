from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user_id

from app.models.models import (
    Resume,
    LearningRoadmap,
)

from app.schemas import (
    RoadmapGenerateRequest,
)

from app.core.ai_service import (
    generate_learning_roadmap,
)

router = APIRouter(
    prefix="/api/roadmap",
    tags=["AI Roadmap"],
)

@router.post("/generate")
def generate(
    data: RoadmapGenerateRequest,
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

    # delete old roadmap

    db.query(LearningRoadmap).filter(
        LearningRoadmap.user_id == user_id
    ).delete()

    roadmap = generate_learning_roadmap(
        resume.resume_text,
        data.target_role,
    )

    for item in roadmap:

        row = LearningRoadmap(

            user_id=user_id,

            week=item["week"],

            title=item["title"],

            description=item["description"],

            resource=item["resource"],

            project=item["project"],

        )

        db.add(row)

    db.commit()

    return roadmap
@router.get("/")
def get_roadmap(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    return (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id == user_id
        )
        .order_by(
            LearningRoadmap.week
        )
        .all()
    )