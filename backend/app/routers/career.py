from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import CareerChat, Resume, User
from app.schemas import CareerChatRequest
from app.core.security import get_current_user_id
from app.core.ai_service import career_chat

router = APIRouter(
    prefix="/api/career",
    tags=["Career Coach"],
)


@router.post("/chat")
def chat(
    data: CareerChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.id.desc())
        .first()
    )

    answer = career_chat(
        user_message=data.message,
        resume_text=resume.resume_text if resume else "",
        skills=user.skills if user else "",
        target_role=user.target_role if user else "",
    )

    db.add(
        CareerChat(
            user_id=user_id,
            role="user",
            message=data.message,
        )
    )

    db.add(
        CareerChat(
            user_id=user_id,
            role="assistant",
            message=answer,
        )
    )

    db.commit()

    return {
        "answer": answer
    }
@router.get("/history")
def history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    chats = (
        db.query(CareerChat)
        .filter(
            CareerChat.user_id == user_id
        )
        .order_by(CareerChat.id.asc())
        .all()
    )

    return chats
@router.delete("/history")
def clear_chat(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    db.query(CareerChat).filter(
        CareerChat.user_id == user_id
    ).delete()

    db.commit()

    return {
        "success": True
    }