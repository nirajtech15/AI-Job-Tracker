import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getJobs, deleteJob, toggleStar, updateJobStatus } from '../api'
import type { Job, JobStatus } from '../types'
import {
  PlusCircle, Search, Star, Trash2, ExternalLink,
  Briefcase, ArrowRight, Filter, ChevronDown
} from 'lucide-react'

const STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' },
]

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-600',
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-yellow-100 text-yellow-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  accepted: 'bg-emerald-100 text-emerald-700',
}

export default function Jobs() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', status, search, sortBy],
    queryFn: () => getJobs({ status: status === 'all' ? undefined : status, search: search || undefined, sort_by: sortBy }),
  })

  const starMutation = useMutation({
    mutationFn: toggleStar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries({ queryKey: ['jobs'] }) },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) => updateJobStatus(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">All Jobs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/jobs/add" className="btn-primary"><PlusCircle size={16} /> Add Job</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 w-full"
            placeholder="Search by job title or company..."
          />
        </div>
        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-auto">
          <option value="created_at">Latest first</option>
          <option value="match_score">Best match</option>
          <option value="company">Company A–Z</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setStatus(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              status === s.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-50" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-14 text-center">
          <Briefcase size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">Koi job nahi mili</p>
          <Link to="/jobs/add" className="btn-primary mt-4 inline-flex"><PlusCircle size={15} /> Add Job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j: Job) => (
            <div key={j.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* Company initial */}
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                  {j.company[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{j.job_title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {j.company}
                        {j.location && ` • ${j.location}`}
                        {j.job_type && ` • ${j.job_type}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Match score */}
                      {j.match_score !== null && (
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          j.match_score >= 70 ? 'bg-green-100 text-green-700' :
                          j.match_score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {j.match_score}% match
                        </div>
                      )}
                      {/* Status dropdown */}
                      <select
                        value={j.status}
                        onChange={e => statusMutation.mutate({ id: j.id, s: e.target.value })}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-indigo-400 cursor-pointer ${STATUS_COLORS[j.status]}`}
                      >
                        {STATUSES.filter(s => s.value !== 'all').map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {j.applied_date && (
                      <span className="text-xs text-gray-400">Applied: {j.applied_date}</span>
                    )}
                    {j.deadline && (
                      <span className="text-xs text-red-400">Deadline: {j.deadline}</span>
                    )}
                    {j.cover_letter && (
                      <span className="text-xs text-green-600 font-medium">✓ Cover letter</span>
                    )}
                    {j.salary_min && (
                      <span className="text-xs text-gray-500">
                        ₹{(j.salary_min / 100000).toFixed(1)}L – ₹{((j.salary_max || 0) / 100000).toFixed(1)}L
                      </span>
                    )}

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => starMutation.mutate(j.id)}
                        className={`p-1.5 rounded-lg transition-colors ${j.is_starred ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}>
                        <Star size={14} className={j.is_starred ? 'fill-amber-400' : ''} />
                      </button>
                      {j.job_url && (
                        <a href={j.job_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate(j.id) }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <Link to={`/jobs/${j.id}`}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline ml-1">
                        Open <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
