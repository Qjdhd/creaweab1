// ========================================================================
// FILE: adminMiddleware.js
// FUNGSI: Middleware untuk verify admin access
// ========================================================================

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Verify Admin - Check if user is authenticated AND is admin
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Get user from DB
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Check if admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Anda bukan admin'
      })
    }

    // Attach user ke request
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      error: error.message
    })
  }
}

/**
 * Optional: Verify token only (user OR admin)
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    })
  }
}
