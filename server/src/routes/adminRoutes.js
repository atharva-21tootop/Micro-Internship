import { Router } from 'express'
import { verifyAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  approveInternshipHandler,
  rejectInternshipHandler,
  getAuditLogsHandler,
  getAdminStatsHandler,
  getAdminInternshipsHandler,
  clearInternshipsHandler,
  approveAllPendingHandler,
  rejectInvalidInternshipsHandler,
  refreshDataHandler,
  exportReportsHandler,
  getAdminUsersHandler,
  disableUserHandler,
} from '../controllers/adminController.js'

const router = Router()

router.use(verifyAuth, requireRole('admin'))

router.get('/users', asyncHandler(getAdminUsersHandler))
router.post('/users/disable', asyncHandler(disableUserHandler))
router.get('/stats', asyncHandler(getAdminStatsHandler))
router.get('/internships', asyncHandler(getAdminInternshipsHandler))
router.post('/approve', asyncHandler(approveInternshipHandler))
router.post('/reject', asyncHandler(rejectInternshipHandler))
router.get('/audit-logs', asyncHandler(getAuditLogsHandler))
router.post('/clear-internships', asyncHandler(clearInternshipsHandler))
router.post('/approve-all-pending', asyncHandler(approveAllPendingHandler))
router.post('/reject-invalid', asyncHandler(rejectInvalidInternshipsHandler))
router.post('/refresh', asyncHandler(refreshDataHandler))
router.get('/export-reports', asyncHandler(exportReportsHandler))

export default router
