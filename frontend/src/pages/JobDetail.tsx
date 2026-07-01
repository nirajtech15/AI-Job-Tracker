import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getJob, generateCoverLetter, generateQA, getQA,
  analyzeJob, togglePracticed, deleteJob, updateJob
} from '../api'
import {
  Sparkles, Copy, Check, Loader2, ArrowLeft, Star,
  ExternalLink, Trash2, ChevronDown, ChevronUp,
  Brain, FileText, MessageSquare, TrendingUp, CheckCircle, XCircle
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-600', applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-yellow-100 text-yellow-700', interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600',
  accepted: 'bg-emerald-100 text-emerald-700',
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3">
      {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
    </button>
  )
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const jobId = parseInt(id!)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'cover' | 'qa' | 'analysis'>('overview')
  const [expandedQA, setExpandedQA] = useState<number | null>(null)

  const { data: job, isLoading } = useQuery({ queryKey: ['job', jobId], queryFn: () => getJob(jobId) })
  const { data: qaData, refetch: refetchQA } = useQuery({ queryKey: ['qa', jobId], queryFn: () => getQA(jobId), enabled: activeTab === 'qa' })

  const coverMutation = useMutation({
    mutationFn: () => generateCoverLetter(jobId),
    onSuccess: () => { toast.success('Cover letter ready! ✨'); qc.invalidateQueries({ queryKey: ['job', jobId] }) },
    onError: () => toast.error('Error generating cover letter. Check your GEMINI_API_KEY'),
  })

  const qaMutation = useMutation({
    mutationFn: () => generateQA(jobId, 8),
    onSuccess: () => { toast.success('Interview Q&A ready! 🎯'); refetchQA() },
    onError: () => toast.error('Error generating Q&A'),
  })

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeJob(jobId),
    onSuccess: () => { toast.success('Analysis complete! 📊'); qc.invalidateQueries({ queryKey: ['job', jobId] }) },
    onError: () => toast.error('Error analyzing job'),
  })

  const practicedMutation = useMutation({
    mutationFn: togglePracticed,
    onSuccess: () => refetchQA(),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => { toast.success('Deleted'); navigate('/jobs') },
  })

  const starMutation = useMutation({
    mutationFn: () => updateJob(jobId, { is_starred: !job?.is_starred }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job', jobId] }),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={30} className="animate-spin text-indigo-400" />
    </div>
  )
  if (!job) return <div className="text-center text-gray-400 mt-20">Job not found</div>

  const matchingSkills = (() => { try { return JSON.parse(job.matching_skills || '[]') } catch { return [] } })()
  const missingSkills = (() => { try { return JSON.parse(job.missing_skills || '[]') } catch { return [] } })()

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <FileText size={15} /> },
    { key: 'cover', label: 'Cover Letter', icon: <Sparkles size={15} /> },
    { key: 'qa', label: 'Interview Q&A', icon: <MessageSquare size={15} /> },
    { key: 'analysis', label: 'AI Analysis', icon: <TrendingUp size={15} /> },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={15} /> Back to Jobs
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-lg uppercase shrink-0">
              {job.company[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {job.job_title}
                {job.is_starred && <Star size={16} className="text-amber-400 fill-amber-400" />}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {job.company}
                {job.location && ` • ${job.location}`}
                {job.job_type && ` • ${job.job_type}`}
              </p>
              {(job.salary_min || job.salary_max) && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  ₹{((job.salary_min || 0) / 100000).toFixed(1)}L – ₹{((job.salary_max || 0) / 100000).toFixed(1)}L
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[job.status]}`}>
              {job.status}
            </span>
            {job.match_score !== null && (
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                job.match_score >= 70 ? 'border-green-400 text-green-600' :
                job.match_score >= 40 ? 'border-yellow-400 text-yellow-600' : 'border-red-300 text-red-500'
              }`}>
                {job.match_score}%
              </div>
            )}
            <button onClick={() => starMutation.mutate()} className={`p-2 rounded-xl transition-colors ${job.is_starred ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}>
              <Star size={16} className={job.is_starred ? 'fill-amber-400' : ''} />
            </button>
            {job.job_url && (
              <a href={job.job_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <ExternalLink size={16} />
              </a>
            )}
            <button onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate() }}
              className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
          {job.applied_date && <span>Applied: <strong className="text-gray-700">{job.applied_date}</strong></span>}
          {job.deadline && <span>Deadline: <strong className="text-red-600">{job.deadline}</strong></span>}
          <span>Added: <strong className="text-gray-700">{new Date(job.created_at).toLocaleDateString('en-IN')}</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {job.notes && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">📝 My Notes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{job.notes}</p>
            </div>
          )}
          {job.job_description && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">📋 Job Description</h3>
              <pre className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-sans">{job.job_description}</pre>
            </div>
          )}
          {/* AI quick actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">🤖 AI Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => { setActiveTab('cover'); if (!job.cover_letter) coverMutation.mutate() }}
                className="btn-primary text-xs py-2">
                <Sparkles size={13} /> Generate Cover Letter
              </button>
              <button onClick={() => { setActiveTab('qa'); qaMutation.mutate() }}
                className="btn-secondary text-xs py-2">
                <MessageSquare size={13} /> Generate Interview Q&A
              </button>
              <button onClick={() => { setActiveTab('analysis'); analyzeMutation.mutate() }}
                className="btn-secondary text-xs py-2">
                <Brain size={13} /> Analyze Job Fit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COVER LETTER TAB ── */}
      {activeTab === 'cover' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-gray-900">AI Cover Letter</h2>
              <p className="text-xs text-gray-500 mt-0.5">Gemini AI ne tumhare skills ke basis pe generate kiya</p>
            </div>
            <div className="flex gap-2">
              {job.cover_letter && <CopyBtn text={job.cover_letter} />}
              <button onClick={() => coverMutation.mutate()} disabled={coverMutation.isPending}
                className="btn-primary text-xs py-2">
                {coverMutation.isPending
                  ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                  : <><Sparkles size={13} /> {job.cover_letter ? 'Regenerate' : 'Generate'}</>}
              </button>
            </div>
          </div>

          {job.cover_letter ? (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{job.cover_letter}</pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Cover letter abhi generate nahi hua</p>
              <p className="text-xs mt-1">Upar "Generate" button dabao</p>
            </div>
          )}
        </div>
      )}

      {/* ── Q&A TAB ── */}
      {activeTab === 'qa' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-gray-900">Interview Prep Q&A</h2>
              <p className="text-xs text-gray-500 mt-0.5">AI generated questions — mark as practiced when done</p>
            </div>
            <button onClick={() => qaMutation.mutate()} disabled={qaMutation.isPending}
              className="btn-primary text-xs py-2">
              {qaMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Brain size={13} /> {qaData?.qa_list?.length ? 'Regenerate' : 'Generate Q&A'}</>}
            </button>
          </div>

          {qaData?.qa_list?.length ? (
            <div className="space-y-3">
              {qaData.qa_list.map((qa, i) => (
                <div key={qa.id}
                  className={`border rounded-xl transition-colors ${qa.is_practiced ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'}`}>
                  <button
                    onClick={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}
                    className="w-full text-left p-4 flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      qa.is_practiced ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium capitalize">
                          {qa.type}
                        </span>
                        {qa.is_practiced && <span className="text-xs text-green-600 font-medium">✓ Practiced</span>}
                      </div>
                      <p className="font-medium text-gray-900 text-sm mt-1 text-left">{qa.question}</p>
                    </div>
                    {expandedQA === qa.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </button>
                  {expandedQA === qa.id && (
                    <div className="px-4 pb-4 ml-9">
                      <div className="bg-white rounded-lg p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                        {qa.answer}
                      </div>
                      <button
                        onClick={() => practicedMutation.mutate(qa.id)}
                        className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          qa.is_practiced
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                        {qa.is_practiced ? 'Mark as Not Practiced' : '✓ Mark as Practiced'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="text-xs text-gray-400 text-center pt-2">
                {qaData.qa_list.filter(q => q.is_practiced).length}/{qaData.qa_list.length} questions practiced
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Q&A abhi generate nahi hua</p>
              <p className="text-xs mt-1">Job description add karo pehle, phir generate karo</p>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYSIS TAB ── */}
      {activeTab === 'analysis' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-gray-900">AI Job Fit Analysis</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tumhara profile vs job requirements</p>
            </div>
            <button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}
              className="btn-primary text-xs py-2">
              {analyzeMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</>
                : <><TrendingUp size={13} /> {job.match_score !== null ? 'Re-analyze' : 'Analyze Now'}</>}
            </button>
          </div>

          {job.match_score !== null ? (
            <div className="space-y-5">
              {/* Score */}
              <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold shrink-0 ${
                  job.match_score >= 70 ? 'border-green-400 text-green-600 bg-green-50' :
                  job.match_score >= 40 ? 'border-yellow-400 text-yellow-600 bg-yellow-50' :
                  'border-red-300 text-red-500 bg-red-50'
                }`}>
                  {job.match_score}%
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Match Score</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {job.match_score >= 70 ? '🟢 Strong match — Apply karo!' :
                     job.match_score >= 40 ? '🟡 Average match — Skills improve karo' :
                     '🔴 Low match — Missing skills seekho pehle'}
                  </div>
                  {job.salary_estimate && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      💰 Estimated: {job.salary_estimate}
                    </div>
                  )}
                </div>
              </div>

              {/* Matching skills */}
              {matchingSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-500" /> Matching Skills
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {matchingSkills.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {missingSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                    <XCircle size={15} className="text-red-400" /> Skills to Learn
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {missingSkills.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {job.ai_recommendation && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-900 text-sm mb-1 flex items-center gap-2">
                    <Sparkles size={14} /> AI Recommendation
                  </h3>
                  <p className="text-indigo-800 text-sm leading-relaxed">{job.ai_recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Brain size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Analysis abhi nahi hua</p>
              <p className="text-xs mt-1">Profile mein skills add karo, phir "Analyze Now" dabao</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
