import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../..')
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(PROJECT_ROOT, 'serviceAccountKey.json')

const resolveCredentialPath = () => {
  // Production: Use environment variable (recommended for Render)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
  // Development: Look for serviceAccountKey.json in project root
  if (existsSync(DEFAULT_SERVICE_ACCOUNT_PATH)) {
    return DEFAULT_SERVICE_ACCOUNT_PATH
  }
  return null
}

const resolveServiceAccountFromEnv = () => {
  // For Render: Base64-encoded service account JSON in env variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8')
      return JSON.parse(decoded)
    } catch (err) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message)
      return null
    }
  }
  return null
}

export const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    // Try loading from base64-encoded env var first (Render deployment)
    let serviceAccount = resolveServiceAccountFromEnv()
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      })
    } else {
      // Fall back to file-based credentials (local development)
      const credPath = resolveCredentialPath()

      if (credPath) {
        serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'))
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        })
      } else if (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) {
        console.warn(
          '[Firebase Admin] No service account found. For production on Render:\n' +
          '  1. Encode serviceAccountKey.json as Base64\n' +
          '  2. Set FIREBASE_SERVICE_ACCOUNT_JSON env var on Render\n' +
          '  Or set GOOGLE_APPLICATION_CREDENTIALS to file path.\n' +
          '  Token verification will fail (401 on /api/student/*).',
        )
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
        })
      } else {
        console.warn(
          '[Firebase Admin] No credentials or project id. Download serviceAccountKey.json from Firebase Console.\n' +
          'For Render: Encode as Base64 and set FIREBASE_SERVICE_ACCOUNT_JSON env var.',
        )
        admin.initializeApp()
      }
    }

    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      admin.app().options.projectId
    const credSource = serviceAccount ? 'encoded env var' : (resolveCredentialPath() ? `file (${path.basename(resolveCredentialPath())})` : 'default')
    console.log('[Firebase Admin] Initialized, project:', projectId || 'default', '| credentials:', credSource)
  }

  return admin
}

export const getFirestore = () => getFirebaseAdmin().firestore()

export const getAuth = () => getFirebaseAdmin().auth()
