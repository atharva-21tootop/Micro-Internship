import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase/client'
import { createOrUpdateUser, getUser } from './userService'

export async function signupWithEmail({ email, password, displayName }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName) {
    await updateProfile(userCredential.user, { displayName })
  }

  await createOrUpdateUser(userCredential.user.uid, {
    uid: userCredential.user.uid,
    email,
    displayName,
    role: 'student',
    createdAt: new Date().toISOString(),
  })

  return userCredential
}

export async function loginWithEmail({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(auth, provider)
}

export async function signInWithGithub() {
  const provider = new GithubAuthProvider()
  return signInWithPopup(auth, provider)
}

const buildProfileFromAuthUser = (firebaseUser, { role = 'student', companyName } = {}) => {
  const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
  const parts = displayName.trim().split(/\s+/)
  const firstName = parts[0] || 'User'
  const lastName = parts.slice(1).join(' ') || ''

  const profile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    firstName,
    lastName,
    fullName: displayName,
    role: role === 'org' ? 'organization' : role,
    photoURL: firebaseUser.photoURL || null,
    authProvider: options.provider || null,
    createdAt: new Date().toISOString(),
  }

  if (profile.role === 'organization' && companyName) {
    profile.companyName = companyName
  }

  return profile
}

/**
 * OAuth sign-in: creates Firestore profile for new users with selected role (register flow).
 */
export async function completeOAuthSignIn(firebaseUser, options = {}) {
  const { role = 'student', companyName, isRegistration = false, provider } = options

  let profile = await getUser(firebaseUser.uid)
  let isNewUser = false

  if (!profile) {
    isNewUser = true
    const data = buildProfileFromAuthUser(firebaseUser, {
      role: isRegistration ? role : 'student',
      companyName,
    })
    data.authProvider = provider || data.authProvider
    await createOrUpdateUser(firebaseUser.uid, data)
    profile = { id: firebaseUser.uid, ...data }
  }

  return { profile, isNewUser }
}

export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function logoutUser() {
  return signOut(auth)
}

export function getOAuthErrorMessage(error) {
  const code = error?.code || ''
  const map = {
    'auth/operation-not-allowed':
      'Google/GitHub sign-in is not enabled yet. In Firebase Console → Authentication → Sign-in method, enable Google and GitHub, then try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/popup-blocked': 'Popup was blocked. Allow popups for this site and try again.',
    'auth/unauthorized-domain':
      'This domain is not authorized. Add localhost (and your site URL) under Firebase → Authentication → Settings → Authorized domains.',
  }
  return map[code] || error?.message || 'OAuth sign-in failed. Please try again.'
}
