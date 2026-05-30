import {
  fetchAdminStats,
  approveInternshipApi,
  rejectInternshipApi,
} from '@/services/api/adminApi'
import { createNotification } from './notificationService'

export const getAdminDashboardData = async () => {
  try {
    return await fetchAdminStats()
  } catch {
    return {
      pendingInternships: [],
      studentActivity: [],
      departmentAnalytics: {
        totalStudents: 0,
        totalOrganizations: 0,
        activeStudents: 0,
        studentsWithInternships: 0,
        topSkills: [],
        monthlyGrowth: 0,
      },
      internshipStats: {
        totalInternships: 0,
        activeInternships: 0,
        completedInternships: 0,
        pendingInternships: 0,
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
      },
      recentActivity: [],
      stats: {},
    }
  }
}

export const approveInternship = async (internship) => {
  await approveInternshipApi(internship.id)

  if (internship.orgId) {
    await createNotification({
      userId: internship.orgId,
      type: 'internship_approved',
      title: 'Internship Approved',
      message: `Your internship "${internship.title}" has been approved and is now live.`,
      relatedId: internship.id,
    })
  }
}

export const rejectInternship = async (internship) => {
  await rejectInternshipApi(internship.id)

  if (internship.orgId) {
    await createNotification({
      userId: internship.orgId,
      type: 'internship_rejected',
      title: 'Internship Rejected',
      message: `Your internship "${internship.title}" has been rejected. Please review and resubmit.`,
      relatedId: internship.id,
    })
  }
}
