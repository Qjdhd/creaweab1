# 🚀 Frontend + Backend Setup Guide - Running Together

## 📋 Overview

Aplikasi StreamHub terdiri dari 2 bagian yang harus berjalan bersama:

```
Frontend (React + Vite)
├── Port: 5173
├── URL: http://localhost:5173
└── Call API: http://localhost:5000

Backend (Express + MongoDB)
├── Port: 5000
├── URL: http://localhost:5000
└── Serve API endpoints
```

---

## 🎯 Quick Start (Recommended)

### Option A: Two Terminal Windows (SIMPLEST)

Buka **2 terminal** dan jalankan keduanya:

#### Terminal 1 - Backend
```bash
cd backend
npm install          # Only first time
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:5000
📡 Connected to MongoDB
```

#### Terminal 2 - Frontend
```bash
cd .                 # Stay in root folder
npm install          # Only first time
npm run dev
```

Expected output:
```
VITE v4.0.0 ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

#### Result:
✅ Frontend accessible: http://localhost:5173
✅ Backend accessible: http://localhost:5000
✅ Frontend auto-fetch dari backend

---

## 🔧 Step-by-Step Setup

### Step 1: Prepare Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Populate database dengan test data
npm run seed

# Verify seed berhasil
npm run seed
```

Expected:
```
✅ Database seeding completed successfully!
📝 Test Accounts:
   john@example.com / password123
   sarah@example.com / password123
```

### Step 2: Prepare Frontend

```bash
# Back to root folder
cd ..

# Install dependencies
npm install

# (Optional) Verify installation
npm list --depth=0
```

### Step 3: Verify Frontend API URL

Edit [src/main.jsx](src/main.jsx) atau create API config file:

**Option 1: Create config file** (Recommended)
```bash
# Create: src/api/client.js
touch src/api/client.js
```

```javascript
// src/api/client.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

export const fetchVideos = async (page = 1, limit = 12) => {
  const response = await fetch(`${API_URL}/api/videos?page=${page}&limit=${limit}`)
  return response.json()
}

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirmPassword: password })
  })
  return response.json()
}

// ... export other API functions
```

### Step 4: Start Both Applications

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
npm run dev
```

---

## 📱 Frontend Integration with Backend

### 1. Update React Component untuk Call Backend

**Before** (using mock data):
```javascript
// src/App.jsx (OLD)
const videosDatabase = [
  { id: 1, title: "Learn JavaScript", views: 1250, ... },
  { id: 2, title: "React Tutorial", views: 890, ... },
]

export default function App() {
  const [videos, setVideos] = useState(videosDatabase)
  // ...
}
```

**After** (using actual backend):
```javascript
// src/App.jsx (NEW)
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:5000'

export default function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch videos dari backend saat component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/videos?limit=12`)
        const data = await response.json()
        
        if (data.success) {
          setVideos(data.data) // From backend database
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError('Gagal connect ke backend: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) return <div>Loading videos...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {/* Render videos dari backend */}
      {videos.map(video => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )
}
```

### 2. Auth Integration

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = 'http://localhost:5000'

  // Check token di localStorage saat app startup
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    if (savedToken) {
      setToken(savedToken)
      // Optionally verify token validity
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()

      if (data.success) {
        const { accessToken, refreshToken } = data.data.tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        setToken(accessToken)
        setUser(data.data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
```

### 3. Protected API Calls

```javascript
// src/api/client.js - Helper untuk API calls with auth

const API_URL = 'http://localhost:5000'

// Helper function untuk fetch dengan auth header
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  // Handle token expired (401)
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      // Try refresh token
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        localStorage.setItem('accessToken', refreshData.data.accessToken)
        // Retry original request with new token
        return fetchWithAuth(endpoint, options)
      }
    }
  }

  return response.json()
}

