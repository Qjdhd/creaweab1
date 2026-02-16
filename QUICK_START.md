# 🚀 Quick Start Guide - Run Frontend + Backend (SIMPLIFIED)

## ⏱️ 5 Minute Setup

### TERMINAL 1: Backend Setup
```bash
# Step 1: Navigate to backend folder
cd backend

# Step 2: Install dependencies (first time only)
npm install

# Step 3: Create .env file (copy from .env.example)
cp .env.example .env

# Step 4: Populate database (first time only)
npm run seed

# Step 5: Start backend server
npm run dev
```

**Expected Output:**
```
✅ Server running on http://localhost:5000
📡 Connected to MongoDB
```

---

### TERMINAL 2: Frontend Setup (After Backend Ready)
```bash
# Step 1: Go back to root folder
cd ..

# Step 2: Install dependencies (first time only)
npm install

# Step 3: Start frontend development server
npm run dev
```

**Expected Output:**
```
VITE ready in 1234 ms
➜  Local:   http://localhost:5173/
```

---

## ✅ Verify Everything Running

### Check 1: Backend Health
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"OK"}`

### Check 2: Frontend Accessible
Open browser: http://localhost:5173
Expected: StreamHub website loads

### Check 3: Frontend Can Connect to Backend
Open DevTools (F12) → Console
Expected: No CORS or connection errors

---

## 🔐 Test Login

### Test Account (from database seed)
```
Email: john@example.com
Password: password123
```

Or use admin:
```
Email: admin@example.com
Password: admin123456
```

---

## 📱 What Backend Endpoints Are Available?

```
PUBLIC ENDPOINTS (no login needed):
├── GET  /api/videos              - Get all videos
├── GET  /api/videos/:id          - Get video detail
├── GET  /api/videos/search       - Search videos
├── GET  /api/videos/category/:cat - Filter by category
├── GET  /api/users/:userId       - Get user profile
└── POST /api/auth/register       - Create new account

PROTECTED ENDPOINTS (login required):
├── POST /api/auth/login          - Login user
├── POST /api/videos              - Create video (creator only)
├── POST /api/users/:userId/watchlist - Add to watchlist
├── PATCH /api/videos/:id/like    - Like video
├── PUT  /api/videos/:id          - Update video
└── PATCH /api/videos/:id/view    - Increment views
```

---

## 🧪 Quick Test (Without Frontend)

Test backend dengan Postman atau curl:

### Test 1: Get All Videos
```bash
curl http://localhost:5000/api/videos
```

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response akan include `accessToken` dan `refreshToken`

### Test 3: Create Video (dengan token)
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My Video",
    "description": "Test video",
    "channel": "Test Channel",
    "category": "Coding",
    "duration": 1200,
    "uploadedBy": "USER_ID"
  }'
```

---

## ❌ Troubleshooting

### Problem: Backend won't start
```
Error: EADDRINUSE :::5000
```
**Solution:** Port 5000 sudah dipakai
```bash
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

---

### Problem: MongoDB connection error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** MongoDB not running
```bash
# Start MongoDB
mongod

# Or verify it's running
mongosh
```

---

### Problem: Frontend shows CORS error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Check `.env` file
```bash
# In backend/.env, verify:
CORS_ORIGIN=http://localhost:5173
```
Then restart backend

---

### Problem: Frontend can't reach backend
```
Failed to fetch http://localhost:5000/api/videos
```
**Solution:** Make sure backend is running
```bash
# Check backend running
curl http://localhost:5000/health

