# 🚀 StreamHub Backend API

Backend profesional untuk aplikasi streaming video **StreamHub** yang dibangun dengan **Node.js + Express.js**.

---

## 📁 STRUKTUR PROJECT

```
backend/
├── src/
│   ├── server.js                    # Entry point - setup Express server
│   ├── package.json                 # Dependencies management
│   ├── .env.example                 # Template konfigurasi environment
│   │
│   ├── config/
│   │   └── database.js              # Mock database & helper functions
│   │
│   ├── routes/                      # URL path definitions
│   │   ├── videos.js                # /api/videos endpoints
│   │   ├── users.js                 # /api/users endpoints
│   │   └── auth.js                  # /api/auth endpoints
│   │
│   ├── controllers/                 # Business logic (CRUD operations)
│   │   ├── videoController.js       # Video operations
│   │   ├── userController.js        # User operations
│   │   └── authController.js        # Auth operations
│   │
│   └── middleware/
│       └── errorHandler.js          # Error handling & CORS config
│
└── README.md                        # Documentation (file ini)
```

---

## 🔄 FLOW PENJELASAN

```
Request dari Frontend
        ↓
Server.js (menerima request)
        ↓
Routes (cocokkan dengan endpoint)
        ↓
Controller (logic proses data)
        ↓
Database (ambil/simpan data)
        ↓
Response JSON ke Frontend
```

---

## 🛠️ SETUP & INSTALASI

### 1. **Install Dependencies**
```bash
cd backend
npm install
```

### 2. **Setup Environment Variables**
```bash
# Copy .env.example menjadi .env
cp .env.example .env

# Edit .env sesuai kebutuhan
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. **Run Server**
```bash
# Development (watch mode)
npm run dev

# Production
npm start
```

Server akan jalan di: **http://localhost:5000**

---

## 📡 API ENDPOINTS DOCUMENTATION

### 🎬 **VIDEO ENDPOINTS**

#### 1. Get All Videos
```
GET /api/videos
Query Parameters:
  - page: 1 (pagination)
  - limit: 12 (items per page)
  - sort: newest | mostviews | rating

Response:
{
  success: true,
  message: "Berhasil mengambil semua video",
  data: [
    {
      id: "uuid-video-1",
      title: "Belajar JavaScript ES6",
      description: "...",
      channel: "Code Master",
      category: "Coding",
      duration: "38:45",
      views: "125400",
      rating: 4.8,
      ...
    },
    ...
  ],
  pagination: {
    total: 8,
    pages: 1,
    currentPage: 1,
    limit: 12
  }
}
```

#### 2. Get Single Video
```
GET /api/videos/:id

Response:
{
  success: true,
  data: { video object lengkap }
}
```

#### 3. Search Videos
```
GET /api/videos/search?query=javascript

Response:
{
  success: true,
  data: [ matching videos ],
  count: 3
}
```

#### 4. Get Videos by Category
```
GET /api/videos/category/Coding

Response:
{
  success: true,
  data: [ videos dalam kategori Coding ],
  count: 3
}
```

#### 5. Create New Video
```
POST /api/videos

Body:
{
  "title": "Belajar React",
  "description": "Tutorial React terbaru",
  "channel": "Dev Bootcamp",
  "category": "Coding",
  "duration": "1:30:00",
  "videoUrl": "https://..."
}

Response:
{
  success: true,
  message: "Video berhasil dibuat",
  data: { video object dengan id }
}
```

#### 6. Update Video
```
PUT /api/videos/:id

Body:
{
  "title": "Judul Baru",
  "description": "Deskripsi baru",
  "category": "Design"
}

Response:
{
  success: true,
  message: "Video berhasil diupdate",
  data: { updated video }
}
```

#### 7. Like Video
```
PATCH /api/videos/:id/like

Response:
{
  success: true,
  data: { video dengan likes++}
}
```

#### 8. Increment Views
```
PATCH /api/videos/:id/view

Response:
{
  success: true,
  data: { video dengan views++ }
}
```

#### 9. Delete Video
```
DELETE /api/videos/:id

