import { apiFetch } from './httpClient'

export const fetchCommunityPosts = (limit = 20) =>
  apiFetch(`/community/posts?limit=${limit}`)

export const createCommunityPost = (payload) =>
  apiFetch('/community/create', { method: 'POST', body: payload })
