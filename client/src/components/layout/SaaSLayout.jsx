import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, Briefcase, ChevronDown, Home, LogOut, Menu, X } from 'lucide-react'
import { auth } from '@/services/firebase/client'
import { logoutUser } from '@/services/authService'
import { getUser } from '@/services/userService'
import Notifications from '@/components/notifications/Notifications'
import { getRoleHome } from '@/config/dashboardConfig'
import { useOnboarding } from '@/hooks/useOnboarding'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import './SaaSLayout.css'

import { ROUTES } from '@/config/routes'

const defaultTopLinks = [
  { label: 'Home', to: ROUTES.home, icon: Home },
  { label: 'Internships', to: ROUTES.internships.browse, icon: Briefcase },
]

const getInitial = (user) =>
  (user?.fullName || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()

const SaaSLayout = ({
  sidebarLinks = [],
  topLinks = defaultTopLinks,
  homePath = '/student-dashboard/browse',
  profilePath = '/student-dashboard/profile',
  workspaceLabel = 'Workspace',
  sidebarHelper = 'Track applications, achievements, and community updates from one place.',
}) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        return
      }

      const profile = await getUser(firebaseUser.uid)
      setUser({ ...firebaseUser, ...profile })
    })

    return () => unsubscribe()
  }, [])

  const roleHome = useMemo(() => {
    if (homePath) return homePath
    const role = user?.role === 'org' ? 'organization' : user?.role
    return role ? getRoleHome(role) : '/login'
  }, [homePath, user?.role])

  const role = user?.role === 'org' ? 'organization' : user?.role
  const { run: tourRun, complete: completeTour, skip: skipTour } = useOnboarding(role, user?.uid)

  const handleLogout = async () => {
    await logoutUser()
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <div className="saas-shell">
      <header className="saas-topbar">
        <div className="saas-topbar-left">
          <button
            type="button"
            className="saas-icon-btn saas-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <Link to={roleHome} className="saas-brand">
            <span className="saas-brand-mark">
              <Briefcase size={20} />
            </span>
            <span>MicroIntern</span>
          </Link>
        </div>

        <nav className="saas-topnav" aria-label="Primary navigation">
          {topLinks.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className="saas-topnav-link">
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="saas-topbar-actions">
          {user ? (
            <>
              <Notifications />
              <div className="saas-profile">
                <button
                  type="button"
                  className="saas-profile-btn"
                  onClick={() => setProfileOpen((value) => !value)}
                  aria-label="Open user menu"
                >
                  <span className="saas-avatar">{getInitial(user)}</span>
                  <span className="saas-profile-name">{user.fullName || user.email}</span>
                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="saas-profile-menu">
                    <Link to={profilePath} onClick={() => setProfileOpen(false)}>
                      Profile
                    </Link>
                    <button type="button" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="saas-btn saas-btn-outline">
                Login
              </Link>
              <Link to="/register" className="saas-btn saas-btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="saas-sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`saas-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="saas-sidebar-header">
          <span>{workspaceLabel}</span>
          <button
            type="button"
            className="saas-icon-btn saas-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="saas-sidebar-nav" aria-label="Workspace navigation">
          {sidebarLinks.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="saas-sidebar-link"
                data-tour={item.tourId ? `nav-${item.tourId}` : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="saas-sidebar-card">
          <Bell size={18} />
          <div>
            <strong>Stay current</strong>
            <p>{sidebarHelper}</p>
          </div>
        </div>
      </aside>

      <main className="saas-main">
        <div className="saas-content dashboard-container">
          <Outlet />
        </div>
      </main>

      <OnboardingTour run={tourRun} role={role} onComplete={completeTour} onSkip={skipTour} />
    </div>
  )
}

export default SaaSLayout
