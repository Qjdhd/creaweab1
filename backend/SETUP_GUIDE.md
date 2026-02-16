# 🎬 StreamHub Backend - Complete Setup & Testing Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation & Setup](#installation--setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [API Testing](#api-testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Sebelum mulai, pastikan sudah install:

### Required Software
- **Node.js** (v16+) - Download dari https://nodejs.org
- **MongoDB** (v4.4+) - Local atau MongoDB Atlas (Cloud)
  - Local: Download dari https://www.mongodb.com/try/download/community
  - Cloud: Setup free account di https://www.mongodb.com/cloud/atlas

### Verification
Verify instalasi dengan command:
```bash
node --version      # Expected: v16.0.0+
npm --version       # Expected: 8.0.0+
```

### Untuk MongoDB (jika local):
```bash
mongod --version    # Expected: 4.4.0+
mongod              # Jalankan MongoDB server in background
```

---

## Installation & Setup

### Step 1: Install Dependencies

Masuk ke folder `backend`:
```bash
cd backend
npm install
```

Ini akan install semua packages dalam `package.json`:
- **express** - Web framework
- **mongoose** - MongoDB ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

### Step 2: Verify Installation

Check packages sudah install:
```bash
npm list --depth=0
```

Expected output:
```
├── bcryptjs@2.4.3
├── cors@2.8.5
├── dotenv@16.0.3
├── express@4.18.2
├── jsonwebtoken@9.1.2
├── mongoose@8.0.0
└── uuid@9.0.0
```

---

## Environment Configuration

### Step 1: Create .env File

Copy from `.env.example` dan create `.env`:
```bash
# Linux/Mac
cp .env.example .env

# Windows (powershell)
Copy-Item -Path ".env.example" -Destination ".env"
```

### Step 2: Configure Environment Variables

Edit `.env` file dengan text editor, ubah nilai sesuai setup Anda:

#### For Local MongoDB:
```bash
# Backend Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Local)
MONGODB_URI=mongodb://localhost:27017/streamhub

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-12345
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-67890

# Password Hashing
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### For MongoDB Atlas (Cloud):
```bash
# Jika menggunakan MongoDB Atlas cloud
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamhub?retryWrites=true&w=majority

# Rest sama seperti di atas
JWT_SECRET=your-secret-key-change-in-production-12345
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-67890
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Verify Configuration

Check `.env` file sudah correct:
```bash
cat .env    # Linux/Mac
type .env   # Windows
```

---

## Database Setup

### Option A: Using Local MongoDB

#### 1. Start MongoDB Server

**Linux/Mac:**
```bash
# Start MongoDB in background
brew services start mongodb-community   # macOS with Homebrew
mongod                                   # Manual start
```

**Windows:**
```powershell
# MongoDB usually installed as service, should start automatically
# Verify:
Get-Service MongoDB    # Should show "Running"

# Or start manually:
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

#### 2. Verify Connection

```bash
# Test koneksi
mongosh    # atau: mongo (older version)
```

Output should show:
```
Current Mongosh Log ID: ...
connect: mongodb://127.0.0.1:27017/test
```

Press `exit()` untuk keluar.

### Option B: Using MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (choose free tier)
4. Get connection string:
   - Click "Connect"
   - Choose "Drivers" tab
   - Copy connection string
   - Replace `<username>:<password>` dengan credentials
5. Paste ke `MONGODB_URI` di `.env`

### Step 3: Populate Database with Seed Data

Jalankan seed script untuk create test data (8 videos, 4 users):

```bash
# Normal mode (create if not exist)
npm run seed

# Force mode (reset database - hapus existing data)
npm run seed -- --force
```

Expected output:
```
✅ Database connection successful!
📊 Database: streamhub
🗑️  Clearing existing data...

📝 Creating users...
✅ User created: john@example.com (Creator)
✅ User created: sarah@example.com (Designer)
✅ User created: mike@example.com (Student)
✅ User created: admin@example.com (Admin)

🎬 Creating videos...
✅ Video created: "Learn JavaScript Basics" (Coding)
✅ Video created: 7 more videos...

👥 Creating relationships...
✅ Relationships created

📊 Seed Data Summary:
   - Users: 4
   - Videos: 8
   - Watchlist entries: 4
   - Subscriptions: 4

🎉 Database seeding completed successfully!

📝 Test Accounts:
   john@example.com / password123
   sarah@example.com / password123
   mike@example.com / password123
   admin@example.com / admin123456
```

---

## Running the Server

### Development Mode (With Auto-Reload)

```bash
npm run dev
```

This uses `nodemon` untuk auto-reload saat ada file changes.

Expected output:
```
[nodemon] starting `node src/server.js`

========================================
🚀 StreamHub API - Starting Server
========================================

📦 Connecting to MongoDB...
✅ Connected to MongoDB
   📊 Database: streamhub
   🔗 Connection Pool: 10

✅ Server running on http://localhost:5000
🌍 Environment: development
📡 CORS Origin: http://localhost:5173

📚 API Endpoints:
   GET  /health - Health check
   GET  / - API info
   GET  /api/videos - Get all videos
   POST /api/auth/login - Login

📖 Full documentation in README.md
========================================
```

### Production Mode

```bash
npm start
```

### Verify Server Running

Buka browser atau test dengan curl:

```bash
# Check health
curl http://localhost:5000/health

# Get API info
curl http://localhost:5000/

