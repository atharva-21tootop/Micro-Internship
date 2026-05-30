import { getFirestore } from '../config/firebaseAdmin.js'
import { approveInternship, rejectInternship } from '../services/internshipService.js'
import { logAudit } from '../services/auditService.js'
import { getAdminStats, listAllInternships } from '../services/adminStatsService.js'
import { listAllUsers, setUserDisabled } from '../services/userService.js'

export const approveInternshipHandler = async (req, res) => {
  try {
    const { internshipId } = req.body
    if (!internshipId) {
      res.status(400).json({ error: 'internshipId is required' })
      return
    }

    await approveInternship({ internshipId, adminUserId: req.user.uid })
    await logAudit({
      action: 'internship_approved',
      actorId: req.user.uid,
      targetId: internshipId,
    })

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Approval failed' })
  }
}

export const rejectInternshipHandler = async (req, res) => {
  try {
    const { internshipId } = req.body
    if (!internshipId) {
      res.status(400).json({ error: 'internshipId is required' })
      return
    }

    await rejectInternship({ internshipId, adminUserId: req.user.uid })
    await logAudit({
      action: 'internship_rejected',
      actorId: req.user.uid,
      targetId: internshipId,
    })

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Rejection failed' })
  }
}

export const getAdminUsersHandler = async (_req, res) => {
  try {
    const users = await listAllUsers()
    res.json({ users })
  } catch (error) {
    console.error('getAdminUsers error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch users' })
  }
}

export const disableUserHandler = async (req, res) => {
  try {
    const { userId, disabled = true } = req.body
    if (!userId) {
      res.status(400).json({ error: 'userId is required' })
      return
    }

    if (userId === req.user.uid) {
      res.status(400).json({ error: 'Cannot disable your own account' })
      return
    }

    await setUserDisabled(userId, disabled)
    await logAudit({
      action: disabled ? 'user_disabled' : 'user_enabled',
      actorId: req.user.uid,
      targetId: userId,
    })

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update user' })
  }
}

export const getAdminStatsHandler = async (_req, res) => {
  try {
    const data = await getAdminStats()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load admin stats' })
  }
}

export const getAdminInternshipsHandler = async (_req, res) => {
  try {
    const internships = await listAllInternships()
    res.json({ internships })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load internships' })
  }
}

export const clearInternshipsHandler = async (req, res) => {
  try {
    const snapshot = await getFirestore().collection('internships').get()
    const batch = getFirestore().batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    await logAudit({ action: 'internships_cleared', actorId: req.user.uid, targetId: 'all' })
    res.json({ ok: true, deleted: snapshot.size })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Clear failed' })
  }
}

export const approveAllPendingHandler = async (req, res) => {
  try {
    const snapshot = await getFirestore().collection('internships').get()
    const pendingDocs = snapshot.docs.filter((doc) => {
      const data = doc.data()
      return data.approved === false || data.status === 'pending'
    })

    let count = 0
    for (const doc of pendingDocs) {
      await approveInternship({ internshipId: doc.id, adminUserId: req.user.uid })
      count += 1
    }

    await logAudit({ action: 'approve_all_pending', actorId: req.user.uid, targetId: String(count) })
    res.json({ ok: true, approved: count })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Bulk approve failed' })
  }
}

export const rejectInvalidInternshipsHandler = async (req, res) => {
  try {
    const snapshot = await getFirestore().collection('internships').get()
    let count = 0

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const invalid =
        !data.title?.trim() ||
        !data.company?.trim() ||
        !data.description?.trim()

      if (invalid && data.status !== 'rejected') {
        await rejectInternship({ internshipId: doc.id, adminUserId: req.user.uid })
        count += 1
      }
    }

    await logAudit({ action: 'reject_invalid', actorId: req.user.uid, targetId: String(count) })
    res.json({ ok: true, rejected: count })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Reject invalid failed' })
  }
}

export const refreshDataHandler = async (req, res) => {
  try {
    const data = await getAdminStats()
    await logAudit({ action: 'data_refresh', actorId: req.user.uid, targetId: 'dashboard' })
    res.json({ ok: true, refreshedAt: new Date().toISOString(), ...data })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Refresh failed' })
  }
}

export const exportReportsHandler = async (_req, res) => {
  try {
    const data = await getAdminStats()
    res.json({
      exportedAt: new Date().toISOString(),
      report: data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Export failed' })
  }
}

export const getAuditLogsHandler = async (req, res) => {
  try {
    const snapshot = await getFirestore()
      .collection('auditLogs')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json({ logs })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' })
  }
}
