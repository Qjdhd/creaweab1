// ========================================================================
// FILE: admin.js (Routes)
// FUNGSI: API endpoints untuk admin panel
// ========================================================================

import express from 'express'
import {
  getAllUsers,
  getUserById,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  getAllVideosAdmin,
  getVideoByIdAdmin,
  createVideoAdmin,
  updateVideoAdmin,
  deleteVideoAdmin,
  getAdminStats
} from '../controllers/adminController.js'
import { verifyAdmin } from '../middleware/adminMiddleware.js'

const router = express.Router()

/**
 * ==================== ADMIN DASHBOARD ====================
 */
// GET dashboard stats (requires admin)
router.get('/stats', verifyAdmin, getAdminStats)

/**
 * ==================== USER MANAGEMENT ====================
 */
// GET all users (requires admin)
router.get('/users', verifyAdmin, getAllUsers)

// GET single user by ID (requires admin)
router.get('/users/:userId', verifyAdmin, getUserById)

// CREATE user (requires admin)
router.post('/users', verifyAdmin, createUserAdmin)

// UPDATE user (requires admin)
router.put('/users/:userId', verifyAdmin, updateUserAdmin)

// DELETE user (requires admin)
router.delete('/users/:userId', verifyAdmin, deleteUserAdmin)

/**
 * ==================== VIDEO MANAGEMENT ====================
 */
// GET all videos (requires admin)
router.get('/videos', verifyAdmin, getAllVideosAdmin)

// GET single video by ID (requires admin)
router.get('/videos/:videoId', verifyAdmin, getVideoByIdAdmin)

// CREATE video (requires admin)
router.post('/videos', verifyAdmin, createVideoAdmin)

// UPDATE video (requires admin)
router.put('/videos/:videoId', verifyAdmin, updateVideoAdmin)

// DELETE video (requires admin)
router.delete('/videos/:videoId', verifyAdmin, deleteVideoAdmin)

export default router
