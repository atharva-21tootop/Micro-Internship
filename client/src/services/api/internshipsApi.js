import { apiFetch } from './httpClient'

export const fetchInternships = (approvedOnly = true) =>
  apiFetch(`/internships?approvedOnly=${approvedOnly}&limit=100`)

export const fetchInternshipById = (id) => apiFetch(`/internships/${id}`)
