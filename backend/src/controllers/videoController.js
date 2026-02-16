// ========================================================================
// FILE: videoController.js
// FUNGSI: Logic untuk menangani semua operasi video (CRUD operations)
// PENJELASAN:
// - Controller adalah "jantung" backend yang handle semua logic
// - Sekarang menggunakan MongoDB + Mongoose models
// - Async/await untuk handle database queries
// ========================================================================

import Video from '../models/Video.js'

// ==================== GET REQUESTS ====================

/**
 * FUNGSI: getAllVideos
 * ENDPOINT: GET /api/videos
 * TUJUAN: Mengambil semua video dengan opsi pagination dan sorting
 * QUERY PARAMS: page=1, limit=12, sort=newest
 * RESPONSE: Array video + metadata (total, pages, current page)
 */
export const getAllVideos = async (req, res) => {
  try {
    // Ambil parameters dari query (?page=1&limit=12)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const sort = req.query.sort || 'newest'

    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Build sort object
    let sortObj = {}
    if (sort === 'newest') {
      sortObj = { createdAt: -1 }
    } else if (sort === 'mostviews') {
      sortObj = { views: -1 }
    } else if (sort === 'rating') {
      sortObj = { rating: -1 }
    }

    // Query dari database hanya yang published
    const videos = await Video.find({ isPublished: true })
      .sort(sortObj)
      .skip(startIndex)
      .limit(limit)
      .populate('uploadedBy', 'name email avatar') // Include creator info

    // Total count untuk pagination
    const totalVideos = await Video.countDocuments({ isPublished: true })

    // Response success dengan data
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua video',
      data: videos,
      pagination: {
        total: totalVideos,
        pages: Math.ceil(totalVideos / limit),
        currentPage: page,
        limit: limit
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil video: ' + error.message
    })
  }
}

/**
 * FUNGSI: getVideoById
 * ENDPOINT: GET /api/videos/:id
 * TUJUAN: Mengambil detail lengkap 1 video
 * PARAMS: id (dari URL /api/videos/video-123)
 * RESPONSE: Object video dengan semua detail
 */
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params

    // Cari video dengan id tersebut di MongoDB
    const video = await Video.findById(id)
      .populate('uploadedBy', 'name email avatar bio')

    // Jika video tidak ditemukan
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    // Response success
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail video',
      data: video
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil video: ' + error.message
    })
  }
}

/**
 * FUNGSI: getVideosByCategory
 * ENDPOINT: GET /api/videos/category/:categoryName
 * TUJUAN: Mengambil semua video dalam kategori tertentu
 * PARAMS: categoryName (Coding, Design, Marketing, dll)
 * RESPONSE: Array video sesuai kategori
 */
