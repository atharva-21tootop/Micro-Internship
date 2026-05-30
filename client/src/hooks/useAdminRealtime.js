import { useEffect, useState } from 'react'
import { subscribeAdminDashboardRealtime } from '@/services/adminRealtimeService'

export const useAdminRealtime = (enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) {
      setLoading(true)
      return undefined
    }

    setLoading(true)
    const unsub = subscribeAdminDashboardRealtime((metrics) => {
      setData(metrics)
      setLoading(false)
    })

    return () => unsub()
  }, [enabled])

  return { data, loading }
}
