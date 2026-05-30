import { getFirestore } from '../config/firebaseAdmin.js'

export const listAllUsers = async () => {
  const db = getFirestore()
  const snapshot = await db.collection('users').get()
  console.log('[API] Users count from Firestore:', snapshot.size)

  const users = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      email: data.email || '',
      fullName: data.fullName || data.firstName || data.displayName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: data.role || 'student',
      createdAt: data.createdAt || data.created_at || null,
      disabled: data.disabled || false,
      ...data,
    }
  })

  return users
}

export const setUserDisabled = async (userId, disabled = true) => {
  await getFirestore().collection('users').doc(userId).update({
    disabled: Boolean(disabled),
    disabledAt: disabled ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  })
}
