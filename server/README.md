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
- **dotenv** - Environment variable loading

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./seafood_qms.db
CLIENT_URL=http://localhost:5173
```

Loaded via `import 'dotenv/config'` at the top of `src/index.ts` (must be the first import so every other module sees the values). Changes require a server restart to take effect.

## 📁 Structure

```
server/
├── src/
│   ├── index.ts             # App bootstrap: middleware, mount routes, static serving, start
│   ├── config/index.ts      # Env-derived config (PORT, JWT_SECRET, DB_PATH, ...)
│   ├── db/
│   │   ├── index.ts         # DB connection + initDB() (schema + indexes)
│   │   └── seed.ts          # seedInitialData()
│   ├── middleware/auth.ts   # authenticateToken, requireRole
│   ├── routes/              # One file per resource (auth, issues, branches, users, stats, health)
│   └── utils/mapIssueRow.ts # snake_case (DB) → camelCase (API) mapping
├── package.json
├── tsconfig.json
└── README.md
```

> **ESM note:** this package is `"type": "module"`. Every relative import between files must use an explicit `.js` extension (`from '../db/index.js'`), not `from '../db'` - Node's native ESM resolver, unlike a bundler, doesn't resolve a bare folder import to its `index.js`.

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
- `DELETE /api/issues/:id` - Delete issue (**admin / quality_manager only**, enforced by `requireRole` middleware)

> All issue responses go through `mapIssueRow()`, which converts SQLite's snake_case columns (`branch_id`, `reported_at`, ...) to the camelCase shape (`branchId`, `reportedAt`, ...) the client's `Issue` type expects. Any new query against the `issues` table must go through this helper to keep the API contract consistent.

### Branches
- `GET /api/branches` - Get all branches

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (**admin only**, enforced by `requireRole('admin')`)

### Stats
- `GET /api/stats/issues` - Get issue statistics

### Health
- `GET /api/health` - Health check

## 🚀 Production Setup

One-time script to wipe seeded demo users/issues and create exactly one real admin account (keeps the branches table - those are real restaurant locations, not demo data):

```bash
ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run reset-for-production -- --confirm
```

Requires `--confirm` to run at all. Full walkthrough in `AUTH_GUIDE.md` → "التجهيز للإنتاج".

## 🔒 Security

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Role-based access control (`requireRole`) on destructive endpoints
- JSON payload limit: 25mb (to accommodate a few base64-encoded issue photos)
- Input validation
- SQL injection prevention (parameterized queries)

## 🗄️ Database

SQLite database with automatic initialization and seeding.

---

**Part of Seafood QMS - Quality Management System**
