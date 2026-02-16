# 🎬 StreamHub CRUD Management Interface

## Akses Interface

**URL:** `http://localhost:5000`

Interface ini memungkinkan Anda untuk test **CRUD operations** untuk Users dan Videos secara real-time.

---

## 📋 Features

### 👥 **User Management**

**Create User**
- Form untuk membuat user baru
- Fields: Name, Email, Password, Avatar, Bio, Email Verification
- Response: User ID dan email confirmation

**View All Users**
- List semua users dalam database
- Stats: Total users, Verified users
- Actions: Delete user

### 🎬 **Video Management**

**Create Video**
- Form untuk membuat video baru
- Fields: Title, Description, Channel, Category, Duration
- Auto-fill: Thumbnail, VideoUrl, Tags

**View All Videos**
- List semua videos dalam database
- Stats: Total videos, Published videos
- Actions: Delete video

---

## 🧪 Test Workflow

### 1. **Create Test Data**
```
1. Buka http://localhost:5000
2. Tab "Create User" → Isi form → Click "Create User"
3. Tab "Create Video" → Isi form → Click "Create Video"
```

### 2. **View Data**
```
1. Tab "View Users" → Click "Refresh List" → Lihat semua users
2. Tab "View Videos" → Click "Refresh List" → Lihat semua videos
```

### 3. **Delete Data**
```
1. Di list users/videos → Click "Delete" button
2. Confirm dialog → Data dihapus
```

---

## 📡 API Endpoints (Backend)

### Users
```
GET    /api/users              - List all users
GET    /api/users/:userId      - Get user profile
POST   /api/users              - Create user
PUT    /api/users/:userId      - Update user
DELETE /api/users/:userId      - Delete user
```

### Videos
```
GET    /api/videos             - List all videos
GET    /api/videos/:id         - Get video detail
POST   /api/videos             - Create video
PUT    /api/videos/:id         - Update video
DELETE /api/videos/:id         - Delete video
```

---

## 🎨 UI Design

- **Responsive**: Works on desktop & mobile
- **Tabs**: Switch between Create & View operations
- **Real-time**: See changes immediately
- **Stats**: Shows total count & metrics
- **Error Handling**: Clear error messages
- **Loading States**: Visual feedback during operations

---

## 🚀 Quick Start

1. **Start Backend**
   ```bash
   npm run dev
   ```

2. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

3. **Open CRUD Interface**
   ```
   http://localhost:5000
   ```

4. **Start Testing**
   - Create users & videos
   - View lists with stats
   - Delete test data

---

## 📝 Notes

- CORS enabled untuk development
- Password hashing dengan bcrypt otomatis
- Email validation included
- Category enum validation
- Timestamp auto-generated (createdAt, updatedAt)

---

## 🛠️ Troubleshooting

**"Failed to connect to API"**
- Pastikan backend server running (`npm run dev`)
- Check MONGODB_URI di .env file
- Pastikan MongoDB service running

**"Failed to create user"**
- Email sudah terdaftar (harus unique)
- Password minimal 6 karakter
- Name minimal 2 karakter

**"Failed to create video"**
- Description minimal 10 karakter
- Title minimal 5 karakter
- Category harus valid (Coding, Design, etc)

---

## 📚 More Info

- Backend: `/src` folder
- Models: `/src/models/User.js`, `/src/models/Video.js`
- Controllers: `/src/controllers/`
- Routes: `/src/routes/`
- Database: MongoDB (sebagai specified di .env)
