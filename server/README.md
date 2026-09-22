# 🖥️ Backend - Seafood QMS

Backend API server built with Express, TypeScript, and SQLite.

## 🛠️ Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite** - Database (better-sqlite3)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin support
- **Rate Limiting** - API protection

## 📁 Structure

```
server/
├── src/
│   └── index.ts        # Main server file
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server with watch mode
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔐 Authentication

- JWT tokens with 24h expiration
- Password hashing with bcrypt
- Token validation middleware

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` - Login

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Branches
- `GET /api/branches` - Get all branches

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Stats
- `GET /api/stats/issues` - Get issue statistics

### Health
- `GET /api/health` - Health check

## 🔒 Security

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation
- SQL injection prevention (parameterized queries)

## 🗄️ Database

SQLite database with automatic initialization and seeding.

---

**Part of Seafood QMS - Quality Management System**
