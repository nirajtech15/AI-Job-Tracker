-- AI Job Tracker — Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    skills TEXT DEFAULT '',
    experience_years INTEGER DEFAULT 0,
    target_role VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(100) DEFAULT '',
    job_type VARCHAR(50) DEFAULT 'full-time',
    salary_min INTEGER,
    salary_max INTEGER,
    job_url TEXT DEFAULT '',
    job_description TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'saved',
    applied_date DATE,
    deadline DATE,
    follow_up_date DATE,
    notes TEXT DEFAULT '',
    cover_letter TEXT DEFAULT '',
    match_score INTEGER,
    matching_skills TEXT DEFAULT '[]',
    missing_skills TEXT DEFAULT '[]',
    ai_recommendation TEXT DEFAULT '',
    salary_estimate TEXT DEFAULT '',
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP,
    interview_type VARCHAR(50) DEFAULT 'video',
    interviewer_name VARCHAR(100) DEFAULT '',
    status VARCHAR(30) DEFAULT 'scheduled',
    feedback TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_qa (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'general',
    is_practiced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_job ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_qa_job ON interview_qa(job_id);
