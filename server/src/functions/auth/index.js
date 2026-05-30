export const requireAuth = (request, response, next) => {
  if (!request.user) {
    response.status(401).json({ error: 'Authentication required' })
    return
  }

  next()
}
