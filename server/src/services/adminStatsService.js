import { getFirestore } from '../config/firebaseAdmin.js'

const normalizeAppStatus = (status) => String(status || 'pending').toLowerCase()

export const getAdminStats = async () => {
  const db = getFirestore()
  const [usersSnap, internshipsSnap, appsSnap, auditSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('internships').get(),
    db.collection('applications').get(),
    db.collection('auditLogs').orderBy('createdAt', 'desc').limit(10).get().catch(() => ({ docs: [] })),
  ])

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const internships = internshipsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const applications = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const students = users.filter((u) => u.role === 'student')
  const organizations = users.filter((u) => u.role === 'organization' || u.role === 'org')
  const pendingInternships = internships.filter(
    (i) => i.status === 'pending' || i.approved === false,
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

  const studentActivity = students.slice(0, 20).map((student) => {
    const studentApps = applications.filter((a) => a.studentId === student.id)
    const lastApp = studentApps.sort(
      (a, b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0),
    )[0]

    return {
      id: student.id,
      name: student.fullName || student.firstName || student.email,
      email: student.email,
      year: student.year || 'N/A',
      branch: student.branch || 'N/A',
      applications: studentApps.length,
      accepted: studentApps.filter((a) => normalizeAppStatus(a.status) === 'accepted').length,
      completed: studentApps.filter((a) => normalizeAppStatus(a.status) === 'completed').length,
      currentStatus: studentApps.length > 0 ? 'Active' : 'Inactive',
      lastActivity: lastApp?.appliedAt
        ? new Date((lastApp.appliedAt.seconds || 0) * 1000).toLocaleDateString()
        : student.lastActivity || 'Never',
      skills: student.skills || [],
    }
  })

  const recentActivity = auditSnap.docs?.length
    ? auditSnap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          action: data.action,
          actorId: data.actorId,
          targetId: data.targetId,
          createdAt: data.createdAt,
        }
      })
    : applications
        .sort((a, b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0))
        .slice(0, 5)
        .map((app) => ({
          id: app.id,
          action: 'application',
          message: `${app.studentName || 'Student'} applied for ${app.title || 'an internship'}`,
          createdAt: app.appliedAt,
        }))

  return {
    stats: {
      totalUsers: users.length,
      pendingApprovals: pendingInternships.length,
      organizationsCount: organizations.length,
      totalStudents: students.length,
      totalOrganizations: organizations.length,
      totalInternships: internships.length,
      activeInternships: internships.filter(
        (i) => i.approved !== false && i.status !== 'rejected' && i.status !== 'completed',
      ).length,
      completedInternships: internships.filter((i) => i.status === 'completed').length,
      totalApplications: applications.length,
      acceptedApplications: applications.filter((a) => normalizeAppStatus(a.status) === 'accepted')
        .length,
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
      monthlyGrowth: students.length > 0 ? Math.round((students.length / Math.max(users.length, 1)) * 100) : 0,
    },
    internshipStats: {
      totalInternships: internships.length,
      activeInternships: internships.filter(
        (i) => (i.status === 'active' || !i.status) && i.approved !== false,
      ).length,
      completedInternships: internships.filter((i) => i.status === 'completed').length,
      pendingInternships: pendingInternships.length,
      totalApplications: applications.length,
      acceptedApplications: applications.filter((a) => normalizeAppStatus(a.status) === 'accepted')
        .length,
      pendingApplications: applications.filter((a) =>
        ['pending', 'applied'].includes(normalizeAppStatus(a.status)),
      ).length,
      rejectedApplications: applications.filter((a) =>
        ['rejected', 'declined'].includes(normalizeAppStatus(a.status)),
      ).length,
    },
    pendingInternships: pendingInternships.map((i) => ({ id: i.id, ...i })),
    studentActivity,
    recentActivity,
  }
}

export const listAllInternships = async () => {
  const snapshot = await getFirestore().collection('internships').get()
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}
