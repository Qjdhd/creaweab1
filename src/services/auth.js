// ========================================================================
// FILE: src/services/auth.js
// FUNGSI: Handle authentication - login, logout, token storage
// ========================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Login user - return token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    // Normalize token + user returned by backend and store in localStorage
    const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken || data.data?.tokens?.accessToken || data.tokens?.accessToken
    const user = data.data?.user || data.user

    if (token) {
      localStorage.setItem('token', token)
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Logout user - remove token
 */
export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return Promise.resolve()
}

/**
 * Get stored token
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Get stored user
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getStoredUser()
  return user?.isAdmin === true
}

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  return !!getToken()
}
