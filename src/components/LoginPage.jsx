// ========================================================================
// FILE: src/components/LoginPage.jsx
// FUNGSI: Admin login page
// ========================================================================

import { useState } from 'react'
import { loginUser } from '../services/auth.js'
import '../styles/LoginPage.css'

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginUser(email, password)
      
      if (result.success || result.data) {
        // Login berhasil
        onLoginSuccess()
      }
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <video className="login-bg" autoPlay muted loop>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>

      <div className="login-overlay"></div>

      <div className="login-box">
        <div className="login-header">
          <h1>🔐 Admin Login</h1>
          <p>StreamHub Administration Panel</p>
        </div>

        {error && <div className="login-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@streamhub.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🔓 Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <code>admin@streamhub.com / admin123</code>
        </div>
      </div>
    </div>
  )
}
