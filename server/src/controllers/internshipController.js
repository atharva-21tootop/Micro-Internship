import { getInternshipById, listInternships } from '../services/internshipService.js'
import { searchInternships } from '../services/matchService.js'
import { paginate } from '../utils/pagination.js'

export const getInternshipsHandler = async (req, res) => {
  const approvedOnly = req.query.approvedOnly !== 'false'
  const limit = Number(req.query.limit || 200)
  const search = req.query.search || ''
  const page = req.query.page || 1
  const pageSize = req.query.pageSize || 10

  let internships = await listInternships({ approvedOnly, limit })
  internships = searchInternships(internships, search)

  const { data, pagination } = paginate(internships, page, pageSize)
  res.json({ internships: data, pagination })
}

export const getInternshipByIdHandler = async (req, res) => {
  const internship = await getInternshipById(req.params.id)
  if (!internship) {
    res.status(404).json({ error: 'Internship not found' })
    return
  }
  res.json({ internship })
}
