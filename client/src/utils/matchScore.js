export const toMatchPercent = (score) => {
  const value = Number(score) || 0
  if (value <= 1) return Math.round(value * 100)
  return Math.round(Math.min(100, value))
}

export const isRecommendedMatch = (score) => {
  const percent = toMatchPercent(score)
  return percent >= 70
}
