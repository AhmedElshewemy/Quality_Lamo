# 🏗️ بنية المشروع المنفصلة

## 📁 هيكل المجلدات

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
│   │   ├── utils/             # labels.ts - shared labels/colors/icons
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── dist/                  # Build output (بعد الـ build)
│   ├── index.html             # HTML entry
│   ├── .env                   # VITE_API_URL
│   ├── package.json           # Client dependencies
│   ├── vite.config.ts         # Vite configuration + dev API proxy
│   └── tsconfig.json          # TypeScript config
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/                   # Source code
│   │   └── index.ts           # Main server file
│   ├── dist/                  # Compiled JavaScript (بعد الـ build)
│   ├── .env                   # PORT, JWT_SECRET, DB_PATH, CLIENT_URL
│   ├── package.json           # Server dependencies
│   └── tsconfig.json          # TypeScript config
│
├── package.json               # Root orchestration
├── README.md                  # Main documentation
└── seafood_qms.db             # SQLite database (يتم إنشاؤه تلقائياً)
```

---

## 🚀 التشغيل

### 1️⃣ التثبيت الأولي

```bash
# تثبيت كل الـ dependencies
npm run install:all

# أو يدوياً:
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

---

### 2️⃣ التطوير (Development)

**Terminal 1 - Backend:**
```bash
npm run dev:server
# أو
cd server && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:client
# أو
cd client && npm run dev
```

**النتيجة:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

---

### 3️⃣ الإنتاج (Production)

```bash
# Build كل حاجة
npm run build

# أو يدوياً:
npm run build:client    # Build Frontend → client/dist/
npm run build:server    # Build Backend → server/dist/

# تشغيل الـ Backend (يخدم الـ Frontend من client/dist/)
npm start
# أو
cd server && npm start
```

**النتيجة:**
- كل حاجة على: `http://localhost:3001`
- الـ Backend يخدم الـ Frontend من `client/dist/`

---

## 📦 الأوامر المتاحة

### Root Commands:
```bash
npm run dev              # تشغيل Frontend + Backend معاً
npm run dev:client       # تشغيل Frontend فقط
npm run dev:server       # تشغيل Backend فقط

npm run build            # Build كل حاجة
npm run build:client     # Build Frontend فقط
npm run build:server     # Build Backend فقط

npm start                # تشغيل Backend (يخدم Frontend)

npm run install:all      # تثبيت كل الـ dependencies
```

### Client Commands:
```bash
cd client
npm run dev              # تشغيل Vite dev server
npm run build            # Build للإنتاج
npm run preview          # معاينة الـ build
```

### Server Commands:
```bash
cd server
npm run dev              # تشغيل Backend مع watch mode
npm run build            # Compile TypeScript → JavaScript
npm start                # تشغيل الـ compiled server
```

---

## 🔧 البنية التفصيلية

### Frontend (client/)

**التقنيات:**
- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts (charts - lazy-loaded)
- jsPDF (PDF export - lazy-loaded)

> لا يوجد router library (`react-router-dom` مش مستخدم) - التنقل بين الصفحات بـ React state بسيط (`currentPage` في `App.tsx`) وكل صفحة `React.lazy`-loaded.

**الهيكل:**
```
client/src/
├── components/
│   ├── Layout.tsx           # سايدبار متجاوب (drawer على الموبايل) + قائمة حسب الدور
│   ├── ErrorBoundary.tsx
│   └── dashboard/
│       ├── DashboardCharts.tsx         # الرسوم البيانية (lazy-loaded من Dashboard.tsx)
│       └── DashboardChartsSkeleton.tsx # placeholder وقت تحميل الرسوم
├── contexts/            # State management
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── hooks/
│   ├── useBranches.ts   # تحميل الفروع + branchName() لookup
│   └── useUsers.ts      # تحميل المستخدمين + userName() lookup
├── pages/               # كل صفحة lazy-loaded من App.tsx
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
│   └── labels.ts        # كل التسميات/الألوان/الأيقونات (حالة، أولوية، فئة، مطابقة، نوع فرع، دور) - مصدر واحد
├── types/               # TypeScript types (Issue, Branch, User, PageId, ...)
│   └── index.ts
├── App.tsx              # Main component + lazy() imports للصفحات
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

### Backend (server/)

**التقنيات:**
- Express.js 5
- TypeScript
- better-sqlite3
- JWT
- bcryptjs
- dotenv
- Helmet
- CORS
- Rate Limiting

**الهيكل:**
```
server/src/
├── index.ts              # App bootstrap: middleware, mount routes, static serving, start
├── config/
│   └── index.ts           # PORT, JWT_SECRET, DB_PATH, CLIENT_DIST_PATH, ... (من .env)
├── db/
│   ├── index.ts           # Database connection + initDB() (تعريف الجداول والـ indexes)
│   └── seed.ts             # seedInitialData() - بيانات تجريبية أول تشغيل
├── middleware/
│   └── auth.ts             # authenticateToken, requireRole، وتوسيع Express.Request
├── routes/
│   ├── auth.routes.ts      # POST /api/auth/login
│   ├── issues.routes.ts    # GET/POST/PUT/DELETE /api/issues (DELETE محمي بـ requireRole)
│   ├── branches.routes.ts  # GET /api/branches
│   ├── users.routes.ts     # GET /api/users, /api/users/:id
│   ├── stats.routes.ts     # GET /api/stats/issues
│   └── health.routes.ts    # GET /api/health
└── utils/
    └── mapIssueRow.ts       # تحويل snake_case (DB) → camelCase (API response)
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
