# 🐟 Seafood QMS - Quality Management System

نظام إدارة جودة شامل لمطعم سي فود مع فصل كامل بين Frontend و Backend.

## 🏗️ Architecture

```
seafood-qms/
├── client/          # Frontend (React + TypeScript + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── server/          # Backend (Express + TypeScript + SQLite)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── package.json     # Root orchestration
```

## ✨ Features

### Frontend
- ✅ React 18 with TypeScript
- ✅ Tailwind CSS with RTL support
- ✅ JWT Authentication
- ✅ API Client with token management
- ✅ Error Boundaries
- ✅ Toast Notifications

### Backend
- ✅ Express.js with TypeScript
- ✅ SQLite Database
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Protection

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:client    # Frontend on http://localhost:5173
npm run dev:server    # Backend on http://localhost:3001
```

### 3. Production Mode

```bash
# Build both frontend and backend
npm run build

# Start production server (serves frontend from client/dist/)
npm start

# Access at http://localhost:3001
```

## 🔐 Default Credentials

### 👑 Admin
- Email: `admin@seafood.com`
- Password: `Admin@123456`

### 📊 Quality Manager
- Email: `sara@seafood.com`
- Password: `Manager@123`

### 🔧 Quality Engineer
- Email: `ahmed@seafood.com`
- Password: `Engineer@123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Branches
- `GET /api/branches` - Get all branches

### Users
- `GET /api/users` - Get all users

### Statistics
- `GET /api/stats/issues` - Get issue statistics

### Health
- `GET /api/health` - Health check

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting (100 req/15min)
- ✅ Security Headers (Helmet)
- ✅ CORS Protection
- ✅ SQL Injection Prevention
- ✅ Input Validation

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

# Build
npm run build            # Build both frontend and backend
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Production
npm start                # Start production server

# Installation
npm run install:all      # Install all dependencies
```

## 🗂️ Project Structure

### Client (Frontend)
```
client/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth, Data)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app
│   └── main.tsx        # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Server (Backend)
```
server/
├── src/
│   └── index.ts        # Main server file
├── package.json
└── tsconfig.json
```

## 🔄 Data Flow

### Development
```
Browser (localhost:5173)
    ↓
Vite Dev Server
    ↓
React App
    ↓
API Calls → http://localhost:3001/api/*
    ↓
Express Server
    ↓
SQLite Database
```

### Production
```
Browser (localhost:3001)
    ↓
Express Server
    ├── /api/* → API Endpoints
    └── /* → Static Files (client/dist/)
    ↓
SQLite Database
```

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (Icons)
- React Hot Toast

### Backend
- Express.js
- TypeScript
- SQLite (better-sqlite3)
- JWT
- bcrypt
- Helmet
- CORS
- Express Rate Limit

## 📝 Documentation

- [Client README](./client/README.md)
- [Server README](./server/README.md)

## 🎯 Benefits of Separation

✅ **Clean Organization** - Clear separation of concerns  
✅ **Easy Maintenance** - Independent development  
✅ **Easy Deployment** - Separate deployment options  
✅ **Scalability** - Scale frontend and backend independently  
✅ **Team Collaboration** - Different teams can work on frontend/backend  

## 🔐 Security

The system is production-ready with:
- Backend validates all requests
- JWT tokens for authentication
- Passwords are hashed (never stored in plain text)
- Rate limiting prevents abuse
- Security headers protect against common attacks
- CORS configured properly

## 📄 License

MIT

---

**Built with ❤️ for Seafood Restaurant Quality Management**