Response:
{
  success: true,
  message: "Video berhasil dihapus"
}
```

---

### 👤 **USER ENDPOINTS**

#### 1. Register (Create User)
```
POST /api/users

Body:
{
  "name": "John Developer",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "👨‍💻",
  "bio": "Full Stack Developer"
}

Response:
{
  success: true,
  data: { user object tanpa password }
}
```

#### 2. Get User Profile
```
GET /api/users/:userId

Response:
{
  success: true,
  data: {
    id: "uuid",
    name: "John Developer",
    email: "john@example.com",
    avatar: "👨‍💻",
    bio: "...",
    subscribers: 1250,
    joinDate: "2025-01-15",
    ...
  }
}
```

#### 3. Update User Profile
```
PUT /api/users/:userId

Body:
{
  "name": "John Dev",
  "bio": "Senior Full Stack Developer",
  "avatar": "👨‍🚀"
}

Response:
{
  success: true,
  data: { updated user }
}
```

#### 4. Add to Watchlist
```
POST /api/users/:userId/watchlist

Body:
{
  "videoId": "video-id-123"
}

Response:
{
  success: true,
  data: [ "video-1", "video-2", "video-123" ]
}
```

#### 5. Get Watchlist
```
GET /api/users/:userId/watchlist

Response:
{
  success: true,
  data: [ "video-1", "video-2", ... ],
  count: 5
}
```

#### 6. Subscribe Channel
```
POST /api/users/:userId/subscribe

Body:
{
  "channelId": "channel-001"
}

Response:
{
  success: true,
  data: [ "channel-001", "channel-003", ... ]
}
```

#### 7. Get Subscriptions
```
GET /api/users/:userId/subscriptions

Response:
{
  success: true,
  data: [ channel IDs ],
  count: 5
}
```

#### 8. Remove from Watchlist
```
DELETE /api/users/:userId/watchlist/:videoId

Response:
{
  success: true,
  data: [ remaining watchlist ]
}
```

#### 9. Unsubscribe Channel
```
DELETE /api/users/:userId/subscribe/:channelId

Response:
{
  success: true,
  data: [ remaining subscriptions ]
}
```

---

### 🔐 **AUTH ENDPOINTS**

#### 1. Login
```
POST /api/auth/login

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  success: true,
  message: "Login berhasil",
  data: {
    user: { user object },
    // token: "jwt-token-here" (dalam real app)
  }
}
```

#### 2. Logout
```
POST /api/auth/logout

Response:
{
  success: true,
  message: "Logout berhasil"
}
```

#### 3. Verify Token
```
POST /api/auth/verify

Body:
{
  "token": "jwt-token-here"
}

Response:
{
  success: true,
  message: "Token valid"
}
```

#### 4. Change Password
```
POST /api/auth/change-password

Body:
{
  "userId": "user-id",
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}

Response:
{
  success: true,
  message: "Password berhasil diubah"
}
```

#### 5. Reset Password
```
POST /api/auth/reset-password

Body:
{
  "email": "john@example.com",
  "newPassword": "newpassword456"
}

Response:
{
  success: true,
  message: "Password berhasil direset"
}
```

---

## 🔍 PENJELASAN SETIAP KOMPONEN

### **server.js** - Entry Point
- Inisialisasi Express server
- Setup middleware (CORS, JSON parser)
- Mount routes
- Error handling
- Start listening di port tertentu

### **config/database.js** - Mock Database
- Menyimpan data video dan user dalam array
- Helper functions untuk query data (find, search, filter)
- Dalam real app, ini akan terhubung ke MongoDB/PostgreSQL

### **routes/** - URL Mapping
- Mendefinisikan path (/api/videos, /api/users, dll)
- Menghubungkan URL ke controller functions
- GET, POST, PUT, DELETE, PATCH methods

### **controllers/** - Business Logic
- Fungsi-fungsi yang handle request
- Validasi input
- Proses data
- Return JSON response

### **middleware/errorHandler.js** - Request Processing
- CORS configuration (allow frontend akses API)
- Error handling (catch error dan format response)
- Request logging (debug purposes)

---

## 🧪 TESTING API

### Menggunakan Postman:
1. Download/install Postman
2. Import endpoints di atas
3. Test setiap endpoint dengan request body

### Menggunakan cURL:
```bash
# Get all videos
curl http://localhost:5000/api/videos

