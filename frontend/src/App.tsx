import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import AddJob from './pages/AddJob'
import Profile from './pages/Profile'
import Resume from "./pages/Resume";
import CareerCoach from "./pages/CareerCoach";
import MockInterview from "./pages/MockInterview";
import Roadmap from "./pages/Roadmap";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobRecommendation from "./pages/JobRecommendation";
import ApplicationAssistant from "./pages/ApplicationAssistant";

function Guard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/add" element={<AddJob />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="resume" element={<Resume />} />
            <Route path="career" element={<CareerCoach />} />
            <Route
    path="mock-interview"
    element={<MockInterview />}
/>
<Route
    path="roadmap"
    element={<Roadmap/>}
/>
<Route
path="resume-builder"
element={<ResumeBuilder/>}
/>
<Route
  path="job-recommendation"
  element={<JobRecommendation />}
/>
<Route
    path="/application-assistant"
    element={<ApplicationAssistant />}
/>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