// Example usage:
export const addToWatchlist = (userId, videoId) => {
  return fetchWithAuth(`/api/users/${userId}/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ videoId })
  })
}

export const likeVideo = (videoId) => {
  return fetchWithAuth(`/api/videos/${videoId}/like`, {
    method: 'PATCH'
  })
}
```

---

## 🧪 Testing Frontend + Backend Integration

### Test 1: Get Videos from Backend

Open browser → http://localhost:5173
Check console (F12) → Network tab

Verify:
- ✅ Request: GET http://localhost:5000/api/videos
- ✅ Response: 200 OK dengan video data dari database

### Test 2: Login Integration

Create Login page:
```javascript
// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('john@example.com')
  const [password, setPassword] = useState('password123')
  const { login } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      alert('✅ Login berhasil!')
      // Redirect ke dashboard
    } else {
      alert('❌ Login gagal: ' + result.message)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Test 3: Add to Watchlist

```javascript
const handleAddToWatchlist = async (videoId) => {
  const result = await addToWatchlist(userId, videoId)
  if (result.success) {
    alert('✅ Added to watchlist!')
  } else {
    alert('❌ Error: ' + result.message)
  }
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: CORS Error

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/videos' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Check backend `.env`:
   ```bash
   CORS_ORIGIN=http://localhost:5173
   ```
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue 2: Frontend Can't Connect to Backend

**Error:**
```
Failed to fetch from http://localhost:5000/api/videos
```

**Solution:**
1. Verify backend running:
   ```bash
   curl http://localhost:5000/health
   ```
2. Check if port 5000 open:
   ```bash
   # Linux/Mac
   lsof -i :5000
   
   # Windows
   netstat -ano | findstr :5000
   ```
3. Update `API_URL` di frontend code

### Issue 3: Videos Show But Data Mismatch

**Cause:** Frontend cache or stale data

**Solution:**
```javascript
// Clear cache
localStorage.clear()

// Or specific keys
localStorage.removeItem('videosCache')

// Developer tools → Application → Clear site data
```

### Issue 4: Login Not Persisting

**Solution:** Implement localStorage token persistence

```javascript
// Check token on app startup
useEffect(() => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    // Verify token still valid
    verifyToken(token).then(isValid => {
      if (isValid) {
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('accessToken')
      }
    })
  }
}, [])
```

---

## 🛠️ Advanced Setup Options

### Option B: Using npm Concurrently (Run Both in 1 Terminal)

Install concurrently:
```bash
npm install -D concurrently
```

Update root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "npm run build",
    "build:backend": "cd backend && npm run build"
  }
}
```

Then just run:
```bash
npm run dev
```

Both akan start di satu terminal!

### Option C: Docker (For Production)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: streamhub

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/streamhub
    depends_on:
      - mongodb

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000
```

Run:
```bash
docker-compose up
```

---

## 📊 Troubleshooting Checklist

- [ ] Backend running on 5000?
  ```bash
  curl http://localhost:5000/health
  ```

- [ ] Frontend running on 5173?
  ```bash
  curl http://localhost:5173
  ```

- [ ] MongoDB connected?
  ```bash
  mongosh
  use streamhub
  db.videos.count()
  ```

- [ ] CORS configured correctly?
  Check `.env`: `CORS_ORIGIN=http://localhost:5173`

- [ ] API URL correct in frontend?
  Check code: `API_URL = 'http://localhost:5000'`

- [ ] Token saved in localStorage?
  DevTools → Application → localStorage → `accessToken`

- [ ] Network requests showing?
  DevTools → Network tab → Filter by XHR

---

## 🎯 Complete Workflow

```bash
# Terminal 1: Backend
cd backend
npm install                    # First time only
npm run seed                   # First time only
npm run dev

# Terminal 2: Frontend (after backend ready)
npm install                    # First time only
npm run dev

# Open browser
# Navigate to http://localhost:5173
# Check console (F12) for API calls
# Test login with john@example.com / password123
```

---

## ✅ Verification Checklist

- [ ] Backend accepting CORS from localhost:5173
- [ ] Frontend displaying videos from /api/videos
- [ ] Login working (token saved in localStorage)
- [ ] Can add video to watchlist (authenticated request)
- [ ] Token refresh working when access token expires
- [ ] MongoDB data persisting after reload

---

## 📚 Next: Integration Checklist for Frontend

Update following React components untuk call backend:

1. **App.jsx** - Fetch videos from `/api/videos`
2. **LoginPage** - POST to `/api/auth/login`
3. **RegisterPage** - POST to `/api/auth/register`
4. **VideoCard** - Add like button → PATCH `/api/videos/:id/like`
5. **VideoPlayer** - Increment views → PATCH `/api/videos/:id/view`
6. **ProfilePage** - GET `/api/users/:userId`
7. **Watchlist** - POST/DELETE `/api/users/:userId/watchlist`
8. **SearchBar** - GET `/api/videos/search?query=...`

---

## 🚀 Summary

**Backend + Frontend synchronized:**
```
├── Backend: http://localhost:5000 (Express + MongoDB)
├── Frontend: http://localhost:5173 (React + Vite)
└── Communication: REST API via fetch
```

**Files to update:**
- `src/App.jsx` - Add API integration
- Create `src/api/client.js` - API helper functions
- Create `src/contexts/AuthContext.jsx` - Auth state management
- Create login/register pages

**Test accounts ready:**
- john@example.com / password123
- admin@example.com / admin123456

Happy coding! 🎉
