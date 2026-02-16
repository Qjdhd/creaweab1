// ========================================================================
// FILE: src/services/admin.js
// FUNGSI: Handle admin API calls
// ========================================================================

import { getToken } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
})

/**
 * ==================== ADMIN STATS ====================
 */

export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw error
  }
}

/**
 * ==================== USER MANAGEMENT ====================
 */

export const getAllUsersAdmin = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      method: 'GET',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const getUserByIdAdmin = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export const createUserAdmin = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUserAdmin = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUserAdmin = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * ==================== VIDEO MANAGEMENT ====================
 */

export const getAllVideosAdmin = async (page = 1, limit = 10, search = '', category = '') => {
  try {
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    if (category) params.append('category', category)
    
    const response = await fetch(`${API_BASE_URL}/admin/videos?${params}`, {
      method: 'GET',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  } catch (error) {
    console.error('Error fetching videos:', error)
    throw error
  }
}

export const getVideoByIdAdmin = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${videoId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}

export const createVideoAdmin = async (videoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/videos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(videoData)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error creating video:', error)
    throw error
  }
}

export const updateVideoAdmin = async (videoId, videoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${videoId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(videoData)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data.data
  } catch (error) {
    console.error('Error updating video:', error)
    throw error
  }
}

export const deleteVideoAdmin = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/videos/${videoId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  } catch (error) {
    console.error('Error deleting video:', error)
    throw error
  }
}