export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params

    // Cari semua video dengan kategori tersebut
    const videos = await Video.find({ category, isPublished: true })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name avatar')

    // Jika tidak ada video di kategori ini
    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada video dalam kategori ${category}`
      })
    }

    res.status(200).json({
      success: true,
      message: `Berhasil mengambil video kategori ${category}`,
      data: videos,
      count: videos.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil video: ' + error.message
    })
  }
}

/**
 * FUNGSI: searchVideos
 * ENDPOINT: GET /api/videos/search?query=javascript
 * TUJUAN: Mencari video berdasarkan keyword
 * QUERY: query (kata kunci pencarian)
 * RESPONSE: Array video yang sesuai search query
 */
export const searchVideos_handler = async (req, res) => {
  try {
    const { query } = req.query

    // Validasi query tidak kosong
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query pencarian tidak boleh kosong'
      })
    }

    // Cari video dengan regex (case-insensitive search)
    const results = await Video.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { channel: { $regex: query, $options: 'i' } }
      ],
      isPublished: true
    }).populate('uploadedBy', 'name avatar')

    res.status(200).json({
      success: true,
      message: `Hasil pencarian untuk "${query}"`,
      data: results,
      count: results.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mencari video: ' + error.message
    })
  }
}

// ==================== POST REQUESTS ====================

/**
 * FUNGSI: createVideo
 * ENDPOINT: POST /api/videos
 * TUJUAN: Upload/membuat video baru (admin/creator only)
 * BODY: { title, description, channel, category, duration, videoUrl }
 * RESPONSE: Object video yang baru dibuat dengan ID
 */
export const createVideo = async (req, res) => {
  try {
    const { title, description, channel, category, duration, videoUrl, uploadedBy } = req.body

    // VALIDASI - Semua field harus ada
    if (!title || !description || !channel || !category || !uploadedBy) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi: title, description, channel, category, uploadedBy'
      })
    }

    // VALIDASI - Title tidak boleh terlalu pendek
    if (title.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Judul video minimal 5 karakter'
      })
    }

    // Buat document video baru di MongoDB
    const newVideo = await Video.create({
      title,
      description,
      channel,
      category,
      duration: duration || '0:00',
      videoUrl: videoUrl || '',
      uploadedBy,
      thumbnail: '📹'
    })

    // Populate creator info
    await newVideo.populate('uploadedBy', 'name email avatar')

    res.status(201).json({
      success: true,
      message: 'Video berhasil dibuat',
      data: newVideo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error membuat video: ' + error.message
    })
  }
}

// ==================== PUT/PATCH REQUESTS ====================

/**
 * FUNGSI: updateVideoInfo
 * ENDPOINT: PUT /api/videos/:id
 * TUJUAN: Update informasi video yang sudah ada
 * PARAMS: id (video ID)
 * BODY: { title, description, category }
 * RESPONSE: Object video yang sudah diupdate
 */
export const updateVideoInfo = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category } = req.body

    // Cek apakah video ada
    const video = await Video.findById(id)
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    // Update video
    if (title) video.title = title
    if (description) video.description = description
    if (category) video.category = category

    const updatedVideo = await video.save()

    res.status(200).json({
      success: true,
      message: 'Video berhasil diupdate',
      data: updatedVideo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error update video: ' + error.message
    })
  }
}

/**
 * FUNGSI: likeVideo
 * ENDPOINT: PATCH /api/videos/:id/like
 * TUJUAN: User like video (tambah jumlah likes)
 * PARAMS: id (video ID)
 * RESPONSE: Updated video dengan like count baru
 */
export const likeVideo = async (req, res) => {
  try {
    const { id } = req.params

    // Cek video ada
    const video = await Video.findById(id)
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    // Gunakan method dari schema untuk increment likes
    const updatedVideo = await video.addLike()

    res.status(200).json({
      success: true,
      message: 'Video berhasil di-like',
      data: updatedVideo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error like video: ' + error.message
    })
  }
}

/**
 * FUNGSI: incrementViews
 * ENDPOINT: PATCH /api/videos/:id/view
 * TUJUAN: Tambah views count saat user play video
 * PARAMS: id (video ID)
 * RESPONSE: Updated video dengan view count baru
 */
export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findById(id)
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      })
    }

    // Gunakan method dari schema untuk increment views
    const updatedVideo = await video.incrementViews()

    res.status(200).json({
      success: true,
      message: 'Views berhasil ditambah',
      data: updatedVideo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error increment views: ' + error.message
    })
  }
}

// ==================== DELETE REQUESTS ====================

/**
 * FUNGSI: deleteVideoById
 * ENDPOINT: DELETE /api/videos/:id
 * TUJUAN: Hapus video dari database
 * PARAMS: id (video ID)
 * RESPONSE: Success message
 */
export const deleteVideoById = async (req, res) => {
  try {
    const { id } = req.params

    // Cek video ada & hapus
    const deleted = await Video.findByIdAndDelete(id)

    if (!deleted) {
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
      message: 'Error delete video: ' + error.message
    })
  }
}

export default {
  getAllVideos,
  getVideoById,
  getVideosByCategory,
  searchVideos_handler,
  createVideo,
  updateVideoInfo,
  likeVideo,
  incrementViews,
  deleteVideoById
}
