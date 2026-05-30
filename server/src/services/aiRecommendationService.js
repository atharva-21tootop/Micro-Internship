import { scoreInternshipMatch } from './matchService.js'
import { z } from 'zod'

const isAiConfigured = () =>
  Boolean(process.env.AI_API_KEY?.trim())

const getApiKey = () => process.env.AI_API_KEY?.trim() || ''

const aiMatchSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  matchedSkills: z.array(z.string().min(1).max(60)).max(8).default([]),
  reason: z.string().max(240).default(''),
})

const getAiConfig = () => {
  const key = getApiKey()
  const url =
    process.env.AI_API_URL?.trim() ||
    (key.startsWith('gsk_')
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions')
  const model =
    process.env.AI_MODEL?.trim() ||
    (url.includes('groq.com') ? 'llama-3.1-8b-instant' : 'gpt-4o-mini')
  return { key, url, model }
}

const parseJsonFromText = (text) => {
  const trimmed = String(text || '').trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(candidate)
}

export const enhanceWithAi = async (internship, profile) => {
  const local = scoreInternshipMatch(internship, profile)
  if (!isAiConfigured()) return local

  const { url, model } = getAiConfig()
  const key = getApiKey()
  const skills = (profile.skills || []).join(', ')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'Return JSON only: {"score":0-100,"matchedSkills":[],"reason":""}. Score internship fit for student skills.',
          },
          {
            role: 'user',
            content: `Student skills: ${skills}\nInternship: ${internship.title} at ${internship.company}\nDescription: ${internship.description || ''}\nRequired: ${(internship.skills || []).join(', ')}`,
          },
        ],
      }),
    })

    if (!response.ok) return local

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    const parsed = parseJsonFromText(content)
    const valid = aiMatchSchema.parse(parsed)
    const score = valid.score

    return {
      score,
      matchScore: score,
      matchedSkills: valid.matchedSkills.length ? valid.matchedSkills : local.matchedSkills,
      reason: valid.reason.trim() ? valid.reason.trim() : local.reason,
      source: 'ai',
    }
  } catch {
    return local
  }
}
