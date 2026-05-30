/**
 * Fetches real /api/student/recommendations response using a student from Firestore.
 * Run: node --env-file=.env scripts/fetchRecommendationsSample.js
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const API_BASE = process.env.API_BASE || 'http://localhost:5001/api'
const LIMIT = Number(process.env.LIMIT || 3)

const serviceAccount = JSON.parse(
  readFileSync(path.join(PROJECT_ROOT, 'serviceAccountKey.json'), 'utf8'),
)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })
}

const db = admin.firestore()
const auth = admin.auth()

const findStudentWithSkills = async () => {
  const snap = await db.collection('users').where('role', '==', 'student').limit(20).get()
  for (const doc of snap.docs) {
    const skills = doc.data().skills || []
    if (skills.length > 0) {
      return { uid: doc.id, ...doc.data(), skills }
    }
  }
  const any = await db.collection('users').limit(30).get()
  for (const doc of any.docs) {
    const data = doc.data()
    if ((data.skills || []).length > 0) {
      return { uid: doc.id, ...data, skills: data.skills }
    }
  }
  return null
}

const exchangeCustomToken = async (customToken) => {
  const apiKey = process.env.VITE_FIREBASE_API_KEY
  if (!apiKey) throw new Error('VITE_FIREBASE_API_KEY missing in .env')

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data.idToken
}

const main = async () => {
  const student = await findStudentWithSkills()
  if (!student) {
    console.error('No user with skills found in Firestore.')
    process.exit(1)
  }

  const customToken = await auth.createCustomToken(student.uid)
  const idToken = await exchangeCustomToken(customToken)

  const url = `${API_BASE}/student/recommendations?limit=${LIMIT}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  const body = await res.json()

  const output = {
    capturedAt: new Date().toISOString(),
    endpoint: url,
    httpStatus: res.status,
    studentProfile: {
      uid: student.uid,
      email: student.email || null,
      skillsUsedForMatching: student.skills || [],
    },
    apiResponse: body,
  }

  console.log(JSON.stringify(output, null, 2))
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
