import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import StudentLayout from '@/components/layout/StudentLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import OrgLayout from '@/components/layout/OrgLayout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import Home from '@/pages/public/Home'
import StudentDashboard from '@/pages/student/StudentDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUtilities from '@/pages/admin/AdminUtilities'
import AdminCommunity from '@/pages/admin/AdminCommunity'
import OrganizationDashboard from '@/pages/organization/OrganizationDashboard'
import OrgCommunity from '@/pages/organization/OrgCommunity'
import Achievements from '@/pages/student/Achievements'
import Profile from '@/pages/student/Profile'
import AdminProfilePage from '@/pages/profile/AdminProfilePage'
import OrganizationProfilePage from '@/pages/profile/OrganizationProfilePage'
import Community from '@/pages/public/Community'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import InternshipDetail from '@/pages/public/InternshipDetail'
import Internships from '@/pages/public/Internships'
import ForgotPassword from '@/pages/public/ForgotPassword'
import Terms from '@/pages/public/Terms'
import Privacy from '@/pages/public/Privacy'
import { useInternshipNotifications } from '@/hooks/useNotifications'
import { validateAllRoutes } from '@/utils/routeValidation'
import './App.css'

const InternshipLegacyRedirect = () => {
  const { id } = useParams()
  return <Navigate to={`/internships/${id}`} replace />
}

// Validate all routes on app startup
if (process.env.NODE_ENV === 'development') {
  validateAllRoutes()
}

const PublicLayout = () => (
  <>
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
  </>
)

function App() {
  // Enable internship notifications for students
  useInternshipNotifications()

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>

            <Route path="/student-dashboard/internships/:id" element={<InternshipLegacyRedirect />} />

            <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="browse" replace />} />
                <Route path="browse" element={<StudentDashboard section="internships" unified />} />
                <Route path="applications" element={<StudentDashboard section="applications" unified />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="community" element={<Community role="student" />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminDashboard section="overview" unified />} />
              <Route path="users" element={<AdminDashboard section="users" unified />} />
              <Route path="internships" element={<AdminDashboard section="internships" unified />} />
              <Route path="reports" element={<AdminDashboard section="analytics" unified />} />
              <Route path="community" element={<AdminCommunity />} />
              <Route path="utilities" element={<AdminUtilities />} />
            </Route>
            <Route path="/profile/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminProfilePage />} />
            </Route>

            <Route path="/org-dashboard" element={<ProtectedRoute role="organization"><OrgLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OrganizationDashboard section="overview" unified />} />
              <Route path="internships" element={<OrganizationDashboard section="internships" unified />} />
              <Route path="applications" element={<OrganizationDashboard section="applications" unified />} />
              <Route path="community" element={<OrgCommunity />} />
            </Route>
            <Route path="/profile/organization" element={<ProtectedRoute role="organization"><OrgLayout /></ProtectedRoute>}>
              <Route index element={<OrganizationProfilePage />} />
            </Route>

            <Route path="/achievements" element={<Navigate to="/student-dashboard/achievements" replace />} />
            <Route path="/community" element={<Navigate to="/student-dashboard/community" replace />} />
            <Route path="/profile" element={<Navigate to="/student-dashboard/profile" replace />} />
            <Route path="/profile/student" element={<Navigate to="/student-dashboard/profile" replace />} />
            
            {/* Backward compatibility redirects */}
            <Route path="/admin-utils" element={<Navigate to="/admin-dashboard/utilities" replace />} />
            
            {/* Catch-all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
