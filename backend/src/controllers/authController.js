// ========================================================================
// FILE: authController.js
// FUNGSI: Logic untuk authentication (login, register, password reset)
// PENJELASAN:
// - Handle user authentication dengan JWT token
// - Password hashing dengan bcryptjs
// - Refresh token untuk security
// ========================================================================

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Helper: Generate JWT tokens
/**
 * HELPER: Membuat JWT access token
 * PARAMS: userId (ID user untuk di-encode dalam token)
 * RETURN: String JWT token yang bertahan 15 menit
 * USAGE: Dipakai untuk setiap request yang memerlukan auth
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '15m' } // Token bertahan 15 menit untuk security
  )
}

/**
 * HELPER: Membuat JWT refresh token
 * PARAMS: userId (ID user untuk di-encode dalam token)
 * RETURN: String JWT refresh token yang bertahan 7 hari
 * USAGE: Dipakai untuk generate access token baru tanpa login ulang
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    { expiresIn: '7d' } // Token bertahan 7 hari
  )
}

// ==================== POST REQUESTS ====================

/**
 * FUNGSI: loginUser
 * ENDPOINT: POST /api/auth/login
 * TUJUAN: Authenticate user dan berikan JWT token
 * BODY: { email, password }
 * RESPONSE: Object dengan user data and tokens (accessToken, refreshToken)
 * FLOW:
 * 1. Validasi input tidak kosong
 * 2. Cari user di database dengan email
 * 3. Compare password dengan hashed password (menggunakan bcrypt)
 * 4. Generate access & refresh tokens
 * 5. Update lastLogin timestamp
 * 6. Return user data + tokens
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // VALIDASI - Input tidak kosong
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      })
    }

    // CARI USER - Query email ke database (case-insensitive)
    // PENTING: Pakai select('+password') karena password default tidak di-return
    const user = await User.findOne({ email }).select('+password')

    // CEK KEBERADAAN USER
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    // COMPARE PASSWORD - Menggunakan bcrypt method dari User model
    // comparePassword() method sudah di-define di User schema
    const isPasswordValid = await user.comparePassword(password)

    // CEK PASSWORD VALID
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    // CEK AKUN AKTIF
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan'
      })
    }

    // GENERATE TOKENS
    const accessToken = generateAccessToken(user._id) // 15 menit
    const refreshToken = generateRefreshToken(user._id) // 7 hari

    // UPDATE LAST LOGIN
    user.lastLogin = new Date()
    await user.save()

    // RESPONSE - Tanpa password!
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: user.toJSON(), // Method ini exclude password
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900 // 15 minutes in seconds
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error login: ' + error.message
    })
  }
}

/**
 * FUNGSI: registerUser (Membuat akun baru)
 * ENDPOINT: POST /api/auth/register
 * TUJUAN: Register akun user baru
 * BODY: { name, email, password }
 * RESPONSE: Object user baru + JWT tokens
 * FLOW:
 * 1. Validasi input format dan requirements
 * 2. Cek email belum terdaftar (unique)
 * 3. Create user baru (password auto di-hash oleh pre-save hook)
 * 4. Generate tokens
 * 5. Return user data + tokens
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    // VALIDASI - Field tidak kosong
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Field name, email, dan password harus diisi'
      })
    }

    // VALIDASI - Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      })
    }

    // VALIDASI - Password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      })
    }

    // VALIDASI - Password match
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak sama'
      })
    }

    // VALIDASI - Email unique
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      })
    }

    // CREATE USER - Password akan di-hash otomatis oleh pre-save hook
    const newUser = await User.create({
      name,
      email,
      password,
      avatar: '👤',
      bio: ''
    })

    // GENERATE TOKENS
    const accessToken = generateAccessToken(newUser._id)
    const refreshToken = generateRefreshToken(newUser._id)

    // RESPONSE
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: newUser.toJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registrasi: ' + error.message
    })
  }
}

/**
 * FUNGSI: refreshAccessToken
 * ENDPOINT: POST /api/auth/refresh
 * TUJUAN: Generate access token baru menggunakan refresh token
 * BODY: { refreshToken }
 * RESPONSE: Object dengan access token baru
 * USAGE: Saat access token expired, client kirim refresh token untuk dapat token baru
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token harus diberikan'
      })
    }

    // VERIFY REFRESH TOKEN
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
    )

    // CARI USER
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // GENERATE NEW ACCESS TOKEN
    const newAccessToken = generateAccessToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Token berhasil di-refresh',
      data: {
        accessToken: newAccessToken,
        expiresIn: 900 // 15 minutes
      }
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token sudah expired, silakan login ulang'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error refresh token: ' + error.message
    })
  }
}

/**
 * FUNGSI: logoutUser
 * ENDPOINT: POST /api/auth/logout
 * TUJUAN: Logout user (hapus token dari client side)
 * RESPONSE: Success message
 * NOTES: Token disimpan di client (localStorage), jadi logout hanya clear di client
 *        Backend bisa maintain blacklist jika diperlukan
 */
export const logoutUser = (req, res) => {
  try {
    // LOGOUT LOGIC - Token disimpan di client, jadi cukup return success
    // Client akan hapus token dari localStorage

    res.status(200).json({
      success: true,
      message: 'Logout berhasil. Silakan hapus token dari client'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logout: ' + error.message
    })
  }
}

/**
 * FUNGSI: verifyToken (Utility untuk check token validity)
 * ENDPOINT: POST /api/auth/verify
 * TUJUAN: Verify token masih valid (untuk frontend cek)
 * BODY: { token }
 * RESPONSE: { valid: true/false, user: userData }
 */
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Token harus diberikan'
      })
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )

    // CARI USER
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Token valid',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token sudah expired'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token tidak valid'
      })
    }

    res.status(500).json({
      success: false,
      valid: false,
      message: 'Error verify token: ' + error.message
    })
  }
}

/**
 * FUNGSI: changePassword
 * ENDPOINT: POST /api/auth/change-password
 * TUJUAN: User mengubah password mereka sendiri
 * BODY: { currentPassword, newPassword, confirmPassword }
 * HEADER: Authorization: Bearer <token>
 * RESPONSE: Success message
 * NOTES: Memerlukan authentication (token harus valid)
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body
    const userId = req.userId // Dari middleware authentication

    // VALIDASI - Field tidak kosong
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password dan new password harus diisi'
      })
    }

    // VALIDASI - Password berbeda
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password baru harus berbeda dengan password lama'
      })
    }

    // VALIDASI - Password minimal 6 karakter
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      })
    }

    // VALIDASI - Confirm password match
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi tidak sama'
      })
    }

    // CARI USER
    const user = await User.findById(userId).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // VERIFY CURRENT PASSWORD
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini tidak valid'
      })
    }

    // UPDATE PASSWORD - akan di-hash otomatis oleh pre-save hook
    user.password = newPassword
    user.passwordChangedAt = new Date()
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error change password: ' + error.message
    })
  }
}

export default {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  verifyToken,
  changePassword
}
