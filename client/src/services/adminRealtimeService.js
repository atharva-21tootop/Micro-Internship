import { db } from './firebase/client'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

const mapDocs = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

const isStudent = (u) => u.role === 'student'
const isOrganization = (u) => u.role === 'organization' || u.role === 'org'
const isPortalUser = (u) => isStudent(u) || isOrganization(u)

const normalizeAppStatus = (status) => String(status || 'pending').toLowerCase()

export const computeAdminMetrics = (users, internships, applications) => {
  const portalUsers = users.filter(isPortalUser)
  const students = users.filter(isStudent)
  const organizations = users.filter(isOrganization)
  const pendingInternships = internships.filter(
    (i) => i.approved === false || i.status === 'pending',
  )

  const skillCounts = students
    .flatMap((s) => s.skills || [])
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {})

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill)

  const recentActivity = [...applications]
    .sort((a, b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0))
    .slice(0, 8)
    .map((app) => ({
      id: app.id,
      message: `${app.studentName || app.studentEmail || 'Student'} applied for ${app.title || 'an internship'}`,
      createdAt: app.appliedAt,
    }))

  return {
    users: portalUsers,
    allUsers: users,
    students,
    organizations,
    internships,
    applications,
    pendingInternships,
    recentActivity,
    stats: {
      totalStudents: students.length,
      totalOrganizations: organizations.length,
      totalPortalUsers: portalUsers.length,
      totalInternships: internships.length,
      pendingApprovals: pendingInternships.length,
      totalApplications: applications.length,
      acceptedApplications: applications.filter((a) =>
        ['accepted', 'completed'].includes(normalizeAppStatus(a.status)),
      ).length,
      pendingApplications: applications.filter((a) =>
        ['pending', 'applied'].includes(normalizeAppStatus(a.status)),
      ).length,
      rejectedApplications: applications.filter((a) =>
        ['rejected', 'declined'].includes(normalizeAppStatus(a.status)),
      ).length,
    },
    internshipStats: {
      totalInternships: internships.length,
      activeInternships: internships.filter(
        (i) => i.approved !== false && i.status !== 'rejected' && i.status !== 'completed',
      ).length,
      completedInternships: internships.filter((i) => i.status === 'completed').length,
      pendingInternships: pendingInternships.length,
      totalApplications: applications.length,
      acceptedApplications: applications.filter((a) =>
        ['accepted', 'completed'].includes(normalizeAppStatus(a.status)),
      ).length,
      pendingApplications: applications.filter((a) =>
        ['pending', 'applied'].includes(normalizeAppStatus(a.status)),
      ).length,
      rejectedApplications: applications.filter((a) =>
        ['rejected', 'declined'].includes(normalizeAppStatus(a.status)),
      ).length,
    },
    departmentAnalytics: {
      totalStudents: students.length,
      totalOrganizations: organizations.length,
      activeStudents: students.filter((s) => s.lastActivity).length,
      studentsWithInternships: new Set(applications.map((a) => a.studentId)).size,
      topSkills,
      monthlyGrowth:
        students.length > 0
          ? Math.round((students.length / Math.max(portalUsers.length, 1)) * 100)
          : 0,
    },
  }
}

export const subscribeAdminDashboardRealtime = (callback) => {
  let users = []
  let internships = []
  let applications = []

  const emit = () => {
    callback(computeAdminMetrics(users, internships, applications))
  }

  const unsubUsers = onSnapshot(
    collection(db, 'users'),
    (snap) => {
      users = mapDocs(snap)
      emit()
    },
    () => {
      users = []
      emit()
    },
  )

  const unsubInternships = onSnapshot(
    query(collection(db, 'internships'), orderBy('createdAt', 'desc'), limit(200)),
    (snap) => {
      internships = mapDocs(snap)
      emit()
    },
    () => {
      internships = []
      emit()
    },
  )

  const unsubApplications = onSnapshot(
    query(collection(db, 'applications'), limit(300)),
    (snap) => {
      applications = mapDocs(snap)
      emit()
    },
    () => {
      applications = []
      emit()
    },
  )

  return () => {
    unsubUsers()
    unsubInternships()
    unsubApplications()
  }
}
