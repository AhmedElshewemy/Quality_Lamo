# Seafood QMS - Quality Management System

A complete quality management system built with a clear separation between the frontend and backend.

---

## Project structure

```
seafood-qms/
│
├── client/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # State management
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── dist/                  # Production build output
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── tsconfig.json          # TypeScript configuration
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/
│   │   └── index.ts           # Main server file
│   ├── dist/                  # Compiled JavaScript output
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── package.json               # Root scripts and orchestration
└── README.md                  # This file
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
# Start frontend and backend together
npm run dev

# Or run separately:
npm run dev:client    # Frontend at http://localhost:5173
npm run dev:server    # Backend at http://localhost:3001
```

### 3. Production build

```bash
# Build the project
npm run build

# Start the server (serves the frontend from client/dist/)
npm start
```

Result: everything is served on `http://localhost:3001`.

---

## Default login accounts

### Admin
```
Email: admin@seafood.com
Password: Admin@123456
```

### Quality Manager
```
Email: sara@seafood.com
Password: Manager@123
```

### Quality Engineer
```
Email: ahmed@seafood.com
Password: Engineer@123
```

---

## Environment variables

Each project section has its own `.env` file and they are intentionally separated and ignored by git.

### `server/.env`
```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./seafood_qms.db
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```bash
VITE_API_URL=/api
```

Why is `VITE_API_URL` relative instead of `http://localhost:3001/api`?
Because in production, Express serves the frontend itself, so an absolute URL is unnecessary. In development, `client/vite.config.ts` contains a proxy that redirects `/api` from `localhost:5173` (Vite) to `localhost:3001` (Express).

```ts
server: {
  proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
}
```

Important: Vite injects `VITE_*` variables at build time, not runtime. If you change `client/.env`, rerun `npm run build` in `client/` so the new value is applied.

Important: if you change `PORT` in `server/.env`, the server loads it via `dotenv` (`import 'dotenv/config'` at the top of `server/src/index.ts`). Restart the server for the new value to take effect.

---

## Roles and permissions

| Role | Can view | Can do |
|---|---|---|
| `quality_engineer` | Dashboard and their own data, report issue, own issues | Submit issues, resolve their own issues |
| `quality_manager` | All pages and all company data | Everything above, view/resolve all issues, delete issues |
| `admin` | Same privileges as `quality_manager` | Same as `quality_manager` |

At the server level, each endpoint requires a valid JWT token (`authenticateToken`). Deleting an issue (`DELETE /api/issues/:id`) is also protected by an additional middleware (`requireRole('admin', 'quality_manager')`). This means even if a quality engineer tries to call the API directly, the request is rejected with `403`.

---

### Frontend (`client/`)

```
client/src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout
│   └── ErrorBoundary.tsx # Error handling
│
├── contexts/            # Application state
│   ├── AuthContext.tsx  # Authentication
│   └── DataContext.tsx  # Shared data
│
├── pages/               # App pages
│   ├── Login.tsx        # Login page
│   ├── Dashboard.tsx    # Dashboard
│   ├── ReportIssue.tsx  # Report issue
│   ├── IssuesList.tsx   # Issues list
│   ├── Reports.tsx      # Reports
│   ├── Branches.tsx     # Branches
│   └── Staff.tsx        # Staff members
│
├── services/            # API calls
│   └── apiClient.ts     # API client
│
└── types/               # TypeScript definitions
    └── index.ts         # Shared types
```

### Backend (`server/`)

```
server/src/
└── index.ts             # Main server entry point
    ├── Security setup
    ├── Database (SQLite)
    ├── Authentication (JWT)
    ├── Routes
    │   ├── /api/auth/login
    │   ├── /api/issues
    │   ├── /api/branches
    │   ├── /api/users
    │   └── /api/stats
    └── Frontend serving
```

---

## API endpoints

### Authentication
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Issues
```
GET    /api/issues              # Get all issues
GET    /api/issues/:id          # Get one issue
POST   /api/issues              # Create issue
PUT    /api/issues/:id          # Update issue
DELETE /api/issues/:id          # Delete issue
```

### Branches
```
GET /api/branches               # Get all branches
```

### Users
```
GET /api/users                  # Get all users
GET /api/users/:id              # Get one user
```

### Statistics
```
GET /api/stats/issues           # Issue statistics
```

### Health
```
GET /api/health                 # Server health check
```

---

## Security

### Implemented

1. JWT authentication
   - Every request requires a token
   - Token is valid for 24 hours
   - Token is stored in `sessionStorage`

2. Password hashing
   - Passwords are not stored as plain text
   - `bcrypt` is used with salt rounds = 10

3. Rate limiting
   - 100 requests per 15 minutes
   - Protection from abuse and brute-force traffic

4. Security headers
   - Helmet adds security headers
   - Helps mitigate XSS, clickjacking, and related issues

