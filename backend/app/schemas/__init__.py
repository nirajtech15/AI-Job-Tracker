from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime



# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: Optional[str] = ""
    experience_years: Optional[int] = 0
    target_role: Optional[str] = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = None
    target_role: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    skills: str
    experience_years: int
    target_role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Job Application ───────────────────────────────────────────────────────────
class JobCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = ""
    job_type: Optional[str] = "full-time"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_url: Optional[str] = ""
    job_description: Optional[str] = ""
    status: Optional[str] = "saved"
    applied_date: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = ""
    is_starred: Optional[bool] = False


class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    deadline: Optional[date] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    is_starred: Optional[bool] = None


class JobOut(BaseModel):
    id: int
    job_title: str
    company: str
    location: str
    job_type: str
    salary_min: Optional[int]
    salary_max: Optional[int]
    job_url: str
    job_description: str
    status: str
    applied_date: Optional[date]
    deadline: Optional[date]
    follow_up_date: Optional[date]
    notes: str
    cover_letter: str
    match_score: Optional[int]
    matching_skills: str
    missing_skills: str
    ai_recommendation: str
    salary_estimate: str
    is_starred: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Interview ────────────────────────────────────────────────────────────────
class InterviewCreate(BaseModel):
    round_name: str
    scheduled_at: Optional[datetime] = None
    interview_type: Optional[str] = "video"
    interviewer_name: Optional[str] = ""
    status: Optional[str] = "scheduled"
    feedback: Optional[str] = ""


class InterviewOut(InterviewCreate):
    id: int
    job_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── AI Requests ───────────────────────────────────────────────────────────────
class CoverLetterRequest(BaseModel):
    job_id: int


class QARequest(BaseModel):
    job_id: int
    num_questions: Optional[int] = 8


class AnalyzeRequest(BaseModel):
    job_id: int


class BulletImproveRequest(BaseModel):
    bullet: str
    job_title: str


# ── Stats ─────────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total: int
    saved: int
    applied: int
    interview: int
    offer: int
    rejected: int
    acceptance_rate: float
    avg_match_score: float
    
class ResumeOut(BaseModel):
    id: int
    file_name: str
    resume_text: str

    ats_score: Optional[int] = None
    matching_skills: Optional[str] = ""
    missing_skills: Optional[str] = ""
    strengths: Optional[str] = ""
    weaknesses: Optional[str] = ""
    suggestions: Optional[str] = ""
    interview_probability: Optional[int] = None
    summary: Optional[str] = ""
    improved_summary: Optional[str] = ""
    keyword_match_percentage: Optional[int] = None
    resume_quality: Optional[str] = ""
    recruiter_recommendation: Optional[str] = ""

    created_at: datetime

    class Config:
        from_attributes = True
class ResumeAnalyzeRequest(BaseModel):
    resume_id: int
    job_description: str


class ResumeAnalysisResponse(BaseModel):
    ats_score: int
    interview_probability: int
    matching_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]

  


class CareerChatRequest(BaseModel):
    message: str


class CareerChatResponse(BaseModel):
    answer: str


class CareerChatOut(BaseModel):
    id: int
    role: str
    message: str

class Config:
    from_attributes = True
class InterviewEvaluationRequest(BaseModel):
    qa_id: int
    user_answer: str


class InterviewEvaluationResponse(BaseModel):
    overall_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    grammar_score: int

    feedback: str
    mistakes: str
    better_answer: str
    tips: str

class RoadmapGenerateRequest(BaseModel):
    resume_id: int
    target_role: str


class RoadmapItemOut(BaseModel):
    week: int
    title: str
    description: str
    resource: str
    project: str
    completed: bool

class Config:
    from_attributes = True   
class ResumeBuilderRequest(BaseModel):
    resume_id: int
    target_role: str


class GeneratedResumeOut(BaseModel):
    id: int
    title: str
    summary: str
    experience: str
    skills: str
    projects: str

class Config:
    from_attributes = True     
class JobRecommendationRequest(BaseModel):
    job_id: int
    resume_id: int


class JobRecommendationResponse(BaseModel):
    match_score: int
    strengths: list[str]
    missing_skills: list[str]
    recommendation: str
    priority: str

class ApplicationAssistantOut(BaseModel):

    id:int

    job_id:int

    readiness_score:int

    next_action:str

    priority:str

    notification:str

class Config:

    from_attributes=True
class ApplicationAssistantRequest(BaseModel):
    job_id: int


class ApplicationAssistantOut(BaseModel):

    id: int

    readiness_score: int

    next_action: str

    priority: str

    notification: str

    email: str

    linkedin_message: str

    followup_email: str

    checklist: str

    suggestions: str

class Config:
    from_attributes = True