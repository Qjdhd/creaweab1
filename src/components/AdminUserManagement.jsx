// ========================================================================
// FILE: src/components/AdminUserManagement.jsx
// FUNGSI: User management CRUD interface
// ========================================================================

import { useState, useEffect } from 'react'
import {
  getAllUsersAdmin,
  getUserByIdAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin
} from '../services/admin.js'
import '../styles/AdminManagement.css'

export default function AdminUserManagement({ onStatsUpdate }) {
  const [mode, setMode] = useState('view') // 'view' atau 'create'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  })
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [page, search])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllUsersAdmin(page, 10, search)
      setUsers(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields required')
      return
    }

    try {
      await createUserAdmin(formData)
      setFormData({ name: '', email: '', password: '', isAdmin: false })
      setMode('view')
      loadUsers()
      onStatsUpdate()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setFormError('')

    try {
      await updateUserAdmin(editingId, {
        name: formData.name,
        email: formData.email,
        isAdmin: formData.isAdmin
      })
      setFormData({ name: '', email: '', password: '', isAdmin: false })
      setEditingId(null)
      setMode('view')
      loadUsers()
      onStatsUpdate()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleEditUser = async (userId) => {
    try {
      const user = await getUserByIdAdmin(userId)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        isAdmin: user.isAdmin
      })
      setEditingId(userId)
      setMode('create')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteUserAdmin(userId)
      loadUsers()
      onStatsUpdate()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', password: '', isAdmin: false })
    setEditingId(null)
    setMode('view')
    setFormError('')
  }

  return (
    <div className="management-container">
      <h2>👥 User Management</h2>

      <div className="management-tabs">
        <button
          className={`tab-btn ${mode === 'view' ? 'active' : ''}`}
          onClick={() => { handleReset(); setMode('view') }}
        >
          📋 View Users
        </button>
        <button
          className={`tab-btn ${mode === 'create' ? 'active' : ''}`}
          onClick={() => { handleReset(); setMode('create') }}
        >
          ➕ {editingId ? 'Edit User' : 'Create User'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {mode === 'create' && (
        <div className="form-section">
          <h3>{editingId ? '✏️ Edit User' : '➕ Create New User'}</h3>
          {formError && <div className="error-message">{formError}</div>}

          <form onSubmit={editingId ? handleUpdateUser : handleCreateUser}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>

            {!editingId && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                />
                Set as Admin
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '💾 Update' : '✅ Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View/List Users */}
      {mode === 'view' && (
        <div className="list-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="search-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p>⏳ Loading users...</p>
          ) : users.length === 0 ? (
            <p>📭 No users found</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Active</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.isAdmin ? '✅ Yes' : '❌ No'}</td>
                      <td>{user.isActive ? '✅ Yes' : '❌ No'}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditUser(user._id)}
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
