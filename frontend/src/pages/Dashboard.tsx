import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Insights from "../components/dashboard/Insights";
import UpcomingInterviews from "../components/dashboard/UpcomingInterviews";
import {
  Briefcase, Send, Users, Trophy, XCircle,
  TrendingUp, PlusCircle, ArrowRight, Star
} from 'lucide-react'
import type { Job } from '../types'
import {
  getStats,
  getJobs,
  getDashboardAnalytics,
  getDashboardChart,
  getDashboardReminders,
   getDashboardInsights,
  getUpcomingInterviews,
} from "../api";


import ApplicationChart from "../components/dashboard/ApplicationChart";
import StatusPie from "../components/dashboard/StatusPie";
const STATUS_COLORS: Record<string, string> = {
  saved: 'badge-saved', applied: 'badge-applied', screening: 'badge-screening',
  interview: 'badge-interview', offer: 'badge-offer', rejected: 'badge-rejected', accepted: 'badge-accepted',
}

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-300 text-xs">No score</span>
  const color = score >= 70 ? 'text-green-600 border-green-400' : score >= 40 ? 'text-yellow-600 border-yellow-400' : 'text-red-500 border-red-300'
  return (
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${color}`}>
      {score}%
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats })
  const { data: recent = [] } = useQuery({ queryKey: ['jobs', 'recent'], queryFn: () => getJobs({ sort_by: 'created_at' }) })
  const { data: insights } = useQuery({
  queryKey: ["dashboard-insights"],
  queryFn: getDashboardInsights,
});

const { data: upcoming = [] } = useQuery({
  queryKey: ["dashboard-upcoming"],
  queryFn: getUpcomingInterviews,
});
const { data: analytics } = useQuery({
  queryKey: ["dashboard-analytics"],
  queryFn: getDashboardAnalytics,
});

const { data: chart = [] } = useQuery({
  queryKey: ["dashboard-chart"],
  queryFn: getDashboardChart,
});

const { data: reminders = [] } = useQuery({
  queryKey: ["dashboard-reminders"],
  queryFn: getDashboardReminders,
});
  const STAT_CARDS = [
    { label: 'Total Jobs', value: stats?.total ?? 0, icon: <Briefcase size={20} />, color: 'bg-indigo-500', sub: 'tracked' },
    { label: 'Applied', value: stats?.applied ?? 0, icon: <Send size={20} />, color: 'bg-blue-500', sub: 'applications sent' },
    { label: 'Interviews', value: stats?.interview ?? 0, icon: <Users size={20} />, color: 'bg-purple-500', sub: 'rounds scheduled' },
    { label: 'Offers', value: stats?.offer ?? 0, icon: <Trophy size={20} />, color: 'bg-green-500', sub: 'received' },
    { label: 'Rejected', value: stats?.rejected ?? 0, icon: <XCircle size={20} />, color: 'bg-red-400', sub: 'not selected' },
    { label: 'Success Rate', value: `${stats?.acceptance_rate ?? 0}%`, icon: <TrendingUp size={20} />, color: 'bg-amber-500', sub: 'offer / applied' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">👋 Hello, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats?.total === 0 ? 'Pehli job add karo aur AI se cover letter banao!' : `${stats?.total} jobs track ho rahe hain`}
          </p>
        </div>
        <Link to="/jobs/add" className="btn-primary">
          <PlusCircle size={16} /> Add New Job
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center text-white mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>
{/* {analytics && (
  <div className="mt-8">
    <KpiCards data={analytics} />
  </div>
)} */}
{analytics && (
  <div className="grid lg:grid-cols-2 gap-6 mt-8">
    <ApplicationChart data={chart} />
    <StatusPie data={analytics} />
  </div>
)}
      {/* Avg match score */}
      {(stats?.avg_match_score ?? 0) > 0 && (
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-400 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {stats?.avg_match_score}%
          </div>
          <div>
            <div className="font-semibold text-gray-900">Average AI Match Score</div>
            <div className="text-sm text-gray-500">Job descriptions ke against tumhara average fit score</div>
          </div>
        </div>
      )}

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Recent Jobs</h2>
          <Link to="/jobs" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Koi job nahi mili</p>
            <p className="text-gray-400 text-sm mt-1">Pehli job add karo aur AI features try karo</p>
            <Link to="/jobs/add" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={16} /> Add First Job
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">AI Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Added</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.slice(0, 6).map((j: Job) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {j.is_starred && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                        <div>
                          <div className="font-semibold text-gray-900">{j.job_title}</div>
                          <div className="text-xs text-gray-500">{j.company} {j.location && `• ${j.location}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[j.status] || ''}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <ScoreRing score={j.match_score} />
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400">
                      {new Date(j.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/jobs/${j.id}`} className="text-indigo-600 text-xs font-medium hover:underline flex items-center gap-1 justify-end">
                        Open <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
     <div className="grid lg:grid-cols-2 gap-6 mt-8">

  {insights && (
    <Insights data={insights} />
  )}

  <UpcomingInterviews data={upcoming} />

</div> 
{reminders.length > 0 && (
  <div className="card p-5 mt-8">
    <h2 className="font-bold text-lg mb-4">
      Follow-up Reminders
    </h2>

    {reminders.map((r: any) => (
      <div
        key={r.id}
        className="border-b py-2"
      >
        <div className="font-semibold">
          {r.company}
        </div>

        <div className="text-sm text-gray-500">
          {r.follow_up_date}
        </div>
      </div>
    ))}
  </div>
)}
      {/* Quick tips */}
      {stats?.total === 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { emoji: '1️⃣', title: 'Job Add Karo', desc: 'Job title, company aur description paste karo' },
            { emoji: '2️⃣', title: 'AI se Analyze Karo', desc: 'Match score dekho — tumhara profile kitna fit hai' },
            { emoji: '3️⃣', title: 'Cover Letter Generate Karo', desc: 'Gemini AI ek personalized letter likhega' },
          ].map(t => (
            <div key={t.title} className="card p-5 text-center border-dashed">
              <div className="text-3xl mb-3">{t.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{t.title}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </div>
          ))}
        </div>
        
      )}
    </div>
    
  )
}

