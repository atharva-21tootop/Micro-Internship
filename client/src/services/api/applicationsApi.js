import { apiFetch } from './httpClient'

export const applyToInternshipApi = (payload) =>
  apiFetch('/applications/apply', { method: 'POST', body: payload })

export const updateApplicationStatusApi = (applicationId, status) =>
  apiFetch('/applications/update-status', {
    method: 'POST',
    body: { applicationId, status },
  })
