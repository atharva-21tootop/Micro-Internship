import { apiFetch } from './httpClient'

export const fetchStudentApplications = (page = 1, pageSize = 50) =>
  apiFetch(`/student/applications?page=${page}&pageSize=${pageSize}`)

export const fetchStudentRecommendations = (limit = 3) =>
  apiFetch(`/student/recommendations?limit=${limit}`)

export const fetchStudentStats = () => apiFetch('/student/stats')