# Check correct API URL in frontend code
# Should be: http://localhost:5000
```

---

## 🎬 Video Data Available

After running seed script, database has:

**Test Videos:**
- "Learn JavaScript Basics" (Coding) - 1250 views
- "Web Design Principles" (Design) - 890 views
- "Digital Marketing 101" (Marketing) - 650 views
- "Business Strategy" (Business) - 1100 views
- "Web Development Advanced" (Tutorial) - 2100 views
- "Gaming Setup Guide" (Gaming) - 750 views
- 2 more videos...

**Test Users:**
- john@example.com (Creator, has 2 videos)
- sarah@example.com (Designer/Creator, 1 video)
- mike@example.com (Student, 0 videos)
- admin@example.com (Admin, 0 videos)

---

## 📝 Important Ports

```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
MongoDB:   localhost:27017 (internal)
```

If ports conflict, update:
- Frontend: `vite.config.js`
- Backend: `.env` (PORT=5001)

---

## 🔄 API Request Flow

```
Browser (http://localhost:5173)
    ↓ fetch() dengan Authorization header
Backend (http://localhost:5000)
    ├── Check JWT token (middleware)
    ├── Process request (controller)
    └── Query database (Mongoose)
        ↓
    MongoDB (localhost:27017)
    ↓
Response JSON kembali ke Frontend
```

---

## 💾 Database Persistence

All data disimpan di MongoDB:
- Videos: Permanent (sampai di-delete)
- Users: Permanent (sampai di-delete)
- Watchlist: Temporary (clear saat reset)

Reset database:
```bash
npm run seed -- --force
```

---

## 📊 Checking Database

```bash
# Connect to MongoDB
mongosh

# Select database
use streamhub

# Count documents
db.videos.countDocuments()
db.users.countDocuments()

# See sample video
db.videos.findOne()

# See sample user (password will be hashed)
db.users.findOne()
```

---

## 🚀 Success Indicators

✅ Both terminals showing:
- Backend: `Server running on http://localhost:5000`
- Frontend: `ready in X ms`

✅ Browser shows:
- Videos loading from database
- No CORS/connection errors in console

✅ Can login with:
- john@example.com / password123

✅ API requests visible in DevTools → Network tab

---

## 📚 Next Steps

After setup works:

1. **Update React Components** to use real API
   - Fetch videos instead of mock data
   - Implement login/logout
   - Add to watchlist functionality

2. **Add Auth Context** for state management
   - Store token in localStorage
   - Handle token refresh
   - Redirect to login if not authenticated

3. **Test Full Workflow**
   - Login → Browse videos → Add watchlist → Like video
   - Register new user → Create video

---

## 🎯 Checklist Before Starting

- [ ] Node.js installed (v16+)
- [ ] MongoDB installed or Atlas account
- [ ] 2 terminal windows ready
- [ ] Backend folder has package.json
- [ ] Frontend root folder has package.json
- [ ] Positive attitude ✨

---

## 💡 Pro Tips

1. **Keep terminals open** while developing
   - Backend terminal: see API logs
   - Frontend terminal: see build errors

2. **Use Postman** for testing API
   - Test endpoints without frontend
   - Save favorite requests

3. **Monitor Network tab** (DevTools)
   - See all API calls
   - Check response status
   - View error messages

4. **Check MongoDB directly**
   ```bash
   mongosh
   use streamhub
   db.videos.find().pretty()
   ```

---

## 🆘 Still Having Issues?

1. **Read error message carefully** (usually tells you what's wrong)
2. **Check all 3 components running:**
   - MongoDB (mongod)
   - Backend (npm run dev)
   - Frontend (npm run dev)
3. **Verify ports:** 27017, 5000, 5173
4. **Clear cache:** Ctrl+Shift+Delete (browser), localStorage.clear()
5. **Restart everything** (nuclear option that usually works)

---

## 📖 Full Documentation

For detailed guides, see:
- `SETUP_GUIDE.md` - Backend detailed setup
- `FRONTEND_BACKEND_INTEGRATION.md` - Complete integration guide
- `README.md` - API documentation
- `BACKEND_IMPLEMENTATION_SUMMARY.md` - Architecture overview

---

**Status: Ready to Code!** 🎉

Run both servers and start building! 
