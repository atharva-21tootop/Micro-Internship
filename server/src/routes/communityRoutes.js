import { Router } from 'express'
import { verifyAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  createCommunityPostHandler,
  getCommunityPostsHandler,
} from '../controllers/communityController.js'

const router = Router()

router.get('/posts', asyncHandler(getCommunityPostsHandler))
router.post('/create', verifyAuth, asyncHandler(createCommunityPostHandler))

export default router
