import { Router } from 'express'
import { z } from 'zod'
import { verifyAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import {
  getStudentApplications,
  getStudentRecommendations,
  getStudentStats,
} from '../controllers/studentController.js'

const router = Router()

router.use(verifyAuth, requireRole('student'))

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(1000).optional(),
    pageSize: z.coerce.number().int().min(1).max(50).optional(),
  }),
})

const recommendationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(10).optional(),
  }),
})

router.get('/applications', validate(paginationSchema), asyncHandler(getStudentApplications))
router.get('/recommendations', validate(recommendationSchema), asyncHandler(getStudentRecommendations))
router.get('/stats', asyncHandler(getStudentStats))

export default router
