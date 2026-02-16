// ========================================================================
// FILE: api/users.js
// FUNGSI: Service untuk handle semua API calls ke endpoint /api/users
// ========================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Get all users (for admin/testing)
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const url = `${API_BASE}/users`
    console.log('👥 Fetching all users')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    const users = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Fetched ${users.length} users`)
    return users
  } catch (error) {
    console.error('❌ Error fetching users:', error.message)
    return []
  }
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object
 */
export const getUserProfile = async (userId) => {
  try {
    const url = `${API_BASE}/users/${userId}`
    console.log('👤 Fetching user profile:', userId)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`User not found: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Profile fetched:', result.data.email)
    return result.data
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message)
    throw error
  }
}

/**
 * Create new user
 * @param {Object} userData - User data (name, email, password, avatar, bio)
 * @returns {Promise<Object>} - Created user object
 */
export const createUser = async (userData) => {
  try {
    const url = `${API_BASE}/users`
    console.log('➕ Creating user:', userData.email)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to create user: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ User created:', result.data.email)
    return result.data
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    throw error
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Updated user object
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    const url = `${API_BASE}/users/${userId}`
    console.log('✏️ Updating user:', userId)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ User updated')
    return result.data
  } catch (error) {
    console.error('❌ Error updating user:', error.message)
    throw error
  }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteUser = async (userId) => {
  try {
    const url = `${API_BASE}/users/${userId}`
    console.log('🗑️ Deleting user:', userId)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ User deleted')
    return result
  } catch (error) {
    console.error('❌ Error deleting user:', error.message)
    throw error
  }
}

/**
 * Get user watchlist
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of videos in watchlist
 */
export const getUserWatchlist = async (userId) => {
  try {
    const url = `${API_BASE}/users/${userId}/watchlist`
    console.log('📝 Fetching watchlist for user:', userId)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch watchlist: ${response.status}`)
    }

    const result = await response.json()
    const videos = Array.isArray(result.data) ? result.data : [result.data]
    
    console.log(`✅ Fetched ${videos.length} videos from watchlist`)
    return videos
  } catch (error) {
    console.error('❌ Error fetching watchlist:', error.message)
    return []
  }
}

/**
 * Add video to watchlist
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - Updated watchlist
 */
export const addToWatchlist = async (userId, videoId) => {
  try {
    const url = `${API_BASE}/users/${userId}/watchlist`
    console.log('➕ Adding to watchlist:', videoId)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ videoId })
    })

    if (!response.ok) {
      throw new Error(`Failed to add to watchlist: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Added to watchlist')
    return result.data
  } catch (error) {
    console.error('❌ Error adding to watchlist:', error.message)
    throw error
  }
}

export default {
  getAllUsers,
  getUserProfile,
  createUser,
  updateUserProfile,
  deleteUser,
  getUserWatchlist,
  addToWatchlist
}
