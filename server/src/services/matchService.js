import { getCached, setCached, cacheKey } from '../utils/cache.js'
import { enhanceWithAi } from './aiRecommendationService.js'

const normalizeSkills = (skills = []) =>
  [...new Set(skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean))]

export const scoreInternshipMatch = (internship, profile) => {
  const skills = normalizeSkills(profile?.skills)
  const normalized = new Set(skills)
  const internshipSkills = normalizeSkills(internship?.skills)

  if (normalized.size === 0) {
    return {
      score: 0,
      matchScore: 0,
      matchedSkills: [],
      reason: 'Add skills to get recommendations',
    }
  }

  const textBlob = [internship?.title, internship?.description, internship?.company, ...internshipSkills]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const matchedFromList = internshipSkills.filter((skill) => normalized.has(skill))
  const matchedFromProfile = skills.filter((skill) => textBlob.includes(skill))
  const matchedSkills = [...new Set([...matchedFromList, ...matchedFromProfile])].slice(0, 8)

  const denominator = Math.max(internshipSkills.length, 1)
  const listScore = Math.round((matchedFromList.length / denominator) * 100)
  const profileScore =
    skills.length > 0
      ? Math.round((matchedFromProfile.length / skills.length) * 100)
      : 0
  const score = Math.min(100, Math.max(listScore, profileScore))

  return {
    score,
    matchScore: score,
    matchedSkills,
    reason:
      matchedSkills.length > 0
        ? `Matches ${matchedSkills.slice(0, 3).join(', ')}`
        : 'Limited skill overlap',
  }
}

export const recommendInternships = async (internships, profile, limit = 3) => {
  const skills = normalizeSkills(profile?.skills)
  const key = cacheKey('rec', profile?.uid || skills.join('|'), limit)

  const cached = getCached(key)
  if (cached) return cached

  const preRanked = internships
    .slice(0, 50)
    .map((item) => ({ ...item, ...scoreInternshipMatch(item, { ...profile, skills }) }))
    .filter((item) => (item.matchScore || 0) > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, Math.max(limit * 2, 6))

  const scored = await Promise.all(
    preRanked.map(async (item) => {
      const match = await enhanceWithAi(item, { ...profile, skills })
      return { ...item, ...match }
    }),
  )

  const results = scored
    .sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0))
    .slice(0, limit)

  setCached(key, results, 5 * 60 * 1000)
  return results
}

export const searchInternships = (internships, term = '') => {
  const q = String(term).trim().toLowerCase()
  if (!q) return internships

  return internships.filter((item) => {
    const title = item.title?.toLowerCase() || ''
    const company = item.company?.toLowerCase() || ''
    const description = item.description?.toLowerCase() || ''
    return title.includes(q) || company.includes(q) || description.includes(q)
  })
}
