# Project Structure

## Folder layout

```
seafood-qms/
│
├── client/                    # Frontend (React + Vite)
│   ├── src/                   # Source code
│   │   ├── components/        # React components (+ dashboard/ subfolder)
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Shared data-fetching hooks
│   │   ├── pages/             # Page components (lazy-loaded)
│   │   ├── services/          # API services
│   │   ├── utils/             # labels.ts - shared labels, colors, and icons
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── dist/                  # Build output after the build step
│   ├── index.html             # HTML entry
│   ├── .env                   # VITE_API_URL
│   ├── package.json           # Client dependencies
│   ├── vite.config.ts         # Vite configuration + dev API proxy
│   └── tsconfig.json          # TypeScript config
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/                   # Source code
│   │   └── index.ts           # Main server file
│   ├── dist/                  # Compiled JavaScript output after build
│   ├── .env                   # PORT, JWT_SECRET, DB_PATH, CLIENT_URL
│   ├── package.json           # Server dependencies
│   └── tsconfig.json          # TypeScript config
│
├── package.json               # Root orchestration
├── README.md                  # Main documentation
└── seafood_qms.db             # SQLite database (created automatically)
```

---

## Running the app

### 1. Initial install

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

---

### 2. Development

Terminal 1 - Backend:
```bash
npm run dev:server
# or
cd server && npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev:client
# or
cd client && npm run dev
```

Result:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

---

### 3. Production build

```bash
# Build everything
npm run build

# or manually:
npm run build:client    # Frontend to client/dist/
npm run build:server    # Backend to server/dist/

# Start the backend (it serves the frontend from client/dist/)
npm start
# or
cd server && npm start
```

Result:
- The app is available on `http://localhost:3001`
- The backend serves the frontend from `client/dist/`

---

## Available commands

### Root commands
```bash
npm run dev              # Start frontend + backend together
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

npm run build            # Build everything
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

npm start                # Start backend (serves the frontend)

npm run install:all      # Install all dependencies
```

### Client commands
```bash
cd client
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview the build
```

### Server commands
```bash
cd server
npm run dev              # Start backend in watch mode
npm run build            # Compile TypeScript to JavaScript
npm start                # Start the compiled server
```

---

## Detailed structure

### Frontend (`client/`)

Technologies:
- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts (charts, lazy-loaded)
- jsPDF (PDF export, lazy-loaded)

There is no router library (`react-router-dom` is not used). Navigation is handled by simple React state in `App.tsx` and each page is loaded lazily.

Structure:
```
client/src/
├── components/
│   ├── Layout.tsx           # Responsive sidebar with role-based navigation
│   ├── ErrorBoundary.tsx
│   └── dashboard/
│       ├── DashboardCharts.tsx         # Charts (lazy-loaded from Dashboard.tsx)
│       └── DashboardChartsSkeleton.tsx # Loading placeholder
├── contexts/            # State management
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── hooks/
│   ├── useBranches.ts   # Loads branches + branch lookup function
│   └── useUsers.ts      # Loads users + user lookup function
├── pages/               # Each page is lazy-loaded from App.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── ReportIssue.tsx
│   ├── IssuesList.tsx
│   ├── Reports.tsx
│   ├── Branches.tsx
│   └── Staff.tsx
├── services/            # API calls
│   └── apiClient.ts
├── utils/
│   └── labels.ts        # Labels, colors, icons, and status mappings
├── types/               # TypeScript types (Issue, Branch, User, PageId, ...)
│   └── index.ts
├── App.tsx              # Main component + lazy() page imports
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

### Backend (`server/`)

Technologies:
- Express.js 5
- TypeScript
- better-sqlite3
- JWT
- bcryptjs
- dotenv
- Helmet
- CORS
- Rate limiting

Structure:
```
server/src/
├── index.ts              # App bootstrap: middleware, route mounting, static serving, startup
├── config/
│   └── index.ts          # PORT, JWT_SECRET, DB_PATH, CLIENT_DIST_PATH, ... from .env
├── db/
│   ├── index.ts          # Database connection + initDB() (schema + indexes)
│   └── seed.ts           # seedInitialData() - demo data on first startup
├── middleware/
│   └── auth.ts           # authenticateToken, requireRole, request extension
├── routes/
│   ├── auth.routes.ts    # POST /api/auth/login
│   ├── issues.routes.ts  # GET/POST/PUT/DELETE /api/issues (DELETE protected by requireRole)
│   ├── branches.routes.ts# GET /api/branches
│   ├── users.routes.ts   # GET /api/users, /api/users/:id
│   ├── stats.routes.ts   # GET /api/stats/issues
│   └── health.routes.ts  # GET /api/health
└── utils/
    └── mapIssueRow.ts    # Converts snake_case (DB) to camelCase (API response)
```

```

> **ملحوظة ESM مهمة:** المشروع `"type": "module"`، فكل استيراد نسبي بين الملفات لازم يكون بامتداد `.js` صريح (`from '../db/index.js'`)، مش `from '../db'` - Node's native ESM resolver (على عكس bundler زي Vite) مبيحلّش الفولدرات لملف `index.js` تلقائيًا.

---

## 🔄 Data Flow

### Development:
```
Browser (localhost:5173)
    ↓
Vite Dev Server
    ↓
React App
    ↓
API Calls → /api/*  (مسار نسبي، من VITE_API_URL)
    ↓
Vite proxy (vite.config.ts) → http://localhost:3001
    ↓
Express Server (localhost:3001)
    ↓
SQLite Database
```

### Production:
```
Browser (localhost:3001)
    ↓
Express Server
    ├── /api/* → API Endpoints
    └── /* → Static Files (client/dist/)
    ↓
SQLite Database
```

---

## 🔐 الأمان

### في الإنتاج:
- ✅ البيانات على السيرفر (مش في المتصفح)
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Protection
- ✅ Server-side Validation

---

## 📊 مقارنة قبل وبعد

### قبل (كل حاجة في root):
```
❌ Frontend و Backend مخلوطين
❌ صعوبة في الصيانة
❌ صعوبة في الـ deployment
❌ مش واضح إيه Frontend وإيه Backend
```

### بعد (فصل كامل):
```
✅ Frontend في client/
✅ Backend في server/
✅ سهل الصيانة
✅ سهل الـ deployment
✅ واضح ومنظم
✅ قابل للتوسع
```

---

## 🎯 الخلاصة

### البنية الجديدة:
- ✅ **client/** - Frontend كامل (React + Vite)
- ✅ **server/** - Backend كامل (Express + TypeScript)
- ✅ **Root** - Orchestration فقط
- ✅ **Production** - Backend يخدم Frontend من client/dist/

### المميزات:
- ✅ فصل واضح بين Frontend و Backend
- ✅ سهل الصيانة والتطوير
- ✅ سهل الـ deployment
- ✅ قابل للتوسع
- ✅ Production Ready

---

## 📞 الدعم

لو عندك أي مشكلة:
1. راجع الـ logs
2. تأكد إن الـ dependencies مثبتة
3. تأكد إن الـ ports مش مستخدمة
4. راجع التوثيق

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0

<div align="center">

**🏗️ Clean Separation = Clean Code! 🎉**

</div>
