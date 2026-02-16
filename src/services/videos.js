// ========================================================================
// FILE: api/videos.js
// FUNGSI: Service untuk handle semua API calls ke endpoint /api/videos
// ========================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Get all videos dari backend
 * @param {Object} options - Query options (limit, page, category, search)
 * @returns {Promise<Array>} - Array of video objects
 */
export const getAllVideos = async (options = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (options.limit) params.append('limit', options.limit)
    if (options.page) params.append('page', options.page)
    if (options.category) params.append('category', options.category)
    if (options.search) params.append('search', options.search)

    const url = params.toString() 
      ? `${API_BASE}/videos?${params.toString()}`
      : `${API_BASE}/videos`

    console.log('🎬 Fetching videos from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // Handle different response formats
    const videos = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Fetched ${videos.length} videos`)
    return videos
  } catch (error) {
    console.error('❌ Error fetching videos:', error.message)
    throw error
  }
}

/**
 * Get single video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - Video object
 */
export const getVideoById = async (videoId) => {
  try {
    const url = `${API_BASE}/videos/${videoId}`
    console.log('🎬 Fetching video:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Video not found: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Video fetched:', result.data.title)
    return result.data
  } catch (error) {
    console.error('❌ Error fetching video:', error.message)
    throw error
  }
}

/**
 * Search videos
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching videos
 */
export const searchVideos = async (query) => {
  try {
    if (!query.trim()) {
      return await getAllVideos()
    }

    const url = `${API_BASE}/videos/search?q=${encodeURIComponent(query)}`
    console.log('🔍 Searching videos:', query)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const result = await response.json()
    const videos = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Found ${videos.length} videos`)
    return videos
  } catch (error) {
    console.error('❌ Error searching videos:', error.message)
    // Return empty array on error instead of throwing
    return []
  }
}

/**
 * Get videos by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} - Array of videos in category
 */
export const getVideosByCategory = async (category) => {
  try {
    if (category === 'Semua' || !category) {
      return await getAllVideos()
    }

    const url = `${API_BASE}/videos?category=${encodeURIComponent(category)}`
    console.log('📂 Fetching videos by category:', category)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status}`)
    }

    const result = await response.json()
    const videos = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Fetched ${videos.length} videos from category: ${category}`)
    return videos
  } catch (error) {
    console.error('❌ Error fetching by category:', error.message)
    return []
  }
}

/**
 * Get featured videos
 * @returns {Promise<Array>} - Array of featured videos
 */
export const getFeaturedVideos = async () => {
  try {
    const url = `${API_BASE}/videos?featured=true&limit=5`
    console.log('⭐ Fetching featured videos')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch featured videos: ${response.status}`)
    }

    const result = await response.json()
    const videos = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Fetched ${videos.length} featured videos`)
    return videos.length > 0 ? videos[0] : null
  } catch (error) {
    console.error('❌ Error fetching featured videos:', error.message)
    return null
  }
}

export default {
  getAllVideos,
  getVideoById,
  searchVideos,
  getVideosByCategory,
  getFeaturedVideos
}
