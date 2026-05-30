import { apiFetch } from './httpClient'

export const fetchInternshipsFromApi = async ({
  approvedOnly = true,
  limit = 100,
  pageSize = 100,
} = {}) => {
  const data = await apiFetch(
    `/internships?approvedOnly=${approvedOnly}&limit=${limit}&pageSize=${pageSize}`,
  )
  return data.internships || []
}

export const fetchInternshipByIdFromApi = async (id) => {
  const data = await apiFetch(`/internships/${id}`)
  return data.internship || null
}
