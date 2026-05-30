import { useCallback, useEffect, useState } from 'react'

const normalizeRole = (role) => {
  if (role === 'org') return 'organization'
  return role || 'student'
}

export const markOnboardingPending = (role) => {
  const r = normalizeRole(role)
  localStorage.setItem(`microintern_onboarding_pending_${r}`, 'true')
  sessionStorage.setItem('microintern_just_registered', 'true')
}

export const useOnboarding = (role, userId) => {
  const normalizedRole = normalizeRole(role)
  const storageKey = userId ? `microintern_onboarding_done_${normalizedRole}_${userId}` : null
  const pendingKey = `microintern_onboarding_pending_${normalizedRole}`

  const [run, setRun] = useState(false)

  useEffect(() => {
    if (!userId || !normalizedRole || !storageKey) return

    const completed = localStorage.getItem(storageKey) === 'true'
    const pending = localStorage.getItem(pendingKey) === 'true'
    const justRegistered = sessionStorage.getItem('microintern_just_registered') === 'true'

    if (!completed && (pending || justRegistered)) {
      const timer = setTimeout(() => setRun(true), 600)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [userId, normalizedRole, storageKey, pendingKey])

  const complete = useCallback(() => {
    if (storageKey) localStorage.setItem(storageKey, 'true')
    localStorage.removeItem(pendingKey)
    sessionStorage.removeItem('microintern_just_registered')
    setRun(false)
  }, [storageKey, pendingKey])

  const skip = useCallback(() => {
    complete()
  }, [complete])

  return { run, setRun, complete, skip, role: normalizedRole }
}
