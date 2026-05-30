import { listApplicationsByStudent } from '../../services/applicationService.js'

export const getStudentApplications = async (request, response) => {
  const applications = await listApplicationsByStudent(request.params.studentId)

  response.json({ applications })
}
