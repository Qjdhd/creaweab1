// ========================================================================
// FILE: users.js (Routes)
// FUNGSI: Mendefinisikan semua endpoints untuk user management
// PENJELASAN:
// - Routes untuk user profile, watchlist, subscriptions
// - Beberapa endpoint perlu authentication (watchlist, update profile)
// ========================================================================

import express from 'express'
import {
  getAllUsers,
  getUserProfile,
  getUserWatchlist,
  getSubscribedChannels,
  createUser,
  updateUserProfile,
  addToWatchlist,
  subscribeChannel,
  removeFromWatchlist,
  unsubscribeChannel,
  deleteUser
} from '../controllers/userController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ==================== GET ENDPOINTS (PUBLIC) ====================

/**
 * GET /api/users
 * TUJUAN: Mengambil daftar semua user (untuk admin/CRUD)
 * AUTH: Tidak required
 * QUERY: ?limit=50&page=1
 * RESPONSE: { success, data: [user...], count }
 */
router.get('/', getAllUsers)

/**
 * GET /api/users/:userId
 * TUJUAN: Mengambil profil user (public info)
 * AUTH: Tidak required
 * PARAMS: userId (User ID)
 * RESPONSE: { success, data: user }
 * INCLUDES: name, email, avatar, bio, subscribers, isAdmin, etc
 * EXCLUDES: password (sensitive)
 */
router.get('/:userId', getUserProfile)

/**
 * GET /api/users/:userId/watchlist
 * TUJUAN: Mengambil daftar video di watchlist user
 * AUTH: Tidak required (public list)
 * PARAMS: userId (User ID)
 * QUERY: ?limit=20&page=1
 * RESPONSE: { success, data: [video...], count }
 */
router.get('/:userId/watchlist', getUserWatchlist)

/**
 * GET /api/users/:userId/subscriptions
 * TUJUAN: Mengambil daftar channel yang di-subscribe user
 * AUTH: Tidak required (public list)
 * PARAMS: userId (User ID)
 * RESPONSE: { success, data: [user...], count }
 */
router.get('/:userId/subscriptions', getSubscribedChannels)

// ==================== POST ENDPOINTS ====================

/**
 * POST /api/users
 * TUJUAN: Register / membuat user baru (public registration)
 * AUTH: Tidak required
 * BODY: { name, email, password, avatar?, bio? }
 * RESPONSE: { success, data: user, tokens: { accessToken, refreshToken } }
 * VALIDASI:
 * - Email format valid dan unique
 * - Password minimal 6 karakter
 * - Name tidak boleh kosong
 */
router.post('/', createUser)

/**
 * POST /api/users/:userId/watchlist
 * TUJUAN: Tambahkan video ke watchlist user
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: userId (User ID)
 * BODY: { videoId }
 * RESPONSE: { success, data: watchlist }
 * VALIDASI:
 * - User harus login
 * - Video harus exist
 * - Video belum ada di watchlist
 */
router.post('/:userId/watchlist', verifyToken, addToWatchlist)

/**
 * POST /api/users/:userId/subscribe
 * TUJUAN: User subscribe ke channel (creator)
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: userId (Subscriber user ID)
 * BODY: { channelId } (Creator user ID)
 * RESPONSE: { success, data: subscribedChannels }
 * VALIDASI:
 * - User harus login
 * - Channel harus exist
 * - Belum subscribe channel ini
 */
router.post('/:userId/subscribe', verifyToken, subscribeChannel)

// ==================== PUT ENDPOINTS (REQUIRE LOGIN) ====================

/**
 * PUT /api/users/:userId
 * TUJUAN: Update profil user (name, bio, avatar)
 * AUTH: Required (verifyToken) + Own profile atau admin
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: userId (User ID)
 * BODY: { name?, bio?, avatar? }
 * RESPONSE: { success, data: user }
 * VALIDASI:
 * - User hanya bisa edit profile mereka sendiri (atau admin)
 */
router.put('/:userId', verifyToken, updateUserProfile)

// ==================== DELETE ENDPOINTS (REQUIRE LOGIN) ====================

/**
 * DELETE /api/users/:userId
 * TUJUAN: Hapus akun user (untuk CRUD testing)
 * AUTH: Tidak required (untuk CRUD interface)
 * PARAMS: userId (User ID)
 * RESPONSE: { success, message }
 */
router.delete('/:userId', deleteUser)

/**
 * DELETE /api/users/:userId/watchlist/:videoId
 * TUJUAN: Hapus video dari watchlist user
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: userId (User ID), videoId (Video ID)
 * RESPONSE: { success, data: watchlist }
 * VALIDASI:
 * - User harus login
 * - Video harus ada di watchlist
 */
router.delete('/:userId/watchlist/:videoId', verifyToken, removeFromWatchlist)

/**
 * DELETE /api/users/:userId/subscribe/:channelId
 * TUJUAN: Unsubscribe dari channel
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: userId (User ID), channelId (Creator user ID)
 * RESPONSE: { success, data: subscribedChannels }
 * VALIDASI:
 * - User harus login
 * - Harus sudah subscribe channel ini
 */
router.delete('/:userId/subscribe/:channelId', verifyToken, unsubscribeChannel)

export default router
