import { getFirestore } from '../config/firebaseAdmin.js'
import { getInternshipById } from './internshipService.js'

const normalizeStatus = (status) => {
  const value = String(status || 'pending').toLowerCase()
  if (['accepted', 'completed', 'active'].includes(value)) return 'accepted'
  if (['rejected', 'declined'].includes(value)) return 'rejected'
  if (['withdrawn'].includes(value)) return 'withdrawn'
  return 'pending'
}

export const listApplicationsByStudent = async (studentId) => {
  const snapshot = await getFirestore()
    .collection('applications')
    .where('studentId', '==', studentId)
    .get()

  const apps = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      userId: data.studentId,
      status: normalizeStatus(data.status),
      statusUpdatedAt: data.statusUpdatedAt || data.updatedAt || data.appliedAt || null,
    }
  })

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const internship = app.internshipId
        ? await getInternshipById(app.internshipId)
        : null

      return {
        ...app,
        title: app.title || internship?.title || 'Internship',
        company: app.company || internship?.company || '',
        duration: app.duration || internship?.duration || '',
        internship,
      }
    }),
  )

  return enriched.sort((a, b) => {
    const aSec = a.appliedAt?.seconds || a.createdAt?.seconds || 0
    const bSec = b.appliedAt?.seconds || b.createdAt?.seconds || 0
    return bSec - aSec
  })
}
