import axios from 'axios'
import type { User, TokenOut, Job, JobCreate, Interview, QAItem, DashboardStats, MatchAnalysis } from '../types'

const api = axios.create({ baseURL: '' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jt_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jt_token");

  console.log("========== REQUEST ==========");
  console.log("URL:", config.url);
  console.log("TOKEN:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("AUTH HEADER:", config.headers.Authorization);
  console.log("ALL HEADERS:", config.headers);
  console.log("=============================");

  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (d: { name: string; email: string; password: string; skills?: string; experience_years?: number; target_role?: string }): Promise<TokenOut> =>
  api.post('/api/auth/register', d).then(r => r.data)

export const login = (email: string, password: string): Promise<TokenOut> =>
  api.post('/api/auth/login', { email, password }).then(r => r.data)

export const getMe = (): Promise<User> =>
  api.get('/api/auth/me').then(r => r.data)

export const updateMe = (d: Partial<User>): Promise<User> =>
  api.put('/api/auth/me', d).then(r => r.data)

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const getJobs = (params?: { status?: string; search?: string; starred?: boolean; sort_by?: string }): Promise<Job[]> =>
  api.get('/api/jobs/', { params }).then(r => r.data)

export const getJob = (id: number): Promise<Job> =>
  api.get(`/api/jobs/${id}`).then(r => r.data)

export const createJob = (d: JobCreate): Promise<Job> =>
  api.post('/api/jobs', d).then(r => r.data)

export const updateJob = (id: number, d: Partial<Job>): Promise<Job> =>
  api.put(`/api/jobs/${id}`, d).then(r => r.data)

export const updateJobStatus = (id: number, status: string): Promise<Job> =>
  api.patch(`/api/jobs/${id}/status`, null, { params: { status } }).then(r => r.data)

export const toggleStar = (id: number): Promise<Job> =>
  api.patch(`/api/jobs/${id}/star`).then(r => r.data)

export const deleteJob = (id: number): Promise<void> =>
  api.delete(`/api/jobs/${id}`).then(r => r.data)

export const getStats = (): Promise<DashboardStats> =>
  api.get('/api/jobs/stats').then(r => r.data)

// ── AI ────────────────────────────────────────────────────────────────────────
export const generateCoverLetter = (job_id: number): Promise<{ cover_letter: string }> =>
  api.post('/api/ai/cover-letter', { job_id }).then(r => r.data)

export const generateQA = (job_id: number, num_questions?: number): Promise<{ qa_list: QAItem[]; count: number }> =>
  api.post('/api/ai/interview-qa', { job_id, num_questions }).then(r => r.data)

export const getQA = (job_id: number): Promise<{ qa_list: QAItem[] }> =>
  api.get(`/api/ai/interview-qa/${job_id}`).then(r => r.data)

export const togglePracticed = (qa_id: number): Promise<{ is_practiced: boolean }> =>
  api.patch(`/api/ai/interview-qa/${qa_id}/practiced`).then(r => r.data)

export const analyzeJob = (job_id: number): Promise<MatchAnalysis> =>
  api.post('/api/ai/analyze', { job_id }).then(r => r.data)

export const improveBullet = (bullet: string, job_title: string): Promise<{ improved: string }> =>
  api.post('/api/ai/improve-bullet', { bullet, job_title }).then(r => r.data)

// ── Interviews ────────────────────────────────────────────────────────────────
export const getInterviews = (job_id: number): Promise<Interview[]> =>
  api.get(`/api/interviews/${job_id}`).then(r => r.data)

export const addInterview = (job_id: number, d: Partial<Interview>): Promise<Interview> =>
  api.post(`/api/interviews/${job_id}`, d).then(r => r.data)

export const deleteInterview = (id: number): Promise<void> =>
  api.delete(`/api/interviews/${id}`).then(r => r.data)

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
export const getResumes = () =>
  api.get("/api/resume/").then((r) => r.data);

export const analyzeResume = (
  resume_id: number,
  job_description: string
) => {
  return api.post("/api/resume/analyze", {
    resume_id,
    job_description,
  });
};
export const careerChat = (message: string) =>
  api.post("/api/career/chat", { message }).then(r => r.data);

export const careerHistory = () =>
  api.get("/api/career/history").then(r => r.data);

export const clearCareerHistory = () =>
  api.delete("/api/career/history").then(r => r.data);

export const evaluateInterview = (
    qa_id:number,
    user_answer:string
)=>
api.post(
"/api/interviews/evaluate",
{
qa_id,
user_answer
}
).then(r=>r.data);

export const generateRoadmap=(
    resume_id:number,
    target_role:string
)=>
api.post(
"/api/roadmap/generate",
{
resume_id,
target_role,
}
).then(r=>r.data);


export const getRoadmap=()=>
api.get(
"/api/roadmap/"
).then(r=>r.data);

export const generateAIResume=(
resume_id:number,
target_role:string
)=>
api.post(
"/api/resume-builder/generate",
{
resume_id,
target_role,
}
).then(r=>r.data);

export const getGeneratedResume=()=>
api.get(
"/api/resume-builder/"
).then(r=>r.data);

export const generateJobRecommendation = (
  job_id: number,
  resume_id: number
) =>
  api.post("/api/job-recommendation/generate", {
    job_id,
    resume_id,
  }).then((r) => r.data);

export const getJobRecommendations = () =>
  api.get("/api/job-recommendation/").then((r) => r.data);
export const getDashboardAnalytics = () =>
  api.get("/api/dashboard/analytics").then(r => r.data);

export const getDashboardChart = () =>
  api.get("/api/dashboard/chart").then(r => r.data);

export const getDashboardReminders = () =>
  api.get("/api/dashboard/reminders").then(r => r.data);
export const getDashboardInsights = () =>
  api.get("/api/dashboard/insights").then(r => r.data);

export const getUpcomingInterviews = () =>
  api.get("/api/dashboard/upcoming").then(r => r.data);
export const generateApplicationAssistant = (
  jobId: number
) =>
  api.post(
    "/api/application-ai/generate",
    {
      job_id: jobId,
    }
  ).then(r => r.data);

export const getApplicationAssistant = () =>
  api.get(
    "/api/application-ai/"
  ).then(r => r.data);
  