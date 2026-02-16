// ========================================================================
// FILE: videos.js (Routes)
// FUNGSI: Mendefinisikan semua endpoints untuk video
// PENJELASAN:
// - Routes menghubungkan URL path ke fungsi di controller
// - Format: router.METHOD(PATH, [MIDDLEWARE], CONTROLLER_FUNCTION)
// - METHOD: GET, POST, PUT, PATCH, DELETE
// - MIDDLEWARE: verifyToken untuk protect routes yang perlu login
// ========================================================================

import express from 'express'
import {
  getAllVideos,
  getVideoById,
  getVideosByCategory,
  searchVideos_handler,
  createVideo,
  updateVideoInfo,
  likeVideo,
  incrementViews,
  deleteVideoById
} from '../controllers/videoController.js'
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// ==================== GET ENDPOINTS (PUBLIC) ====================

/**
 * GET /api/videos
 * TUJUAN: Mengambil semua video dengan pagination
 * AUTH: Tidak required
 * QUERY: ?page=1&limit=12&sort=newest (newest|mostviews|rating)
 * RESPONSE: { success, data: [video...], pagination: { page, limit, total } }
 * EXAMPLE: GET /api/videos?page=1&limit=12&sort=newest
 */
router.get('/', optionalAuth, getAllVideos)

/**
 * GET /api/videos/search
 * TUJUAN: Mencari video berdasarkan keyword
 * AUTH: Tidak required
 * QUERY: ?query=javascript&limit=20
 * RESPONSE: { success, data: [video...], count }
 * EXAMPLE: GET /api/videos/search?query=javascript
 */
router.get('/search', optionalAuth, searchVideos_handler)

/**
 * GET /api/videos/category/:category
 * TUJUAN: Mengambil video berdasarkan kategori
 * AUTH: Tidak required
 * PARAMS: category (Coding|Design|Marketing|Business|Entertainment|Tutorial|Gaming|Other)
 * QUERY: ?page=1&limit=12
 * RESPONSE: { success, data: [video...], count }
 * EXAMPLE: GET /api/videos/category/Coding?page=1&limit=12
 */
router.get('/category/:category', optionalAuth, getVideosByCategory)

/**
 * GET /api/videos/:id
 * TUJUAN: Mengambil detail lengkap satu video
 * AUTH: Tidak required
 * PARAMS: id (Video ID)
 * RESPONSE: { success, data: video }
 * NOTES: Harus diletakkan SETELAH route lain untuk avoid conflict
 */
router.get('/:id', optionalAuth, getVideoById)

// ==================== POST ENDPOINTS (REQUIRE LOGIN) ====================

/**
 * POST /api/videos
 * TUJUAN: Membuat video baru (hanya creator/admin)
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * BODY: { title, description, channel, category, duration, videoUrl? }
 * RESPONSE: { success, data: video }
 * VALIDASI:
 * - Title: 5-200 karakter, required
 * - Category: dari enum list
 * - Duration: number positif
 */
router.post('/', verifyToken, createVideo)

// ==================== PATCH ENDPOINTS (REQUIRE LOGIN) ====================

/**
 * PATCH /api/videos/:id/like
 * TUJUAN: User like/dislike video (toggle)
 * AUTH: Required (verifyToken)
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: id (Video ID)
 * RESPONSE: { success, data: { views, likes, userLiked } }
 * FLOW:
 * 1. Check user sudah login
 * 2. Find video
 * 3. Toggle like status (add/remove dari likes array)
 * 4. Return updated video
 */
router.patch('/:id/like', verifyToken, likeVideo)

/**
 * PATCH /api/videos/:id/view
 * TUJUAN: Increment view count saat video diputar
 * AUTH: Tidak required (public bisa nonton)
 * PARAMS: id (Video ID)
 * RESPONSE: { success, data: { id, views } }
 * BEHAVIOR: Setiap kali video diplay, views bertambah 1
 */
router.patch('/:id/view', optionalAuth, incrementViews)

// ==================== PUT ENDPOINTS (REQUIRE LOGIN) ====================

/**
 * PUT /api/videos/:id
 * TUJUAN: Update informasi video (title, description, category)
 * AUTH: Required (verifyToken) + Owner atau Admin
 * HEADER: Authorization: Bearer <accessToken>
 * PARAMS: id (Video ID)
 * BODY: { title?, description?, category?, isFeatured? }
 * RESPONSE: { success, data: video }
 * VALIDASI:
 * - User harus pemilik video atau admin
 * - Title jika diubah harus 5-200 karakter
 * - Category harus dari enum list
 */
router.put('/:id', verifyToken, updateVideoInfo)

// ==================== DELETE ENDPOINTS ====================

/**
 * DELETE /api/videos/:id
 * TUJUAN: Hapus video dari database (untuk CRUD testing)
 * AUTH: Optional (verifyToken)
 * HEADER: Authorization: Bearer <accessToken> (optional)
 * PARAMS: id (Video ID)
 * RESPONSE: { success, message: "Video berhasil dihapus" }
 * NOTES:
 * - Untuk testing CRUD operations
 * - Auth tidak required untuk development mode
 */
router.delete('/:id', deleteVideoById)

export default router
