import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register as registerApi } from '../api'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, Loader2 } from 'lucide-react'

interface Form {
  name: string; email: string; password: string
  skills: string; experience_years: number; target_role: string
}

export default function Register() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>()

  const mutation = useMutation({
    mutationFn: (d: Form) => registerApi({ ...d, experience_years: Number(d.experience_years) }),
    onSuccess: (data) => {
      authLogin(data.access_token, data.user)
      toast.success(`Account created! Welcome ${data.user.name} 🎉`)
      navigate('/')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Registration failed'),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start tracking jobs with AI superpowers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input {...register('name', { required: 'Name required' })} className="input" placeholder="Rahul Sharma" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input {...register('email', { required: 'Email required' })} className="input" placeholder="rahul@email.com" type="email" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Password *</label>
                <input {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="input" placeholder="Min 6 characters" type="password" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Target Role</label>
                <input {...register('target_role')} className="input" placeholder="Python Developer" />
              </div>
              <div>
                <label className="label">Experience (Years)</label>
                <input {...register('experience_years')} className="input" placeholder="0" type="number" min={0} />
              </div>
            </div>

            <div>
              <label className="label">Your Skills (for AI cover letters)</label>
              <textarea {...register('skills')} className="input resize-none" rows={3}
                placeholder="Python, FastAPI, React, PostgreSQL, Docker, REST APIs..." />
              <p className="text-xs text-gray-400 mt-1">Yeh skills AI use karega cover letter banane ke liye</p>
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-3 mt-2">
              {mutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account — Free'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
