import { approveInternship, listInternships } from '../../services/internshipService.js'
export { moderateInternship } from './moderation.js'

export const getInternships = async (request, response) => {
  const approvedOnly = request.query.approvedOnly !== 'false'
  const limit = Number(request.query.limit || 50)
  const internships = await listInternships({ approvedOnly, limit })

  response.json({ internships })
}

export const approveInternshipRequest = async (request, response) => {
  await approveInternship({
    internshipId: request.params.id,
    adminUserId: request.user?.uid,
  })

  response.status(204).send()
}
