export const STUDENT_TOUR_STEPS = [
  {
    target: null,
    title: 'Welcome to MicroIntern',
    content: 'Your verified micro-internship portal for MITAOE. Let us show you around in under a minute.',
    placement: 'center',
  },
  {
    target: '[data-tour="nav-browse"]',
    title: 'Browse Internships',
    content: 'Search and filter verified listings by category, duration, skills, and organization.',
  },
  {
    target: '[data-tour="nav-applications"]',
    title: 'My Applications',
    content: 'Track every application status from submitted to accepted in one timeline.',
  },
  {
    target: '[data-tour="nav-achievements"]',
    title: 'Achievements',
    content: 'Celebrate completed internships and milestones on your student profile.',
  },
  {
    target: '[data-tour="nav-community"]',
    title: 'Community',
    content: 'Join discussions, events, and study groups with peers and mentors.',
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'Complete Your Profile',
    content: 'Add skills and academic details to unlock better AI match scores.',
  },
]

export const ORGANIZATION_TOUR_STEPS = [
  {
    target: null,
    title: 'Organization Workspace',
    content: 'Manage internships and applicants from your dedicated dashboard.',
    placement: 'center',
  },
  {
    target: '[data-tour="nav-overview"]',
    title: 'Dashboard Overview',
    content: 'See active listings, recent applications, and hiring metrics at a glance.',
  },
  {
    target: '[data-tour="nav-internships"]',
    title: 'Create Internships',
    content: 'Post new micro-internship opportunities for MITAOE students.',
  },
  {
    target: '[data-tour="nav-applications"]',
    title: 'Manage Applications',
    content: 'Review candidates, skill match scores, and application status.',
  },
  {
    target: '[data-tour="nav-community"]',
    title: 'Community',
    content: 'Engage with students through discussions and department events.',
  },
]

export const ADMIN_TOUR_STEPS = [
  {
    target: null,
    title: 'Admin Console',
    content: 'Govern the platform with oversight on users, listings, and analytics.',
    placement: 'center',
  },
  {
    target: '[data-tour="nav-overview"]',
    title: 'Admin Overview',
    content: 'Monitor portal users, internships, applications, and activity.',
  },
  {
    target: '[data-tour="nav-users"]',
    title: 'User Management',
    content: 'Manage students and organizations, including enable/disable actions.',
  },
  {
    target: '[data-tour="nav-internships"]',
    title: 'Internship Verification',
    content: 'Approve or reject internship postings awaiting faculty review.',
  },
  {
    target: '[data-tour="nav-reports"]',
    title: 'Reports & Analytics',
    content: 'View department metrics, skills trends, and engagement stats.',
  },
  {
    target: '[data-tour="nav-utilities"]',
    title: 'Utilities & Moderation',
    content: 'Run bulk operations, export reports, and view audit logs.',
  },
]

export const getTourStepsForRole = (role) => {
  const r = role === 'org' ? 'organization' : role
  switch (r) {
    case 'admin':
      return ADMIN_TOUR_STEPS
    case 'organization':
      return ORGANIZATION_TOUR_STEPS
    default:
      return STUDENT_TOUR_STEPS
  }
}
