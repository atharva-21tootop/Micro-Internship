export const normalizeApplicationStatus = (status) => {
  const value = String(status || 'pending').toLowerCase()
  if (['accepted', 'completed'].includes(value)) return 'accepted'
  if (['rejected', 'declined'].includes(value)) return 'rejected'
  if (['withdrawn'].includes(value)) return 'withdrawn'
  return 'pending'
}

export const getApplicationTimeline = (status) => {
  const normalized = normalizeApplicationStatus(status)

  return {
    applied: true,
    review: normalized === 'pending' || normalized === 'accepted' || normalized === 'rejected',
    reviewActive: normalized === 'pending',
    decision: normalized === 'accepted' || normalized === 'rejected',
    decisionLabel:
      normalized === 'accepted'
        ? 'Accepted'
        : normalized === 'rejected'
          ? 'Rejected'
          : 'Decision',
    normalized,
  }
}

export const getProgressPercent = (status) => {
  const timeline = getApplicationTimeline(status)
  if (timeline.normalized === 'accepted') return 100
  if (timeline.normalized === 'rejected') return 100
  if (timeline.reviewActive) return 50
  return 25
}
