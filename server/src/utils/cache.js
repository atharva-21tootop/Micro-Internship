const store = new Map()

export const getCached = (key) => {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export const setCached = (key, value, ttlMs = 5 * 60 * 1000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export const cacheKey = (...parts) => parts.filter(Boolean).join(':')
