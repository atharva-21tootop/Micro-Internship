import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, Briefcase, Home, LogIn } from 'lucide-react'
import './Header.css'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import Notifications from '@/components/notifications/Notifications'
import { logoutUser } from '@/services/authService'
import { ROUTES } from '@/config/routes'
import { getRoleHome } from '@/config/dashboardConfig'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUser(firebaseUser.uid)
        setUser({ ...firebaseUser, ...userData })
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const navigation = [
    { name: 'Home', href: ROUTES.home, icon: Home },
    { name: 'Internships', href: ROUTES.internships.browse, icon: Briefcase },
  ]

  const isActive = (path) => {
    if (path === ROUTES.internships.browse) {
      return location.pathname === path || location.pathname.startsWith('/internships/')
    }
    return location.pathname === path
  }

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Briefcase className="logo-icon" />
            <span>MicroIntern</span>
          </Link>

          <nav className="nav-desktop">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                {user.role === 'student' && (
                  <Link to={getRoleHome('student')} className="btn btn-outline">
                    <User size={18} />
                    Dashboard
                  </Link>
                )}
                {(user.role === 'organization' || user.role === 'org') && (
                  <Link to={getRoleHome('organization')} className="btn btn-outline">
                    <Briefcase size={18} />
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to={getRoleHome('admin')} className="btn btn-outline">
                    <User size={18} />
                    Admin
                  </Link>
                )}
                <Notifications />
                <div className="profile-wrapper">
                  <button
                    className="profile-avatar"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-label="Open profile menu"
                  >
                    {user.displayName ? user.displayName.charAt(0) : (user.email || 'U').charAt(0)}
                  </button>

                  {isProfileOpen && (
                    <div className="profile-menu">
                      <Link
                        to={
                          user.role === 'admin'
                            ? ROUTES.admin.profile
                            : user.role === 'organization' || user.role === 'org'
                              ? ROUTES.organization.profile
                              : ROUTES.student.profile
                        }
                        className="profile-menu-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                      <button className="profile-menu-item" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  <LogIn size={18} />
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="nav-mobile">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              )
            })}
            <div className="mobile-actions">
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
