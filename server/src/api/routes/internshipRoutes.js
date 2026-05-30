import {
  approveInternshipRequest,
  getInternships,
} from '../controllers/internshipController.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const registerInternshipRoutes = (router) => {
  router.get('/internships', getInternships)
  router.post('/internships/:id/approve', requireAuth, approveInternshipRequest)

  return router
}
