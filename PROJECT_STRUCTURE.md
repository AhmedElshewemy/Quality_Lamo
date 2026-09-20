# 🏗️ بنية المشروع المنفصلة

## 📁 هيكل المجلدات

```
seafood-qms/
│
├── client/                    # Frontend (React + Vite)
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── validation/        # Validation schemas
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── dist/                  # Build output (بعد الـ build)
│   ├── index.html             # HTML entry
│   ├── package.json           # Client dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tsconfig.json          # TypeScript config
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/                   # Source code
│   │   └── index.ts           # Main server file
│   ├── dist/                  # Compiled JavaScript (بعد الـ build)
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
- Tailwind CSS
- React Router
- Recharts
- jsPDF

**الهيكل:**
```
client/src/
├── components/          # React components
│   ├── Layout.tsx
│   └── ErrorBoundary.tsx
├── contexts/            # State management
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── ReportIssue.tsx
│   ├── IssuesList.tsx
│   ├── Reports.tsx
│   ├── Branches.tsx
│   └── Staff.tsx
├── services/            # API calls
│   └── apiClient.ts
├── utils/               # Utilities
│   ├── logger.ts
│   ├── errorHandler.ts
│   ├── notifications.ts
│   ├── performance.ts
│   └── security.ts
├── types/               # TypeScript types
│   └── index.ts
├── validation/          # Validation schemas
│   └── schemas.ts
├── App.tsx              # Main component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

### Backend (server/)

**التقنيات:**
- Express.js
- TypeScript
- better-sqlite3
- JWT
- bcryptjs
- Helmet
- CORS
- Rate Limiting

**الهيكل:**
```
server/src/
└── index.ts             # Main server file
    ├── Configuration
    ├── Middleware (Helmet, CORS, Rate Limiting)
    ├── Database Setup (SQLite)
    ├── Authentication (JWT)
    ├── API Routes
    │   ├── Auth Routes
    │   ├── Issues Routes
    │   ├── Branches Routes
    │   ├── Users Routes
    │   └── Stats Routes
    ├── Static Files Serving (client/dist/)
    └── Error Handling
```

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
API Calls → http://localhost:3001/api/*
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
