import { ROUTES } from '@/config/routes'
import { markOnboardingPending } from '@/hooks/useOnboarding'

export const redirectByRole = (navigate, userData) => {
  if (!userData?.role) {
    navigate(ROUTES.home)
    return
  }

  const role = userData.role === 'org' ? 'organization' : userData.role
  const tourKey = `microintern_onboarding_done_${role}_${userData.uid || userData.id}`
  if (localStorage.getItem(tourKey) !== 'true') {
    markOnboardingPending(userData.role)
  }

  switch (userData.role) {
    case 'student':
      navigate(ROUTES.student.browse)
      break
    case 'organization':
    case 'org':
      navigate(ROUTES.organization.overview)
      break
    case 'admin':
      navigate(ROUTES.admin.overview)
      break
    default:
      navigate(ROUTES.home)
  }
}
