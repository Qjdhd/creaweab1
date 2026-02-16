// ========================================================================
// FILE: authMiddleware.js
// FUNGSI: Middleware untuk authentication dan authorization
// PENJELASAN:
// - Verify JWT token dari request
// - Extract user info dari token
// - Protect routes yang memerlukan login
// - Check user role/permissions
// ========================================================================

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * MIDDLEWARE: verifyToken
 * TUJUAN: Verify JWT token di request headers
 * FLOW:
 * 1. Extract token dari Authorization header (Bearer <token>)
 * 2. Verify token menggunakan JWT_SECRET
 * 3. Jika valid, attach user info ke req.userId
 * 4. Jika invalid/expired, return error
 * USAGE: Gunakan di routes yang require authentication
 * EXAMPLE: router.get('/profile', verifyToken, getUserProfile)
 */
export const verifyToken = (req, res, next) => {
  try {
    // EXTRACT TOKEN dari Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak diberikan. Gunakan: Authorization: Bearer <token>'
      })
    }

    // AMBIL token dari "Bearer <token>"
    const token = authHeader.substring(7) // Skip "Bearer "

    // VERIFY token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )

    // VALIDASI - Token harus tipe access
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Token type tidak valid'
      })
    }

    // ATTACH user info ke request
    // Nanti bisa diakses di controller dengan req.userId
    req.userId = decoded.userId
    req.user = decoded

    // NEXT middleware
    next()
  } catch (error) {
    // HANDLE token errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired',
        code: 'TOKEN_EXPIRED'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      })
    }

    res.status(401).json({
      success: false,
      message: 'Error verify token: ' + error.message
    })
  }
}

/**
 * MIDDLEWARE: verifyRefreshToken
 * TUJUAN: Verify refresh token (untuk endpoint refresh)
 * FLOW: Sama seperti verifyToken tapi check tipe token
 * USAGE: router.post('/refresh', verifyRefreshToken, refreshAccessToken)
 */
export const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token harus diberikan'
      })
    }

    // VERIFY refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
    )

    // VALIDASI - Token harus tipe refresh
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token type tidak valid'
      })
    }

    // ATTACH user info ke request
    req.userId = decoded.userId
    req.refreshToken = refreshToken

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token sudah expired, silakan login ulang',
        code: 'REFRESH_TOKEN_EXPIRED'
      })
    }

    res.status(401).json({
      success: false,
      message: 'Refresh token tidak valid'
    })
  }
}

/**
 * MIDDLEWARE: requireAdmin
 * TUJUAN: Verifikasi user adalah admin
 * FLOW:
 * 1. Pastikan verifyToken sudah di-call sebelumnya
 * 2. Query user dari database
 * 3. Check isAdmin flag
 * 4. Jika bukan admin, return 403
 * USAGE: router.delete('/admin', verifyToken, requireAdmin, deleteUser)
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = req

    // QUERY user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // CHECK admin role
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang bisa akses resource ini.'
      })
    }

    // NEXT
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verify admin: ' + error.message
    })
  }
}

/**
 * MIDDLEWARE: requireAdminOrOwner
 * TUJUAN: Verifikasi user adalah admin OR pemilik resource
 * FLOW:
 * 1. Check user is admin OR user._id == resourceOwnerId
 * 2. Untuk video: check uploadedBy == userId
 * 3. Untuk user profile: check userId == paramUserId
 * USAGE: Untuk edit/delete resource yang ownership-based
 */
export const requireAdminOrOwner = (ownerIdPath) => {
  return async (req, res, next) => {
    try {
      const { userId } = req

      // QUERY user untuk check admin status
      const user = await User.findById(userId)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan'
        })
      }

      // AMBIL owner ID dari request (e.g., req.params.videoId atau req.params.userId)
      const ownerId = req.params[ownerIdPath]

      // CHECK - user adalah admin ATAU pemilik resource
      if (!user.isAdmin && userId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya bisa edit resource milik Anda.'
        })
      }

      // NEXT
      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verify ownership: ' + error.message
      })
    }
  }
}

/**
 * MIDDLEWARE: optionalAuth
 * TUJUAN: Verify token jika ada, tapi tidak wajib
 * FLOW:
 * 1. Check Authorization header
 * 2. Jika ada, verify token
 * 3. Jika tidak ada, lanjut ke next handler (userId akan undefined)
 * 4. Digunakan untuk endpoints yang bisa public atau authenticated
 * USAGE: router.get('/videos', optionalAuth, getAllVideos)
 *        - Public user bisa lihat, authenticated user bisa get more features
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // JIKA token tidak ada, lanjut dengan userId = null
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.userId = null
      return next()
    }

    // TOKEN ada, verify
    const token = authHeader.substring(7)

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )

    if (decoded.type === 'access') {
      req.userId = decoded.userId
      req.user = decoded
    }

    next()
  } catch (error) {
    // Jika token invalid, tetap lanjut (not required)
    // Tp user tidak authenticated
    req.userId = null
    next()
  }
}

export default {
  verifyToken,
  verifyRefreshToken,
  requireAdmin,
  requireAdminOrOwner,
  optionalAuth
}
