// ========================================================================
// FILE: auth.js (Routes)
// FUNGSI: Mendefinisikan semua endpoints untuk authentication
// ========================================================================

import express from 'express'
import {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken as verifyTokenController,
  refreshAccessToken,
  changePassword
} from '../controllers/authController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ==================== POST ENDPOINTS ====================

/**
 * POST /api/auth/login
 * TUJUAN: User login dengan email dan password
 * BODY: { email, password }
 * RESPONSE: { user, tokens: { accessToken, refreshToken, expiresIn } }
 * EXAMPLE:
 * POST /api/auth/login
 * Body: { email: "john@example.com", password: "password123" }
 */
router.post('/login', loginUser)

/**
 * POST /api/auth/register
 * TUJUAN: Register user baru
 * BODY: { name, email, password, confirmPassword? }
 * RESPONSE: { user, tokens: { accessToken, refreshToken, expiresIn } }
 * VALIDASI:
 * - Email format valid
 * - Email belum terdaftar (unique)
 * - Password minimal 6 karakter
 */
router.post('/register', registerUser)

/**
 * POST /api/auth/logout
 * TUJUAN: User logout (clear token di client)
 * RESPONSE: { message: "Logout berhasil" }
 * NOTES: Token disimpan di client, jadi ini hanya untuk server notification
 */
router.post('/logout', logoutUser)

/**
 * POST /api/auth/verify
 * TUJUAN: Verify apakah token masih valid
 * BODY: { token }
 * RESPONSE: { valid: true/false, user?: { userId, email, name } }
 * USAGE: Digunakan frontend saat app startup untuk check user session
 */
router.post('/verify', verifyTokenController)

/**
 * POST /api/auth/refresh
 * TUJUAN: Generate access token baru menggunakan refresh token
 * BODY: { refreshToken }
 * RESPONSE: { accessToken, expiresIn: 900 }
 * FLOW:
 * 1. Client send refresh token
 * 2. Server verify dan generate access token baru
 * 3. Client gunakan access token baru untuk request selanjutnya
 */
router.post('/refresh', refreshAccessToken)

/**
 * POST /api/auth/change-password
 * TUJUAN: User mengubah password mereka
 * BODY: { currentPassword, newPassword, confirmPassword? }
 * HEADER: Authorization: Bearer <accessToken>
 * RESPONSE: { message: "Password berhasil diubah" }
 * VALIDASI:
 * - User harus login (token valid)
 * - Current password harus benar
 * - New password minimal 6 karakter
 * - Password baru harus berbeda dari password lama
 */
router.post('/change-password', verifyToken, changePassword)

export default router