# Get all videos
curl http://localhost:5000/api/videos
```

Expected response:
```json
{
  "success": true,
  "message": "Berhasil mengambil semua video",
  "data": [
    {
      "_id": "...",
      "title": "Learn JavaScript Basics",
      "description": "...",
      "channel": "CodeMaster",
      "views": 1250,
      "likes": 45,
      "category": "Coding",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 8
  }
}
```

---

## API Testing

### Test Authentication

#### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "avatar": "👤"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

#### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### Test Videos

#### 1. Get All Videos

```bash
curl http://localhost:5000/api/videos
```

#### 2. Search Videos

```bash
curl "http://localhost:5000/api/videos/search?query=javascript"
```

#### 3. Get By Category

```bash
curl "http://localhost:5000/api/videos/category/Coding"
```

#### 4. Create Video (require auth)

```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "title": "My First Video",
    "description": "This is my first video",
    "channel": "My Channel",
    "category": "Coding",
    "duration": 1200
  }'
```

### Test Protected Routes

#### 1. Get User Profile

```bash
curl http://localhost:5000/api/users/USER_ID
```

#### 2. Add to Watchlist (require auth)

```bash
curl -X POST http://localhost:5000/api/users/USER_ID/watchlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "videoId": "VIDEO_ID"
  }'
```

#### 3. Like Video (require auth)

```bash
curl -X PATCH http://localhost:5000/api/videos/VIDEO_ID/like \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## Using Postman (Recommended for Testing)

### Step 1: Import Collection

1. Open Postman
2. Create new Collection "StreamHub API"
3. Add requests:

#### Login Request
```
Method: POST
URL: http://localhost:5000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Videos Request
```
Method: GET
URL: http://localhost:5000/api/videos
```

#### Create Video Request (with auth)
```
Method: POST
URL: http://localhost:5000/api/videos
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{accessToken}}
Body:
{
  "title": "New Video",
  "description": "Test video",
  "channel": "Test Channel",
  "category": "Coding",
  "duration": 1200
}
```

### Step 2: Setup Variables

1. In Postman, click "Manage Environments"
2. Create new environment "StreamHub"
3. Add variables:
   - `baseUrl` = http://localhost:5000
   - `accessToken` = (copy from login response)
   - `userId` = (copy from user profile)

### Step 3: Use Variables in Requests

```
{{baseUrl}}/api/videos
Authorization: Bearer {{accessToken}}
```

---

## Troubleshooting

### Problem: MongoDB Connection Error

**Error:**
```
Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Check MongoDB server running:
   ```bash
   mongosh    # If connected, MongoDB is running
   ```
2. Start MongoDB if not running:
   ```bash
   mongod     # Linux/Mac
   # Or: net start MongoDB (Windows)
   ```
3. Check `MONGODB_URI` di `.env` correct

### Problem: Port 5000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
1. Kill process using port 5000:
   ```bash
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
2. Or change PORT di `.env`:
   ```
   PORT=5001
   ```

### Problem: CORS Error from Frontend

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/videos' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Check `CORS_ORIGIN` di `.env`:
   ```bash
   CORS_ORIGIN=http://localhost:5173
   ```
2. Restart server setelah update `.env`
3. Frontend harus call correct URL:
   ```javascript
   fetch('http://localhost:5000/api/videos')  // ✅ Correct
   fetch('localhost:5000/api/videos')         // ❌ Wrong (missing http://)
   ```

### Problem: JWT Token Expired

**Error:**
```json
{
  "success": false,
  "message": "Token sudah expired"
}
```

**Solution:**
1. Get new token with refresh endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "YOUR_REFRESH_TOKEN"
     }'
   ```
2. Use new accessToken untuk next requests

### Problem: Seed Script Error

**Error:**
```
Error: Collection already exists
```

**Solution:**
```bash
# Force reset database
npm run seed -- --force
```

### Problem: Cannot find module 'mongoose'

**Error:**
```
Cannot find module 'mongoose'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Tips

### 1. Database Indexing
Indices sudah setup otomatis saat app start:
- `category` - Untuk filter by category
- `title`, `tags`, `description` - Untuk text search

### 2. Pagination
Always use pagination untuk large datasets:
```bash
curl "http://localhost:5000/api/videos?page=1&limit=12"
```

### 3. Connection Pooling
MongoDB connection pool already configured (10 connections):
```javascript
// In mongoConnect.js
maxPoolSize: 10,
minPoolSize: 2
```

---

## Next Steps

Setelah backend berjalan:

1. **Connect Frontend to Backend**
   - Update React components untuk call API instead of mock data
   - Implement JWT token storage di localStorage
   - Add context/reducer untuk auth state management

2. **Implement Frontend Authentication**
   - Login/Register pages
   - Token refresh logic
   - Protected routes

3. **Test Complete Flow**
   - User registers → Login → Add to watchlist → Like video
   - User subscribes to channel
   - Video creator uploads new video

4. **Deploy**
   - Backend → Heroku/Railway/Render
   - Frontend → Vercel/Netlify
   - MongoDB Atlas (already cloud)

---

## Useful Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Introduction](https://jwt.io/introduction)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Support

Jika ada error atau pertanyaan:

1. Check error message di server console (terminal)
2. Check `.env` configuration
3. Verify MongoDB running
4. Check API endpoint di postman
5. See Troubleshooting section

Happy coding! 🚀
