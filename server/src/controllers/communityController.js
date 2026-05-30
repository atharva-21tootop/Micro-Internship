import { createCommunityItem, listCommunityPosts } from '../services/communityService.js'
import { getFirestore } from '../config/firebaseAdmin.js'

export const getCommunityPostsHandler = async (_req, res) => {
  const limit = Math.min(50, Number(_req.query.limit) || 20)
  const data = await listCommunityPosts({ limit })
  res.json(data)
}

export const createCommunityPostHandler = async (req, res) => {
  const { type, ...payload } = req.body
  if (!type) {
    res.status(400).json({ error: 'type is required (discussion, event, or group)' })
    return
  }

  const allowedRoles = ['admin', 'organization', 'org']
  if (!allowedRoles.includes(req.userRole)) {
    res.status(403).json({ error: 'Only admins and organizations can create community content' })
    return
  }

  const userDoc = await getFirestore().collection('users').doc(req.user.uid).get()
  const profile = userDoc.exists ? userDoc.data() : {}

  const result = await createCommunityItem({
    type,
    data: { ...payload, role: req.userRole },
    author: {
      uid: req.user.uid,
      email: req.user.email,
      name: profile.fullName || profile.firstName || req.user.email,
      role: req.userRole,
    },
  })

  res.status(201).json({ ok: true, ...result })
}
