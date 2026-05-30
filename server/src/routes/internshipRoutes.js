import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { getInternshipByIdHandler, getInternshipsHandler } from '../controllers/internshipController.js'

const router = Router()

router.get('/', asyncHandler(getInternshipsHandler))
router.get('/:id', asyncHandler(getInternshipByIdHandler))

export default router
