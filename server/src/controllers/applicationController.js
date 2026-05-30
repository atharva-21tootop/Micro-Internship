import { getFirestore } from '../config/firebaseAdmin.js'
import { listApplicationsByStudent } from '../services/applicationService.js'
import { getInternshipById } from '../services/internshipService.js'

export const applyToInternshipHandler = async (req, res) => {
  const { internshipId } = req.body

  if (!internshipId) {
    res.status(400).json({ error: 'internshipId is required' })
    return
  }

  const db = getFirestore()
  const internship = await getInternshipById(internshipId)
  const studentDoc = await db.collection('users').doc(req.user.uid).get()
  const student = studentDoc.exists ? studentDoc.data() : {}

  if (!internship) {
    res.status(404).json({ error: 'Internship not found' })
    return
  }

  if (internship.approved === false) {
    res.status(400).json({ error: 'Internship is not approved yet' })
    return
  }

  const applicationId = `${req.user.uid}_${internshipId}`.replace(/[^a-zA-Z0-9_-]/g, '_')
  const applicationRef = db.collection('applications').doc(applicationId)

  const now = new Date()

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(applicationRef)
    if (existing.exists) {
      const error = new Error('You have already applied for this internship')
      error.status = 409
      throw error
    }

    transaction.set(applicationRef, {
      internshipId,
      studentId: req.user.uid,
      studentName: student.fullName || student.displayName || req.user.email,
      studentEmail: req.user.email,
      orgId: internship.orgId || '',
      title: internship.title,
      company: internship.company,
      duration: internship.duration || '',
      type: internship.type || 'internship',
      status: 'pending',
      progress: 0,
      appliedAt: now,
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    })
  })

  res.status(201).json({ ok: true, applicationId })
}

export const updateApplicationStatusHandler = async (req, res) => {
  const { applicationId, status } = req.body

  if (!applicationId || !status) {
    res.status(400).json({ error: 'applicationId and status are required' })
    return
  }

  const db = getFirestore()
  const ref = db.collection('applications').doc(applicationId)
  const doc = await ref.get()

  if (!doc.exists) {
    res.status(404).json({ error: 'Application not found' })
    return
  }

  const data = doc.data()
  const isOwner = data.orgId === req.user.uid
  const isAdmin = req.userRole === 'admin'

  if (!isAdmin && !(req.userRole === 'organization' && isOwner)) {
    res.status(403).json({ error: 'Insufficient permissions' })
    return
  }

  await ref.update({
    status,
    statusUpdatedAt: new Date(),
    updatedAt: new Date(),
  })

  res.json({ ok: true })
}

export const getMyApplicationsHandler = async (req, res) => {
  const applications = await listApplicationsByStudent(req.user.uid)
  res.json({ applications })
}
