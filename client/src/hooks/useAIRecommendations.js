import { useEffect, useState, useRef } from 'react'
import { fetchStudentRecommendations } from '@/services/api/studentApi'
import { recommendInternshipsAsync } from '@/services/ai/recommendationService'

const DEFAULT_LIMIT = 3

export const useAIRecommendations = (internships, profile, limit = DEFAULT_LIMIT) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fallbackMessage, setFallbackMessage] = useState('')
  const requestId = useRef(0)
  const internshipsRef = useRef(internships)
  const profileRef = useRef(profile)

  internshipsRef.current = internships
  profileRef.current = profile

  const skillsKey = (profile?.skills || []).join('|').toLowerCase()

  useEffect(() => {
    const currentProfile = profileRef.current

    if (!currentProfile?.skills?.length) {
      setRecommendations([])
      setLoading(false)
      setError('')
      return undefined
    }

    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    setFallbackMessage('')

    fetchStudentRecommendations(limit)
      .then((data) => {
        if (currentRequest !== requestId.current) return
        const items = (data.recommendations || []).filter((item) => (item.matchScore || 0) > 0)
        if (items.length > 0) {
          setRecommendations(items)
          if (data.aiPowered || items.some((item) => item.source === 'ai')) {
            setFallbackMessage('')
          } else if (data.message) {
            setFallbackMessage(data.message)
          }
          return
        }
        setFallbackMessage(data.message || 'Using local skill matching.')
        return recommendInternshipsAsync(internshipsRef.current, currentProfile, limit)
          .then((fallback) => {
            if (currentRequest !== requestId.current) return
            const filtered = fallback.filter((item) => (item.matchScore || 0) > 0)
            setRecommendations(filtered)
            if (filtered.some((item) => item.source === 'ai')) {
              setFallbackMessage('')
            }
          })
      })
      .catch((err) => {
        const msg = String(err?.message || '')
        const isAuthError = /authentication|unauthorized|invalid or expired token/i.test(msg)
        setFallbackMessage(
          isAuthError
            ? 'Could not verify your session — restart the API server and sign in again.'
            : 'AI unavailable — showing skill-based matches.',
        )
        return recommendInternshipsAsync(internshipsRef.current, currentProfile, limit)
          .then((fallback) => {
            if (currentRequest !== requestId.current) return
            setRecommendations(fallback.filter((item) => (item.matchScore || 0) > 0))
          })
          .catch((err) => {
            if (currentRequest !== requestId.current) return
            setError(err.message || 'Could not load recommendations')
            setRecommendations([])
          })
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false)
      })

    return () => {
      requestId.current += 1
    }
  }, [skillsKey, limit])

  const hasSkills = (profile?.skills || []).length > 0

  return { recommendations, loading, error, fallbackMessage, hasSkills }
}
