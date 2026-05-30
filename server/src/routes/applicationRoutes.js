import { Router } from 'express'
import { z } from 'zod'
import { verifyAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import {
  applyToInternshipHandler,
  updateApplicationStatusHandler,
} from '../controllers/applicationController.js'

const router = Router()

const applySchema = z.object({
  body: z.object({
    internshipId: z.string().min(1).max(160),
  }),
})

const updateStatusSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1).max(160),
    status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']),
  }),
})

router.post(
  '/apply',
  verifyAuth,
  requireRole('student'),
  validate(applySchema),
  asyncHandler(applyToInternshipHandler),
)
router.post(
  '/update-status',
  verifyAuth,
  requireRole('admin', 'organization'),
  validate(updateStatusSchema),
  asyncHandler(updateApplicationStatusHandler),
)

export default router
