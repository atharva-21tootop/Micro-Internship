import { getFirestore } from '../config/firebaseAdmin.js'

const normalizeInternship = (doc) => {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title || 'Untitled',
    company: data.company || '',
    description: data.description || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    approved: data.approved !== false,
    category: data.category || '',
    duration: data.duration || '',
    location: data.location || '',
    type: data.type || '',
    orgId: data.orgId || '',
    externalLink: data.externalLink || data.externalUrl || '',
    createdAt: data.createdAt || null,
    ...data,
  }
}

export const listInternships = async ({ approvedOnly = true, limit = 100 } = {}) => {
  const snapshot = await getFirestore().collection('internships').limit(Math.min(limit * 3, 300)).get()

  let items = snapshot.docs.map(normalizeInternship)

  if (approvedOnly) {
    items = items.filter((item) => item.approved !== false)
  }

  return items
    .sort((a, b) => {
      const aSec = a.createdAt?.seconds || 0
      const bSec = b.createdAt?.seconds || 0
      return bSec - aSec
    })
    .slice(0, limit)
}

export const getInternshipById = async (id) => {
  const doc = await getFirestore().collection('internships').doc(id).get()
  if (!doc.exists) return null
  return normalizeInternship(doc)
}

export const approveInternship = async ({ internshipId, adminUserId }) => {
  await getFirestore().collection('internships').doc(internshipId).update({
    approved: true,
    status: 'active',
    approvedAt: new Date().toISOString(),
    approvedBy: adminUserId,
  })
}

export const rejectInternship = async ({ internshipId, adminUserId }) => {
  await getFirestore().collection('internships').doc(internshipId).update({
    approved: false,
    status: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectedBy: adminUserId,
  })
}
