import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createJob } from '../api'
import type { JobCreate } from '../types'
import { Loader2, PlusCircle, Lightbulb } from 'lucide-react'

export default function AddJob() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<JobCreate>()

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: (data) => {
      toast.success('Job added! Ab AI features use karo 🎉')
      qc.invalidateQueries({ queryKey: ['jobs'] })
      navigate(`/jobs/${data.id}`)
    },
    onError: () => toast.error('Job add karne mein error aaya'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Add New Job</h1>
        <p className="text-gray-500 text-sm mt-1">Job details save karo — phir AI se cover letter aur Q&A banao</p>
      </div>

      {/* Tip */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <Lightbulb size={18} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-700">
          <strong>Tip:</strong> Job description field mein poori JD paste karo — AI usi se cover letter aur interview questions generate karega!
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          {/* Title + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input {...register('job_title', { required: 'Job title required' })}
                className="input" placeholder="Python Backend Developer" />
              {errors.job_title && <p className="text-red-500 text-xs mt-1">{errors.job_title.message}</p>}
            </div>
            <div>
              <label className="label">Company *</label>
              <input {...register('company', { required: 'Company required' })}
                className="input" placeholder="Google, Infosys, Startup..." />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
            </div>
          </div>

          {/* Location + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="Bangalore / Remote" />
            </div>
            <div>
              <label className="label">Job Type</label>
              <select {...register('job_type')} className="input">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Salary (₹)</label>
              <input {...register('salary_min', { valueAsNumber: true })}
                className="input" placeholder="600000" type="number" />
            </div>
            <div>
              <label className="label">Max Salary (₹)</label>
              <input {...register('salary_max', { valueAsNumber: true })}
                className="input" placeholder="1000000" type="number" />
            </div>
          </div>

          {/* URL + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job URL</label>
              <input {...register('job_url')} className="input" placeholder="https://linkedin.com/jobs/..." />
            </div>
            <div>
              <label className="label">Current Status</label>
              <select {...register('status')} className="input">
                <option value="saved">💾 Saved</option>
                <option value="applied">📤 Applied</option>
                <option value="screening">📞 Screening</option>
                <option value="interview">🎯 Interview</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Applied Date</label>
              <input {...register('applied_date')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input {...register('deadline')} type="date" className="input" />
            </div>
          </div>

          {/* JD */}
          <div>
            <label className="label">Job Description * <span className="text-indigo-500 normal-case font-normal">(AI isko use karega)</span></label>
            <textarea {...register('job_description')} className="input resize-none" rows={6}
              placeholder="Yahan poori job description paste karo — requirements, responsibilities, tech stack sab kuch..." />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Personal Notes</label>
            <textarea {...register('notes')} className="input resize-none" rows={2}
              placeholder="Referral hai, salary negotiable hai, growth scope acha hai..." />
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-3">
            {mutation.isPending
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><PlusCircle size={16} /> Save Job & Open Detail</>}
          </button>
        </form>
      </div>
    </div>
  )
}