5. CORS protection
   - Only the configured frontend origin is allowed
   - Prevents unauthorized cross-origin usage

6. Server-side validation
   - Input is checked on the server before storage
   - Helps prevent malformed data and injection issues

7. Role-based access control (RBAC)
   - Each user has a role: `quality_engineer`, `quality_manager`, or `admin`
   - `requireRole(...)` protects sensitive endpoints regardless of client-side UI state

8. **JSON Payload Limit**
   - `25mb` - كافي لكذا صورة (base64) في تقرير المشكلة الواحد، بدون فتح الباب لطلبات ضخمة غير منطقية

---

## 🎯 المميزات

### لمهندس الجودة:
- ✅ رفع المشاكل بالصور والتفاصيل
- ✅ تقييم المطابقة (مطابق / مطابق جزئياً / غير مطابق)
- ✅ متابعة المشاكل المسجلة
- ✅ تسجيل حلول المشاكل

### لمدير الجودة:
- 📊 لوحة تحكم شاملة مع تحليلات
- 📈 مقارنة الأداء (أسبوعي / شهري / ربع سنوي)
- 📋 تقارير PDF تفصيلية
- 🏢 متابعة أداء جميع الفروع
- 👥 إدارة فريق الجودة

---

## 🛠️ التقنيات المستخدمة

### Frontend:
- **React 18** - مكتبة UI
- **TypeScript** - Type safety
- **Vite** - Build tool سريع
- **Tailwind CSS 4** - Styling
- **Lucide React** - أيقونات
- **React Hot Toast** - إشعارات
- **Recharts** - الرسوم البيانية (لوحة التحكم والتقارير)
- **jsPDF + jspdf-autotable** - تصدير تقارير PDF

> **ملاحظة أداء:** `Recharts` و `jsPDF` مكتبات ثقيلة نسبيًا، فهي بتتحمّل بـ `React.lazy` بس وقت الحاجة الفعلية ليها (مش من أول تحميل للتطبيق) - راجع قسم "الأداء" تحت.

### Backend:
- **Express.js 5** - Web framework
- **TypeScript** - Type safety
- **SQLite (better-sqlite3)** - قاعدة بيانات
- **JWT** - مصادقة
- **bcrypt** - تشفير كلمات المرور
- **dotenv** - تحميل متغيرات البيئة من `.env`
- **Helmet** - أمان
- **CORS** - Cross-origin
- **Rate Limit** - حماية

---

## ⚡ الأداء (Performance)

- **Route-level code splitting:** كل صفحة (`Dashboard`, `Reports`, ...) بتتحمّل في ملف JS منفصل عن طريق `React.lazy`، فأول تحميل للتطبيق بعد تسجيل الدخول صغير نسبيًا.
- **تحميل مؤجل للمكتبات الثقيلة:** `jsPDF` (تصدير PDF) بيتحمّل بس لما المستخدم يدوس "تصدير PDF" في صفحة التقارير - مش قبل كده خالص.
- **فصل الرسوم البيانية عن باقي الداشبورد:** لوحة التحكم نفسها مقسومة لجزئين: جزء سريع (كروت الإحصائيات + جدول آخر المشاكل) يظهر فورًا، وجزء الرسوم البيانية (`Recharts`) يتحمّل في الخلفية بعد كده مع placeholder بسيط لحد ما يوصل - عشان المستخدم يشوف بيانات مفيدة بسرعة من غير ما ينتظر مكتبة الرسوم التقيلة.

---

## 📦 الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل Frontend + Backend
npm run dev:client       # Frontend فقط
npm run dev:server       # Backend فقط

# البناء
npm run build            # بناء كل شيء
npm run build:client     # Frontend فقط
npm run build:server     # Backend فقط

# الإنتاج
npm start                # تشغيل السيرفر

# التثبيت
npm install              # تثبيت كل التبعيات
```

---

## 🔄 تدفق البيانات

### التطوير:
```
Browser (localhost:5173)
    ↓
Vite Dev Server
    ↓
React App
    ↓
