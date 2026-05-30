export const mergeRecommendationScores = (internships, recommendations = []) => {
  if (!recommendations.length) return internships

  const scoreMap = new Map(
    recommendations.map((item) => [
      item.id,
      {
        matchScore: item.matchScore ?? item.score ?? 0,
        matchedSkills: item.matchedSkills || [],
        reason: item.reason || '',
      },
    ]),
  )

  return internships.map((internship) => {
    const match = scoreMap.get(internship.id)
    if (!match) return internship
    return { ...internship, ...match }
  })
}
