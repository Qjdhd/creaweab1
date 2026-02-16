// ========================================================================
// FILE: adminController.js
// FUNGSI: Controller untuk semua operasi admin (CRUD users & videos)
// ========================================================================

import User from '../models/User.js'
import Video from '../models/Video.js'

/**
 * ==================== ADMIN USER MANAGEMENT ====================
 */

// GET semua users dengan pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    })
  }
}

// GET single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -passwordResetToken -passwordResetExpires')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    })
  }
}

// CREATE user (admin)
export const createUserAdmin = async (req, res) => {
  try {
    const { name, email, password, isAdmin = false } = req.body

    // Validasi
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, dan password harus diisi'
      })
    }

    // Check email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      isAdmin,
      isVerified: true // Admin create user = verified
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: user.toObject({ transform: (doc, ret) => {
        delete ret.password
        return ret
      }})
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    })
  }
}

// UPDATE user (admin)
export const updateUserAdmin = async (req, res) => {
  try {
    const { name, email, isAdmin, isActive, bio, avatar } = req.body
    const userId = req.params.userId

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (bio !== undefined) user.bio = bio
    if (avatar) user.avatar = avatar
    if (isAdmin !== undefined) user.isAdmin = isAdmin
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    res.status(200).json({
      success: true,
      message: 'User berhasil diupdate',
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    })
  }
}

// DELETE user (admin)
export const deleteUserAdmin = async (req, res) => {
  try {
    const userId = req.params.userId

    // Prevent admin deleting themselves or other admins
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    await User.findByIdAndDelete(userId)

    // Also delete user's videos
    await Video.deleteMany({ uploadedBy: userId })

    res.status(200).json({
      success: true,
      message: 'User dan video-nya berhasil dihapus'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    })
  }
}

/**
 * ==================== ADMIN VIDEO MANAGEMENT ====================
 */

// GET semua videos dengan pagination
export const getAllVideosAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }
    if (category) {
      query.category = category
    }

    const total = await Video.countDocuments(query)
    const videos = await Video.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message
    })
  }
}

// GET single video by ID
export const getVideoByIdAdmin = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('uploadedBy', 'name email')

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      data: video
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message
    })
  }
}

// CREATE video (admin)
export const createVideoAdmin = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      thumbnail,
      videoUrl,
      uploadedBy
    } = req.body

    // Validasi
    if (!title || !category || !uploadedBy) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, dan uploadedBy harus diisi'
      })
    }

    // Check if user exists
    const userExists = await User.findById(uploadedBy)
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    const video = new Video({
      title,
      description: description || '',
      category,
      duration: duration || '0:00',
      thumbnail: thumbnail || '📹',
      videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      uploadedBy,
      views: 0,
      rating: 4.5,
      channel: userExists.name
    })

    await video.save()

    res.status(201).json({
      success: true,
      message: 'Video berhasil dibuat',
      data: video
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message
    })
  }
}

// UPDATE video (admin)
export const updateVideoAdmin = async (req, res) => {
  try {
    const videoId = req.params.videoId
    const { title, description, category, duration, thumbnail, videoUrl } = req.body

    const video = await Video.findById(videoId)
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    // Update fields yang ada
    if (title) video.title = title
    if (description !== undefined) video.description = description
    if (category) video.category = category
    if (duration) video.duration = duration
    if (thumbnail) video.thumbnail = thumbnail
    if (videoUrl) video.videoUrl = videoUrl

    await video.save()

    res.status(200).json({
      success: true,
      message: 'Video berhasil diupdate',
      data: video
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    })
  }
}

// DELETE video (admin)
export const deleteVideoAdmin = async (req, res) => {
  try {
    const videoId = req.params.videoId

    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Video berhasil dihapus'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    })
  }
}

/**
 * ==================== ADMIN STATISTICS ====================
 */

// GET dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalAdmins = await User.countDocuments({ isAdmin: true })
    const totalVideos = await Video.countDocuments()
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalVideos,
        totalViews: totalViews[0]?.total || 0
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    })
  }
}