API Calls → /api/*  (مسار نسبي)
    ↓
Vite proxy (vite.config.ts) يحوّلها لـ→ http://localhost:3001
    ↓
Express Server
    ↓
SQLite Database
```

### الإنتاج:
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

## 📊 قاعدة البيانات

### الجداول:

#### users
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- role (TEXT)
- branch_id (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### branches
```sql
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- location (TEXT)
- type (TEXT)             -- 'branch' | 'central_kitchen_warehouse'
- created_at (DATETIME)
- updated_at (DATETIME)
```

**المواقع الحقيقية المسجّلة (4 مواقع):**
| الاسم | النوع |
|---|---|
| فرع المعادي | `branch` |
| فرع مدينة نصر | `branch` |
| فرع التجمع الخامس | `branch` |
| المطبخ المركزي والمخزن الرئيسي | `central_kitchen_warehouse` (مكان واحد بوظيفتين) |

#### issues
```sql
- id (TEXT, PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- branch_id (TEXT, FOREIGN KEY)
- category (TEXT)
- priority (TEXT)
- status (TEXT)
- compliance_status (TEXT)
- images (TEXT - JSON)
- reported_by (TEXT, FOREIGN KEY)
- reported_at (DATETIME)
- resolved_at (DATETIME)
- resolution_notes (TEXT)
- assigned_to (TEXT, FOREIGN KEY)
- follow_up_date (DATETIME)
- created_at (DATETIME)
- updated_at (DATETIME)
```

---

## 🎨 أمثلة على الاستخدام

### إضافة مشكلة جديدة:

```typescript
// في Frontend
const { addIssue } = useData();

await addIssue({
  title: 'ارتفاع درجة الحرارة',
  description: 'الثلاجة الرئيسية تعمل بدرجة حرارة عالية',
  branchId: 'branch-1',
  category: 'temperature',
  priority: 'critical',
  complianceStatus: 'non_compliant',
  images: [],
  reportedBy: 'user-1',
  reportedAt: new Date().toISOString(),
});
```

### تسجيل الدخول:

```typescript
// في Frontend
const { login } = useAuth();

const success = await login('admin@seafood.com', 'Admin@123456');
if (success) {
  // تم تسجيل الدخول بنجاح
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "البريد الإلكتروني أو كلمة المرور غير صحيحة" مع إن البيانات صحيحة

**السبب الأشهر:** `client/.env` بيتحقن وقت الـ **build**، فلو غيّرت `VITE_API_URL` أو `PORT` بتاع السيرفر بعد ما بنيت الفرونت إند، الملف القديم في `client/dist` لسه بيبعت الطلبات للبورت/المسار القديم.

**الحل:**
```bash
cd client
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### المشكلة: غيّرت `PORT` في `server/.env` ومحصلش تغيير

**الحل:** لازم تعيد تشغيل السيرفر بعد أي تعديل في `.env` (`dotenv` بيقرأ الملف مرة واحدة بس وقت الإقلاع):
```bash
cd server
npm run dev   # أو npm start بعد build
```

### المشكلة: `PathError: Missing parameter name at index 1: *`

**السبب:** Express 5 (المستخدم هنا) بيعتمد على `path-to-regexp` v7 اللي بطّلت تدعم `app.get('*', ...)` كصيغة wildcard. الكود هنا مستخدم الصيغة الصحيحة بالفعل (`app.get('/*splat', ...)`) - الخطأ ده يظهر بس لو حد رجّع الصيغة القديمة أثناء تعديل الكود.

### المشكلة: Frontend مش بيتصل بالـ Backend

**الحل:**
```bash
# تأكد إن Backend شغال
curl http://localhost:3001/api/health

# لازم يرجع:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### المشكلة: مفيش dist folder

**الحل:**
```bash
# اعمل build
npm run build
```

### المشكلة: الـ Backend مش شغال

**الحل:**
```bash
# شغل Backend
npm run dev:server

# أو في الإنتاج
npm start
```

---

## 📝 ملاحظات مهمة

### للفصل بين Frontend و Backend:

✅ **مفيد للتنظيم** - كود أنظف  
✅ **مفيد للصيانة** - أسهل في التطوير  
✅ **مفيد للـ deployment** - أسهل في النشر  
✅ **مفيد للأمان** - فصل واضح للمسؤوليات  

### للإنتاج:

1. ✅ غيّر كلمات المرور الافتراضية
2. ✅ غيّر JWT_SECRET في الـ environment variables
3. ✅ فعّل HTTPS
4. ✅ استخدم قاعدة بيانات حقيقية (PostgreSQL/MySQL)
5. ✅ أضف backup تلقائي
6. ✅ فعّل monitoring

---

## 📚 التوثيق

- **[client/README.md](./client/README.md)** - دليل Frontend
- **[server/README.md](./server/README.md)** - دليل Backend

---

## 🎯 الخلاصة

### النظام دلوقتي:
- ✅ **آمن** - Backend حقيقي + JWT
- ✅ **Production Ready** - جاهز للإنتاج
- ✅ **Scalable** - قابل للتوسع
- ✅ **Maintainable** - سهل الصيانة
- ✅ **Well Documented** - موثق بشكل شامل

### البنية:
- ✅ **client/** - Frontend كامل
- ✅ **server/** - Backend كامل
- ✅ **فصل واضح** - كل حاجة في مكانها
- ✅ **سهل التشغيل** - أمر واحد `npm start`

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

**🎉 Production Ready! 🚀**

Made with ❤️ and Best Practices

</div>
