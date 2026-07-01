from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    Date,
    TIMESTAMP,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# ==========================================================
# User
# ==========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)

    skills = Column(Text, default="")
    experience_years = Column(Integer, default=0)
    target_role = Column(String(100), default="")

    created_at = Column(TIMESTAMP, server_default=func.now())
    roadmaps = relationship(
    "LearningRoadmap",
    back_populates="user",
    cascade="all, delete-orphan",
)
    generated_resumes = relationship(
    "GeneratedResume",
    back_populates="user",
    cascade="all, delete-orphan",
)
    recommended_jobs = relationship(
    "JobRecommendation",
    cascade="all, delete-orphan",
)

    jobs = relationship(
        "JobApplication",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    resumes = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    application_assistants = relationship(
        "ApplicationAssistant",
        back_populates="user",
        cascade="all, delete-orphan",
)
    recommendations = relationship(
    "JobRecommendation",
    cascade="all, delete-orphan",
)


# ==========================================================
# Job Application
# ==========================================================

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Job Details

    job_title = Column(String(150), nullable=False)
    company = Column(String(150), nullable=False)
    location = Column(String(100), default="")
    job_type = Column(String(50), default="full-time")

    salary_min = Column(Integer)
    salary_max = Column(Integer)

    job_url = Column(Text, default="")
    job_description = Column(Text, default="")

    # Tracking

    status = Column(String(50), default="saved")

    applied_date = Column(Date)
    deadline = Column(Date)
    follow_up_date = Column(Date)

    notes = Column(Text, default="")

    # AI

    cover_letter = Column(Text, default="")
    match_score = Column(Integer)

    matching_skills = Column(Text, default="")
    missing_skills = Column(Text, default="")

    ai_recommendation = Column(Text, default="")
    salary_estimate = Column(Text, default="")

    is_starred = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="jobs")

    interviews = relationship(
        "Interview",
        back_populates="job",
        cascade="all, delete-orphan",
    )

    qa_sets = relationship(
        "InterviewQA",
        back_populates="job",
        cascade="all, delete-orphan",
    )


# ==========================================================
# Resume
# ==========================================================

class Resume(Base):
    __tablename__ = "resume"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_name = Column(String(255), nullable=False)

    resume_text = Column(Text, nullable=False)

    ats_score = Column(Integer)

    matching_skills = Column(Text, default="")

    missing_skills = Column(Text, default="")

    strengths = Column(Text, default="")

    weaknesses = Column(Text, default="")

    suggestions = Column(Text, default="")

    interview_probability = Column(Integer)
    summary = Column(Text, default="")
    improved_summary = Column(Text, default="")
    keyword_match_percentage = Column(Integer)
    resume_quality = Column(String(50), default="")
    recruiter_recommendation = Column(String(100), default="")

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship(
        "User",
        back_populates="resumes",
    )


# ==========================================================
# Interview
# ==========================================================

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
    )

    round_name = Column(String(100), nullable=False)

    scheduled_at = Column(TIMESTAMP)

    interview_type = Column(String(50), default="video")

    interviewer_name = Column(String(100), default="")

    status = Column(String(30), default="scheduled")

    feedback = Column(Text, default="")

    created_at = Column(TIMESTAMP, server_default=func.now())

    job = relationship(
        "JobApplication",
        back_populates="interviews",
    )


# ==========================================================
# Interview QA
# ==========================================================

class InterviewQA(Base):
    __tablename__ = "interview_qa"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
    )

    question = Column(Text, nullable=False)

    answer = Column(Text, nullable=False)

    question_type = Column(String(50), default="general")

    is_practiced = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

    job = relationship(
        "JobApplication",
        back_populates="qa_sets",
    )


# ==========================================================
# Career Chat
# ==========================================================

class CareerChat(Base):
    __tablename__ = "career_chat"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role = Column(
        String(20),
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    user = relationship("User")
class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)

    qa_id = Column(
        Integer,
        ForeignKey("interview_qa.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_answer = Column(Text, nullable=False)

    overall_score = Column(Integer)
    technical_score = Column(Integer)
    communication_score = Column(Integer)
    confidence_score = Column(Integer)
    grammar_score = Column(Integer)

    feedback = Column(Text, default="")
    mistakes = Column(Text, default="")
    better_answer = Column(Text, default="")
    tips = Column(Text, default="")

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    qa = relationship("InterviewQA")

    # ==========================================================
# Learning Roadmap
# ==========================================================

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    week = Column(Integer)

    title = Column(String(200))

    description = Column(Text)

    resource = Column(Text)

    project = Column(Text)

    status = Column(String(20), default="pending")

    completed = Column(Boolean, default=False)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    user = relationship(
    "User",
    back_populates="roadmaps",
)

    # ==========================================================
# AI Resume Builder
# ==========================================================

class GeneratedResume(Base):
    __tablename__ = "generated_resumes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    resume_id = Column(
        Integer,
        ForeignKey("resume.id", ondelete="CASCADE"),
        nullable=False,
    )

    title = Column(String(200))

    summary = Column(Text)

    experience = Column(Text)

    skills = Column(Text)

    projects = Column(Text)

    template = Column(
        String(50),
        default="professional",
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    user = relationship(
    "User",
    back_populates="generated_resumes",
)
    
    # ==========================================================
# AI Job Recommendation
# ==========================================================

class JobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    job_id = Column(
        Integer,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
    )

    match_score = Column(Integer)

    strengths = Column(Text, default="")

    missing_skills = Column(Text, default="")

    recommendation = Column(Text, default="")

    priority = Column(
        String(20),
        default="Medium",
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )
class JobApplicationAssistant(Base):
    __tablename__ = "job_application_assistant"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    job_id = Column(
        Integer,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
    )

    readiness_score = Column(Integer, default=0)

    next_action = Column(String(200), default="")

    priority = Column(String(30), default="Medium")

    notification = Column(Text, default="")

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    job = relationship("JobApplication")

    user = relationship("User")
class ApplicationAssistant(Base):
    __tablename__ = "application_assistant"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    job_id = Column(
        Integer,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
    )

    readiness_score = Column(Integer)

    next_action = Column(Text)

    priority = Column(String(30))

    notification = Column(Text)

    email = Column(Text)

    linkedin_message = Column(Text)

    followup_email = Column(Text)

    checklist = Column(Text)

    suggestions = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="application_assistants",
    )

    job = relationship("JobApplication")