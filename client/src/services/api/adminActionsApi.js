import { approveInternshipApi, rejectInternshipApi } from './adminApi'

export const moderateInternship = async ({ action, internship }) => {
  const internshipId = internship?.id
  if (!internshipId) throw new Error('Internship id is required')

  if (action === 'approve') {
    await approveInternshipApi(internshipId)
    return
  }

  if (action === 'reject') {
    await rejectInternshipApi(internshipId)
    return
  }

  throw new Error('Invalid moderation action')
}
