import { BarChart3, Briefcase, FileText, Users, MessageCircle, Settings, Award, User, Home } from 'lucide-react'

/**
 * Centralized dashboard configuration for all roles
 * Defines sidebar links, routes, and navigation structure
 * Ensures consistency across role-based UX
 */

export const ROLE_HOMES = {
  admin: '/admin-dashboard/overview',
  organization: '/org-dashboard/overview',
  student: '/student-dashboard/browse',
}

export const DASHBOARD_CONFIGS = {
  admin: {
    route: '/admin-dashboard',
    home: '/admin-dashboard/overview',
    profile: '/profile/admin',
    workspaceLabel: 'Admin Console',
    sidebarHelper: 'Manage users, approvals, reporting, and platform governance.',
    sidebarLinks: [
      { label: 'Overview', to: '/admin-dashboard/overview', icon: BarChart3, tourId: 'overview' },
      { label: 'Users', to: '/admin-dashboard/users', icon: Users, tourId: 'users' },
      { label: 'Internships', to: '/admin-dashboard/internships', icon: Briefcase, tourId: 'internships' },
      { label: 'Reports', to: '/admin-dashboard/reports', icon: FileText, tourId: 'reports' },
      { label: 'Community', to: '/admin-dashboard/community', icon: MessageCircle, tourId: 'community' },
      { label: 'Utilities', to: '/admin-dashboard/utilities', icon: Settings, tourId: 'utilities' },
    ],
    topLinks: [
      { label: 'Home', to: '/', icon: Home },
      { label: 'Internships', to: '/internships', icon: Briefcase },
      { label: 'Console', to: '/admin-dashboard/overview', icon: BarChart3 },
    ],
  },
  organization: {
    route: '/org-dashboard',
    home: '/org-dashboard/overview',
    profile: '/profile/organization',
    workspaceLabel: 'Organization Workspace',
    sidebarHelper: 'Post internships, review applicants, and manage hiring activity.',
    sidebarLinks: [
      { label: 'Overview', to: '/org-dashboard/overview', icon: BarChart3, tourId: 'overview' },
      { label: 'Internships', to: '/org-dashboard/internships', icon: Briefcase, tourId: 'internships' },
      { label: 'Applications', to: '/org-dashboard/applications', icon: FileText, tourId: 'applications' },
      { label: 'Community', to: '/org-dashboard/community', icon: MessageCircle, tourId: 'community' },
    ],
    topLinks: [
      { label: 'Home', to: '/', icon: Home },
      { label: 'Internships', to: '/internships', icon: Briefcase },
      { label: 'Workspace', to: '/org-dashboard/overview', icon: Briefcase },
    ],
  },
  student: {
    route: '/student-dashboard',
    home: '/student-dashboard/browse',
    profile: '/student-dashboard/profile',
    workspaceLabel: 'Student Workspace',
    sidebarHelper: 'Browse internships, track applications, and build your profile.',
    sidebarLinks: [
      { label: 'Browse Internships', to: '/student-dashboard/browse', icon: Briefcase, tourId: 'browse' },
      { label: 'My Applications', to: '/student-dashboard/applications', icon: FileText, tourId: 'applications' },
      { label: 'Achievements', to: '/student-dashboard/achievements', icon: Award, tourId: 'achievements' },
      { label: 'Community', to: '/student-dashboard/community', icon: MessageCircle, tourId: 'community' },
      { label: 'Profile', to: '/student-dashboard/profile', icon: User, tourId: 'profile' },
    ],
    topLinks: [
      { label: 'Home', to: '/', icon: Home },
      { label: 'Internships', to: '/internships', icon: Briefcase },
      { label: 'Dashboard', to: '/student-dashboard/browse', icon: Briefcase },
    ],
  },
}

/**
 * Validate that a sidebar link matches a defined route
 */
export const validateSidebarLinks = (role) => {
  const config = DASHBOARD_CONFIGS[role]
  if (!config) return { valid: false, errors: [`Unknown role: ${role}`] }

  const errors = []
  config.sidebarLinks.forEach((link) => {
    if (!link.to || !link.label || !link.icon) {
      errors.push(`Invalid link: ${JSON.stringify(link)}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Get sidebar links for a specific role
 */
export const getSidebarLinks = (role) => {
  const config = DASHBOARD_CONFIGS[role]
  return config?.sidebarLinks || []
}

/**
 * Get full config for a role
 */
export const getDashboardConfig = (role) => {
  return DASHBOARD_CONFIGS[role] || null
}

/**
 * Get role home URL
 */
export const getRoleHome = (role) => {
  return ROLE_HOMES[role] || '/login'
}

/**
 * List of all valid roles
 */
export const VALID_ROLES = Object.keys(ROLE_HOMES)

/**
 * Validate all dashboard configs for consistency
 */
export const validateAllConfigs = () => {
  const errors = []
  const warnings = []

  VALID_ROLES.forEach((role) => {
    const { valid, errors: linkErrors } = validateSidebarLinks(role)
    if (!valid) {
      errors.push(`Role ${role}: ${linkErrors.join(', ')}`)
    }

    const config = DASHBOARD_CONFIGS[role]
    // Ensure all sidebar link routes are consistent
    config.sidebarLinks.forEach((link) => {
      if (!link.to.startsWith(config.route)) {
        warnings.push(`Role ${role}: Link "${link.label}" (${link.to}) doesn't start with role route (${config.route})`)
      }
    })
  })

  return { valid: errors.length === 0, errors, warnings }
}

// Validate on module load in development
if (process.env.NODE_ENV === 'development') {
  const validation = validateAllConfigs()
  if (!validation.valid) {
    console.error('Dashboard config validation failed:', validation.errors)
  }
  if (validation.warnings.length > 0) {
    console.warn('Dashboard config warnings:', validation.warnings)
  }
}
