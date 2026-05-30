import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { getRoleHome, VALID_ROLES } from '@/config/dashboardConfig'

const normalizeRole = (role) => {
  if (role === 'org') return 'organization'
  if (VALID_ROLES.includes(role)) return role
  return null
}

/**
 * AuthLoadingSkeleton - Prevents layout flicker during auth resolution
 * Renders a full-page skeleton matching the SaaS layout structure
 */
const AuthLoadingSkeleton = () => (
  <div className="auth-loading-skeleton" style={{
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.08), transparent 28rem), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      animation: 'saas-page-enter 0.3s ease-out',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        opacity: 0.8,
        animation: 'pulse-loading 1.2s ease-in-out infinite',
      }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '120px',
          height: '12px',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #e2e8f0 0%, #f8fafc 45%, #e2e8f0 100%)',
          backgroundSize: '200% 100%',
          animation: 'ui-skeleton 1.2s linear infinite',
        }} />
        <div style={{
          width: '80px',
          height: '10px',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #e2e8f0 0%, #f8fafc 45%, #e2e8f0 100%)',
          backgroundSize: '200% 100%',
          animation: 'ui-skeleton 1.2s linear infinite',
        }} />
      </div>
    </div>
    <style>{`
      @keyframes pulse-loading {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
    `}</style>
  </div>
)

/**
 * ProtectedRoute - Prevents unauthorized access and UI flicker
 * 
 * Features:
 * - Centralized role normalization
 * - Full skeleton loading state during auth check (prevents flicker)
 * - Graceful redirect on auth failure
 * - Supports single role or multiple roles
 */
const ProtectedRoute = ({ children, allowedRoles, role }) => {
  const location = useLocation()
  const [state, setState] = useState({ loading: true, authorized: null })
  const roles = allowedRoles || (role ? [role] : [])
  const rolesKey = roles.map(normalizeRole).filter(Boolean).join('|')

  useEffect(() => {
    let isMounted = true

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return

      if (!firebaseUser) {
        setState({ loading: false, authorized: false, redirectTo: '/login', userRole: null })
        return
      }

      try {
        const profile = await getUser(firebaseUser.uid)
        const userRole = normalizeRole(profile?.role)

        if (!isMounted) return

        // Check if user role is allowed
        const isAllowed = Boolean(userRole) && (!rolesKey || rolesKey.split('|').includes(userRole))

        if (isAllowed) {
          setState({ loading: false, authorized: true, userRole })
        } else {
          const redirectTo = userRole ? getRoleHome(userRole) : '/login'
          setState({ loading: false, authorized: false, redirectTo, userRole })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (isMounted) {
          setState({ loading: false, authorized: false, redirectTo: '/login', userRole: null })
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [rolesKey])

  // During loading: show skeleton to prevent flicker
  if (state.loading) {
    return <AuthLoadingSkeleton />
  }

  // Unauthorized: redirect to appropriate home or login
  if (!state.authorized) {
    const target = state.redirectTo || '/login'
    return <Navigate to={target} replace state={{ from: location }} />
  }

  // Authorized: render children
  return children
}

export default ProtectedRoute
