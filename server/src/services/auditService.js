import { getFirestore } from '../config/firebaseAdmin.js'

export const logAudit = async ({ action, actorId, targetId, details = {} }) => {
  await getFirestore().collection('auditLogs').add({
    action,
    actorId,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  })
}
