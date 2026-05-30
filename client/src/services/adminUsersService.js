import { fetchAdminUsers } from '@/services/api/adminApi'
import { getAllUsersFromFirestore } from '@/services/userService'

export const loadAdminUsers = async () => {
  try {
    const data = await fetchAdminUsers()
    const users = data.users || []
    console.log('Admin users (API):', users)
    return { users, source: 'api', error: null }
  } catch (apiError) {
    console.warn('Admin users API failed, using Firestore fallback:', apiError.message)
    try {
      const users = await getAllUsersFromFirestore()
      return {
        users,
        source: 'firestore',
        error: `API unavailable (${apiError.message}). Showing users from Firestore.`,
      }
    } catch (firestoreError) {
      return {
        users: [],
        source: 'none',
        error: firestoreError.message || apiError.message,
      }
    }
  }
}
