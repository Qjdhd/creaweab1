// ========================================================================
// FILE: userController.js
// FUNGSI: Logic untuk menangani operasi user (profile, watchlist, dll)
// PENJELASAN:
// - Handle user profile, preferences, dan social features
// - Menggunakan MongoDB + Mongoose User model
// - Include password hashing dengan bcrypt
// ========================================================================

import User from '../models/User.js'

// ==================== GET REQUESTS ====================

/**
 * FUNGSI: getAllUsers
 * ENDPOINT: GET /api/users
 * TUJUAN: Mengambil daftar semua user (untuk admin/CRUD)
 * QUERY: ?limit=50&page=1
 * RESPONSE: Array user dengan informasi publik
 */
export const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    // Fetch users tanpa password field
    const users = await User.find()
      .select('-password -passwordResetToken -passwordResetExpires')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments()

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil daftar user: ' + error.message
    })
  }
}

/**
 * FUNGSI: getUserProfile
 * ENDPOINT: GET /api/users/:userId
 * TUJUAN: Mengambil profil lengkap seorang user
 * PARAMS: userId (user ID)
 * RESPONSE: Object user dengan semua informasi
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    // Cari user dengan ID tersebut di MongoDB
    const user = await User.findById(userId)
      .populate('watchlist', 'title thumbnail duration category') // Include watchlist video details
      .populate('subscribedChannels', 'name avatar')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil profil user',
      data: user.toJSON() // Use toJSON method yang exclude sensitive fields
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil profil: ' + error.message
    })
  }
}

/**
 * FUNGSI: getUserWatchlist
 * ENDPOINT: GET /api/users/:userId/watchlist
 * TUJUAN: Mengambil daftar video yang ditonton/wishlist user
 * PARAMS: userId (user ID)
 * RESPONSE: Array video di watchlist dengan detail
 */
export const getUserWatchlist = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
      .populate('watchlist', 'title thumbnail duration category channel views rating')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil watchlist',
      data: user.watchlist,
      count: user.watchlist.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil watchlist: ' + error.message
    })
  }
}

/**
 * FUNGSI: getSubscribedChannels
 * ENDPOINT: GET /api/users/:userId/subscriptions
 * TUJUAN: Mengambil daftar channel yang di-subscribe user
 * PARAMS: userId (user ID)
 * RESPONSE: Array channel ID yang di-subscribe
 */
export const getSubscribedChannels = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
      .populate('subscribedChannels', 'name avatar subscribers')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil channel subscriptions',
      data: user.subscribedChannels,
      count: user.subscribedChannels.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil subscriptions: ' + error.message
    })
  }
}

// ==================== POST REQUESTS ====================

/**
 * FUNGSI: createUser (Register)
 * ENDPOINT: POST /api/users
 * TUJUAN: Membuat akun user baru (register)
 * BODY: { name, email, password }
 * RESPONSE: Object user baru (tanpa password)
 * NOTES: Password akan di-hash otomatis oleh Mongoose hook
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, avatar, bio } = req.body

    // VALIDASI
    if (!email || !password || !name) {
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

    // VALIDASI - Cek email sudah ada (unique)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      })
    }

    // VALIDASI - Password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      })
    }

    // Buat user baru - password akan di-hash otomatis oleh pre-save hook
    const newUser = await User.create({
      name,
      email,
      password,
      avatar: avatar || '👤',
      bio: bio || ''
    })

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: newUser.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error membuat user: ' + error.message
    })
  }
}

// ==================== PUT/PATCH REQUESTS ====================

/**
 * FUNGSI: updateUserProfile
 * ENDPOINT: PUT /api/users/:userId
 * TUJUAN: Update informasi profil user
 * PARAMS: userId (user ID)
 * BODY: { name, bio, avatar }
 * RESPONSE: Updated user object
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const { name, bio, avatar } = req.body

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Update field yang diberikan
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar) user.avatar = avatar

    const updatedUser = await user.save()

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate',
      data: updatedUser.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error update profil: ' + error.message
    })
  }
}

/**
 * FUNGSI: addToWatchlist
 * ENDPOINT: POST /api/users/:userId/watchlist
 * TUJUAN: Tambahkan video ke watchlist user
 * PARAMS: userId (user ID)
 * BODY: { videoId }
 * RESPONSE: Updated watchlist
 */
export const addToWatchlist = async (req, res) => {
  try {
    const { userId } = req.params
    const { videoId } = req.body

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'videoId harus diberikan'
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Gunakan method dari User schema
    await user.addToWatchlist(videoId)

    res.status(200).json({
      success: true,
      message: 'Video ditambahkan ke watchlist',
      data: user.watchlist
    })
  } catch (error) {
    // Handle specific error dari method
    if (error.message.includes('sudah ada')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error menambah ke watchlist: ' + error.message
    })
  }
}

/**
 * FUNGSI: subscribeChannel
 * ENDPOINT: POST /api/users/:userId/subscribe
 * TUJUAN: User subscribe ke sebuah channel
 * PARAMS: userId (user ID)
 * BODY: { channelId }
 * RESPONSE: Updated subscribed channels list
 */
export const subscribeChannel = async (req, res) => {
  try {
    const { userId } = req.params
    const { channelId } = req.body

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: 'channelId harus diberikan'
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Gunakan method dari User schema
    await user.subscribeChannel(channelId)

    res.status(200).json({
      success: true,
      message: 'Channel berhasil di-subscribe',
      data: user.subscribedChannels
    })
  } catch (error) {
    if (error.message.includes('subscribe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error subscribe channel: ' + error.message
    })
  }
}

// ==================== DELETE REQUESTS ====================

/**
 * FUNGSI: removeFromWatchlist
 * ENDPOINT: DELETE /api/users/:userId/watchlist/:videoId
 * TUJUAN: Hapus video dari watchlist user
 * PARAMS: userId (user ID), videoId (video ID)
 * RESPONSE: Updated watchlist
 */
export const removeFromWatchlist = async (req, res) => {
  try {
    const { userId, videoId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Gunakan method dari User schema
    await user.removeFromWatchlist(videoId)

    res.status(200).json({
      success: true,
      message: 'Video dihapus dari watchlist',
      data: user.watchlist
    })
  } catch (error) {
    if (error.message.includes('tidak ada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error menghapus dari watchlist: ' + error.message
    })
  }
}

/**
 * FUNGSI: unsubscribeChannel
 * ENDPOINT: DELETE /api/users/:userId/subscribe/:channelId
 * TUJUAN: User unsubscribe dari channel
 * PARAMS: userId (user ID), channelId (channel ID)
 * RESPONSE: Updated subscribed channels list
 */
export const unsubscribeChannel = async (req, res) => {
  try {
    const { userId, channelId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Gunakan method dari User schema
    await user.unsubscribeChannel(channelId)

    res.status(200).json({
      success: true,
      message: 'Channel berhasil di-unsubscribe',
      data: user.subscribedChannels
    })
  } catch (error) {
    if (error.message.includes('belum subscribe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error unsubscribe channel: ' + error.message
    })
  }
}

/**
 * FUNGSI: deleteUser
 * ENDPOINT: DELETE /api/users/:userId
 * TUJUAN: Delete user account (untuk CRUD testing)
 * PARAMS: userId (user ID)
 * RESPONSE: { success, message }
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus',
      data: { deletedUserId: userId }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menghapus user: ' + error.message
    })
  }
}

export default {
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
}
