import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../..')
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(PROJECT_ROOT, 'serviceAccountKey.json')

const resolveCredentialPath = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
  if (existsSync(DEFAULT_SERVICE_ACCOUNT_PATH)) {
    return DEFAULT_SERVICE_ACCOUNT_PATH
  }
  return null
}

export const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const credPath = resolveCredentialPath()

    if (credPath) {
      const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      })
    } else if (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) {
      console.warn(
        '[Firebase Admin] No service account found. Place serviceAccountKey.json in the project root ' +
          'or set GOOGLE_APPLICATION_CREDENTIALS. Token verification will fail (401 on /api/student/*).',
      )
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
      })
    } else {
      console.warn(
        '[Firebase Admin] No credentials or project id. Download serviceAccountKey.json from Firebase Console.',
      )
      admin.initializeApp()
    }

    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      admin.app().options.projectId
    const credSource = credPath ? `service account (${path.basename(credPath)})` : 'default credentials'
    console.log('[Firebase Admin] Initialized, project:', projectId || 'default', '|', credSource)
  }

  return admin
}

export const getFirestore = () => getFirebaseAdmin().firestore()

export const getAuth = () => getFirebaseAdmin().auth()
