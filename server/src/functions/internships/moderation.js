import {
  approveInternship,
  rejectInternship,
} from '../../services/internshipService.js'
import { logAudit } from '../../services/auditService.js'

export const moderateInternship = async (data) => {
  const { action, internshipId, adminUserId } = data

  if (!['approve', 'reject'].includes(action)) {
    throw new Error('Invalid moderation action')
  }

  if (action === 'approve') {
    await approveInternship({ internshipId, adminUserId })
  } else {
    await rejectInternship({ internshipId, adminUserId })
  }

  await logAudit({
    action: action === 'approve' ? 'internship_approved' : 'internship_rejected',
    actorId: adminUserId,
    targetId: internshipId,
  })

  return { ok: true }
}
