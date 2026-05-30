import { getAuth, getFirestore } from '../config/firebaseAdmin.js'

const normalizeRole = (role) => {
  if (role === 'org') return 'organization'
  if (['student', 'organization', 'admin'].includes(role)) return role
  return null
}

export const verifyAuth = async (req, res, next) => {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const token = header.slice(7)
    const decoded = await getAuth().verifyIdToken(token)
    const userDoc = await getFirestore().collection('users').doc(decoded.uid).get()
    const userData = userDoc.exists ? userDoc.data() : {}
    const role = normalizeRole(decoded.role || userData.role)

    if (userData.disabled === true || decoded.disabled === true) {
      res.status(403).json({ error: 'Account is disabled' })
      return
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
    }
    req.userRole = role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  const allowed = roles.map(normalizeRole).filter(Boolean)

  if (req.userRole && allowed.includes(req.userRole)) {
    next()
    return
  }

  res.status(403).json({ error: 'Insufficient permissions' })
}