# Create user (register)
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Menggunakan Frontend React:
```javascript
// Get all videos
const response = await fetch('http://localhost:5000/api/videos')
const data = await response.json()

// Create user
const response = await fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com',
    password: '123456'
  })
})
```

---

## ⚠️ PENTING - NEXT STEPS

### 1. **Implementasi Database Real**
```bash
# Install MongoDB driver
npm install mongoose

# Atau PostgreSQL
npm install pg sequelize
```

### 2. **Implementasi JWT Authentication**
```bash
npm install jsonwebtoken bcryptjs

# Guna untuk:
# - Hash passwords sebelum disimpan
# - Generate JWT token saat login
# - Verify token untuk protected routes
```

### 3. **Implementasi File Upload**
```bash
npm install multer

# Untuk:
# - Upload video file
# - Upload thumbnail/cover
# - Upload user avatar
```

### 4. **Validation dengan Joi**
```bash
npm install joi

# Untuk validasi input yang lebih robust
```

### 5. **Environment Variables Protection**
```
# .env file jangan commit ke git!
# Tambahkan ke .gitignore:
.env
.env.local
node_modules/
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Deploy ke Heroku:
```bash
npm install -g heroku-cli
heroku login
heroku create streamhub-backend
git push heroku main
```

### Deploy ke AWS/DigitalOcean:
1. Setup Ubuntu server
2. Install Node.js dan MongoDB
3. Clone repository
4. Setup environment variables
5. Run dengan PM2 (process manager)

```bash
npm install -g pm2
pm2 start src/server.js
pm2 save
pm2 startup
```

---

## 📚 TABEL REFERENSI QUICK RESPONSE

| Status | Meaning | Contoh |
|--------|---------|---------|
| 200 | OK | Data berhasil diambil |
| 201 | Created | Resource baru berhasil dibuat |
| 400 | Bad Request | Input validation error |
| 401 | Unauthorized | Login required |
| 404 | Not Found | Resource tidak ditemukan |
| 500 | Server Error | Error di server |

---

## 🎯 ERROR HANDLING PATTERNS

```javascript
// Validasi error
{
  success: false,
  message: "Email harus diisi"
}

// Not found error
{
  success: false,
  message: "Video tidak ditemukan"
}

// Authentication error
{
  success: false,
  message: "Email atau password salah"
}

// Server error
{
  success: false,
  message: "Error mengambil data: connection timeout"
}
```

---

## 💡 TIPS & BEST PRACTICES

1. **Konsistensi Response Format** - Semua response punya `success`, `message`, `data`
2. **Error Handling** - Catch error dan return status code yang tepat
3. **Input Validation** - Validasi semua input sebelum process
4. **Security** - Hash password, validate email, prevent SQL injection
5. **Pagination** - Untuk data besar, gunakan pagination
6. **CORS** - Configure CORS agar frontend bisa akses
7. **Rate Limiting** - Protect API dari abuse
8. **API Documentation** - Dokumentasi lengkap seperti ini

---

## 🔗 KONEKSI FRONTEND-BACKEND

Di React, untuk memanggil API:
```javascript
import { useState, useEffect } from 'react'

function VideoList() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    // Fetch dari backend API
    fetch('http://localhost:5000/api/videos')
      .then(res => res.json())
      .then(data => setVideos(data.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      {videos.map(video => (
        <div key={video.id}>{video.title}</div>
      ))}
    </div>
  )
}
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Port sudah digunakan
```bash
# Kill process yang menggunakan port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### CORS Error
- Pastikan `CORS_ORIGIN` di .env sesuai dengan frontend URL
- Frontend default di localhost:5173 (Vite)
- Jika berbeda, update di `corsConfig`

### Database Connection Error
- Pastikan database server sudah jalan
- Cek connection string di .env
- Cek kredensial database

---

**Created by: Anda**  
**Date: February 16, 2026**  
**Version: 1.0.0**

Happy Coding! 🚀
