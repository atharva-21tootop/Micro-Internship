import { auth } from '@/services/firebase/client'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const apiFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  await auth.authStateReady()
  const user = auth.currentUser

  if (user) {
    const token = await user.getIdToken()
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.json()
      message = data.error || message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}
