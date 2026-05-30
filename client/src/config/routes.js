import { ROLE_HOMES } from './dashboardConfig'

/**
 * Application route paths — use these instead of hardcoded strings.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  /** Public internship catalog — all roles and guests */
  internships: {
    browse: '/internships',
    detail: (id) => `/internships/${id}`,
  },
  student: {
    root: '/student-dashboard',
    home: ROLE_HOMES.student,
    browse: '/student-dashboard/browse',
    applications: '/student-dashboard/applications',
    achievements: '/student-dashboard/achievements',
    community: '/student-dashboard/community',
    profile: '/student-dashboard/profile',
    internship: (id) => `/internships/${id}`,
  },
  admin: {
    root: '/admin-dashboard',
    home: ROLE_HOMES.admin,
    overview: '/admin-dashboard/overview',
    users: '/admin-dashboard/users',
    internships: '/admin-dashboard/internships',
    reports: '/admin-dashboard/reports',
    community: '/admin-dashboard/community',
    utilities: '/admin-dashboard/utilities',
    profile: '/profile/admin',
  },
  organization: {
    root: '/org-dashboard',
    home: ROLE_HOMES.organization,
    overview: '/org-dashboard/overview',
    internships: '/org-dashboard/internships',
    applications: '/org-dashboard/applications',
    community: '/org-dashboard/community',
    profile: '/profile/organization',
  },
}

/** Legacy paths → canonical role-based routes */
export const LEGACY_REDIRECTS = {
  '/achievements': ROUTES.student.achievements,
  '/community': ROUTES.student.community,
  '/profile': ROUTES.student.profile,
  '/profile/student': ROUTES.student.profile,
  '/admin-utils': ROUTES.admin.utilities,
}
