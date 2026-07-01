from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, jobs, ai, interviews
from app.routers import resume
from app.routers import career
from app.routers import roadmap
Base.metadata.create_all(bind=engine)
from app.routers import resume_builder
from app.routers import job_recommendation
from app.routers import dashboard
from app.routers import application_assistant
from app.routers import application_assistant_v2



app = FastAPI(
    title="AI Job Tracker API",
    description="Track job applications with AI-powered cover letters and interview prep",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(interviews.router)
app.include_router(resume.router)
app.include_router(career.router)
app.include_router(roadmap.router)
app.include_router(resume_builder.router)
app.include_router(job_recommendation.router)
app.include_router(dashboard.router)
app.include_router(application_assistant_v2.router)


@app.get("/")
def root():
    return {"message": "AI Job Tracker API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
