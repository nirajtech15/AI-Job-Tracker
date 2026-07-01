export interface User {
  id: number
  name: string
  email: string
  skills: string
  experience_years: number
  target_role: string
  created_at: string
}

export interface TokenOut {
  access_token: string
  token_type: string
  user: User
}

export type JobStatus = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'accepted'

export interface Job {
  id: number
  job_title: string
  company: string
  location: string
  job_type: string
  salary_min: number | null
  salary_max: number | null
  job_url: string
  job_description: string
  status: JobStatus
  applied_date: string | null
  deadline: string | null
  follow_up_date: string | null
  notes: string
  cover_letter: string
  match_score: number | null
  matching_skills: string
  missing_skills: string
  ai_recommendation: string
  salary_estimate: string
  is_starred: boolean
  created_at: string
  updated_at: string
}

export interface JobCreate {
  job_title: string
  company: string
  location?: string
  job_type?: string
  salary_min?: number
  salary_max?: number
  job_url?: string
  job_description?: string
  status?: JobStatus
  applied_date?: string
  deadline?: string
  notes?: string
  is_starred?: boolean
}

export interface Interview {
  id: number
  job_id: number
  round_name: string
  scheduled_at: string | null
  interview_type: string
  interviewer_name: string
  status: string
  feedback: string
  created_at: string
}

export interface QAItem {
  id: number
  question: string
  answer: string
  type: string
  is_practiced: boolean
}

export interface DashboardStats {
  total: number
  saved: number
  applied: number
  interview: number
  offer: number
  rejected: number
  acceptance_rate: number
  avg_match_score: number
}

export interface MatchAnalysis {
  match_score: number
  matching_skills: string[]
  missing_skills: string[]
  recommendation: string
  salary_estimate: string
}
export interface CareerChat {
  id?: number;
  role: "user" | "assistant";
  message: string;
}
export interface InterviewEvaluation{

overall_score:number;

technical_score:number;

communication_score:number;

confidence_score:number;

grammar_score:number;

feedback:string;

mistakes:string;

better_answer:string;

tips:string;

}
