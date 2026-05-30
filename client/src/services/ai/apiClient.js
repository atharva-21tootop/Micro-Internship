/**
 * Browser-safe AI adapter.
 *
 * Provider keys must never be exposed through VITE_* variables. The real AI
 * scoring now runs through authenticated backend endpoints such as
 * /api/student/recommendations. Frontend-only flows fall back to local matching.
 */

export const isGroqProvider = () => false

export const isAIConfigured = () => false

export const isAIUnavailable = () => true

export const shouldUseAI = () => false

export const scoreInternshipsBatchWithAI = async () => {
  throw new Error('AI scoring is backend-only')
}

export const scoreInternshipWithAI = async () => {
  throw new Error('AI scoring is backend-only')
}
