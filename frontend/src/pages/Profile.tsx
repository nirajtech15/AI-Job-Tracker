import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updateMe, improveBullet } from '../api'
import { useAuth } from '../hooks/useAuth'
import { Loader2, Save, Sparkles, ArrowRight, User, Lightbulb } from 'lucide-react'

export default function Profile() {
  const { user, login, token } = useAuth()
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      skills: user?.skills || '',
      experience_years: user?.experience_years || 0,
      target_role: user?.target_role || '',
    }
  })

  // Bullet improver state
  const [bullet, setBullet] = useState('')
  const [improvedBullet, setImprovedBullet] = useState('')

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      toast.success('Profile updated! ✅')
      login(token!, data)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Update failed'),
  })

  const bulletMutation = useMutation({
    mutationFn: () => improveBullet(bullet, user?.target_role || 'Software Developer'),
    onSuccess: (data) => setImprovedBullet(data.improved),
    onError: () => toast.error('Could not improve bullet. Check Gemini API key.'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Skills update karo — AI better cover letters banayega</p>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold uppercase">
            {user?.name?.[0]}
          </div>
          <div>
            <div className="font-bold text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => updateMutation.mutate({ ...d, experience_years: Number(d.experience_years) }))}
          className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input {...register('name', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Target Role</label>
              <input {...register('target_role')} className="input" placeholder="Python Backend Developer" />
            </div>
            <div>
              <label className="label">Experience (Years)</label>
              <input {...register('experience_years')} type="number" min={0} className="input" />
            </div>
          </div>

          <div>
            <label className="label">
              Your Skills
              <span className="ml-1 text-indigo-500 font-normal normal-case">(AI cover letters ke liye important)</span>
            </label>
            <textarea {...register('skills')} className="input resize-none" rows={4}
              placeholder="Python, FastAPI, React TypeScript, PostgreSQL, Docker, REST APIs, Git, LangChain, Redis..." />
            <p className="text-xs text-gray-400 mt-1.5">
              Jitni zyada skills likhoge utna better AI cover letter banega
            </p>
          </div>

          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Profile</>}
          </button>
        </form>
      </div>

      {/* AI Bullet Point Improver */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-indigo-500" />
          <h2 className="font-bold text-gray-900">AI Resume Bullet Improver</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Resume ka koi bhi boring bullet point paste karo — AI use powerful banayega</p>

        <div className="space-y-3">
          <div>
            <label className="label">Original Bullet Point</label>
            <textarea
              value={bullet}
              onChange={e => setBullet(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="e.g. Made API endpoints for the app using Python"
            />
          </div>

          <button
            onClick={() => bulletMutation.mutate()}
            disabled={!bullet.trim() || bulletMutation.isPending}
            className="btn-primary text-sm py-2">
            {bulletMutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Improving...</>
              : <><Sparkles size={14} /> Improve with AI</>}
          </button>

          {improvedBullet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ArrowRight size={12} className="text-green-500" />
                <span className="font-medium text-green-600">Improved Version:</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{improvedBullet}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(improvedBullet); toast.success('Copied!') }}
                className="btn-secondary text-xs py-1.5">
                Copy Improved Bullet
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
          <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>Example:</strong> "Made API endpoints" →
            "Designed and implemented 15+ RESTful API endpoints using FastAPI, reducing response time by 40%"
          </p>
        </div>
      </div>

      {/* Account info */}
      <div className="card p-5 bg-gray-50 border-dashed">
        <div className="flex items-center gap-2 mb-3">
          <User size={15} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700 text-sm">Account Info</h3>
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          <div>Email: <span className="text-gray-700 font-medium">{user?.email}</span></div>
          <div>Member since: <span className="text-gray-700 font-medium">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'N/A'}
          </span></div>
        </div>
      </div>
    </div>
  )
}
