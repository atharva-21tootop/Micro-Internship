import { listApplicationsByStudent } from '../services/applicationService.js'
import { listInternships } from '../services/internshipService.js'
import { recommendInternships } from '../services/matchService.js'
import { paginate } from '../utils/pagination.js'
import { getFirestore } from '../config/firebaseAdmin.js'

export const getStudentApplications = async (req, res) => {
  const page = req.query.page || 1
  const pageSize = req.query.pageSize || 20
  const applications = await listApplicationsByStudent(req.user.uid)
  const { data, pagination } = paginate(applications, page, pageSize)

  res.json({ applications: data, pagination })
}

export const getStudentRecommendations = async (req, res) => {
  const limit = Math.min(5, Number(req.query.limit) || 3)
  const userDoc = await getFirestore().collection('users').doc(req.user.uid).get()
  const profile = userDoc.exists ? { ...userDoc.data(), uid: req.user.uid } : { uid: req.user.uid }

  if (!(profile.skills || []).length) {
    res.json({ recommendations: [], message: 'Add skills to get recommendations' })
    return
  }

  const internships = await listInternships({ approvedOnly: true, limit: 100 })
  const recommendations = await recommendInternships(internships, profile, limit)

  const aiCount = recommendations.filter((item) => item.source === 'ai').length

  res.json({
    recommendations: recommendations.map((item) => ({
      ...item,
      score: item.score ?? item.matchScore ?? 0,
      source: item.source || 'local',
    })),
    aiPowered: aiCount > 0,
    message: aiCount > 0 ? undefined : 'Using skill-based matching (AI enhancement skipped).',
  })
}

export const getStudentStats = async (req, res) => {
  const applications = await listApplicationsByStudent(req.user.uid)
  const pending = applications.filter((a) =>
    ['pending', 'applied'].includes(String(a.status || '').toLowerCase()),
  ).length
  const accepted = applications.filter((a) =>
    ['accepted', 'completed'].includes(String(a.status || '').toLowerCase()),
  ).length
  const rejected = applications.filter((a) =>
    ['rejected', 'declined'].includes(String(a.status || '').toLowerCase()),
  ).length

  const userDoc = await getFirestore().collection('users').doc(req.user.uid).get()
  const profile = userDoc.exists ? userDoc.data() : {}

  res.json({
    stats: {
      totalApplications: applications.length,
      pending,
      accepted,
      rejected,
      profileSkills: (profile.skills || []).length,
    },
  })
}
