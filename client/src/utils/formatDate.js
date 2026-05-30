export const formatDate = (ts) => {
  if (!ts) return 'N/A'
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString()
  }
  if (ts.seconds != null) {
    return new Date(ts.seconds * 1000).toLocaleDateString()
  }
  if (typeof ts.toDate === 'function') {
    return ts.toDate().toLocaleDateString()
  }
  return 'N/A'
}
