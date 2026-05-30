import { apiFetch } from './httpClient'

export const fetchAdminUsers = () => apiFetch('/admin/users')

export const disableUserApi = (userId, disabled = true) =>
  apiFetch('/admin/users/disable', { method: 'POST', body: { userId, disabled } })

export const fetchAdminStats = () => apiFetch('/admin/stats')

export const fetchAdminInternships = () => apiFetch('/admin/internships')

export const approveInternshipApi = (internshipId) =>
  apiFetch('/admin/approve', { method: 'POST', body: { internshipId } })

export const rejectInternshipApi = (internshipId) =>
  apiFetch('/admin/reject', { method: 'POST', body: { internshipId } })

export const fetchAuditLogs = () => apiFetch('/admin/audit-logs')

export const clearInternshipsApi = () =>
  apiFetch('/admin/clear-internships', { method: 'POST' })

export const approveAllPendingApi = () =>
  apiFetch('/admin/approve-all-pending', { method: 'POST' })

export const rejectInvalidInternshipsApi = () =>
  apiFetch('/admin/reject-invalid', { method: 'POST' })

export const refreshAdminDataApi = () =>
  apiFetch('/admin/refresh', { method: 'POST' })

export const exportReportsApi = () => apiFetch('/admin/export-reports')
