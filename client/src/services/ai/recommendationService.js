import { scoreInternshipsBatchWithAI, shouldUseAI, isGroqProvider } from './apiClient'
import { toMatchPercent } from '@/utils/matchScore'

const normalizeMatchFields = (match) => {
  const percent = toMatchPercent(match.matchScore ?? match.score)
  return {
    ...match,
    score: percent / 100,
    matchScore: percent,
  }
}

const normalizeSkills = (skills = []) =>
  [...new Set(skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean))]

const profileSkillSet = (profile) => new Set(normalizeSkills(profile?.skills))

export const scoreInternshipMatch = (internship, profile) => {
  const skills = normalizeSkills(profile?.skills)
  const normalized = profileSkillSet(profile)
  const internshipSkills = normalizeSkills(internship?.skills)

  if (normalized.size === 0) {
    return {
      score: 0,
      matchScore: 0,
      matchedSkills: [],
      reason: 'Add skills in your profile to unlock recommendations',
      source: 'local',
    }
  }

  const textBlob = [
    internship?.title,
    internship?.description,
    internship?.company,
    ...internshipSkills,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const matchedFromList = internshipSkills.filter((skill) =>
    normalized.has(String(skill).toLowerCase()),
  )

  const matchedFromProfile = skills.filter((skill) => {
    const token = String(skill).toLowerCase()
    return textBlob.includes(token)
  })

  const matchedSkills = [...new Set([...matchedFromList, ...matchedFromProfile])].slice(0, 8)

  const denominator = Math.max(internshipSkills.length, 1)
  const listScore = Math.round((matchedFromList.length / denominator) * 100)
  const profileScore =
    skills.length > 0
      ? Math.round((matchedFromProfile.length / skills.length) * 100)
      : 0
  const score = Math.min(100, Math.max(listScore, profileScore))

  const reason =
    matchedSkills.length > 0
      ? `Matches ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? ' and more' : ''}`
      : score > 0
        ? 'Related keywords found in the posting'
        : 'Limited overlap with your current skills'

  return {
    score,
    matchScore: score,
    matchedSkills,
    reason,
    source: 'local',
  }
}

const attachMatch = (internship, match) => ({ ...internship, ...normalizeMatchFields(match) })

const scoreWithLocalBatch = (internships, profile) =>
  internships.map((internship) => attachMatch(internship, scoreInternshipMatch(internship, profile)))

/**
 * Local pre-rank, then one AI batch call for the top candidates only.
 */
const scoreBatch = async (internships, profile, options = {}) => {
  const { limit = 25, aiBatchSize = 10 } = options
  const slice = (internships || []).slice(0, limit)

  if (slice.length === 0) {
    return []
  }

  const localScored = scoreWithLocalBatch(slice, profile)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  if (!shouldUseAI() || !(profile?.skills?.length)) {
    return localScored
  }

  const batchCap = isGroqProvider() ? 3 : Math.min(aiBatchSize, 5)
  const candidatesForAI = localScored.slice(0, batchCap)

  try {
    const aiScores = await scoreInternshipsBatchWithAI(candidatesForAI, profile)

    const merged = localScored.map((internship) => {
      const aiMatch = aiScores.get(internship.id)
      return aiMatch ? attachMatch(internship, aiMatch) : internship
    })

    return merged.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  } catch {
    return localScored
  }
}

export const scoreInternship = async (internship, profile, { preferAI = true } = {}) => {
  if (!preferAI || !shouldUseAI() || !(profile?.skills?.length)) {
    return scoreInternshipMatch(internship, profile)
  }

  const [scored] = await scoreBatch([internship], profile, { limit: 1, aiBatchSize: 1 })
  if (!scored) {
    return scoreInternshipMatch(internship, profile)
  }

  return {
    score: scored.matchScore,
    matchScore: scored.matchScore,
    matchedSkills: scored.matchedSkills || [],
    reason: scored.reason,
    source: scored.source || 'local',
  }
}

export const recommendInternships = (internships, profile, limit = 10) =>
  scoreWithLocalBatch(internships, profile)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

export const recommendInternshipsAsync = async (internships, profile, limit = 10, options = {}) => {
  const pool = (internships || []).filter((item) => item.approved !== false)
  const scored = await scoreBatch(pool, profile, {
    ...options,
    limit: Math.max(limit, options.limit ?? 15),
    aiBatchSize: options.aiBatchSize ?? 10,
  })
  return scored
    .filter((item) => (item.matchScore || 0) > 0)
    .slice(0, limit)
}

export const sortInternshipsByMatch = async (internships, profile, options = {}) => {
  const list = internships || []
  const scored = await scoreBatch(list, profile, {
    ...options,
    limit: options.limit ?? list.length,
    aiBatchSize: options.aiBatchSize ?? 10,
  })
  const scoreMap = new Map(scored.map((item) => [item.id, item]))

  return [...list]
    .map((internship) => scoreMap.get(internship.id) || attachMatch(internship, scoreInternshipMatch(internship, profile)))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
}
