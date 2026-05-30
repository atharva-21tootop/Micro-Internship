export const getInternshipExternalLink = (internship) => {
  if (!internship) return null
  const link = internship.externalLink || internship.externalUrl || internship.applyUrl
  return link && /^https?:\/\//i.test(link) ? link : null
}

import { ROUTES } from '@/config/routes'

export const openInternshipView = (internship, navigate, options = {}) => {
  if (!internship) return

  const external = getInternshipExternalLink(internship)
  if (external) {
    window.open(external, '_blank', 'noopener,noreferrer')
    return
  }

  if (options.onInternalView) {
    options.onInternalView(internship)
    return
  }

  if (internship.id && navigate) {
    navigate(ROUTES.internships.detail(internship.id))
  }
}
