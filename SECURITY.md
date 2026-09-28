# Security and Data Protection

## Security issue in the original v1 version (pre-backend)

> This section is historical. It describes the first version of the app, which stored everything in the browser `localStorage` without a real backend. The current system is the fully implemented backend-based version, and the alternative approaches below are included for reference only and are not used in the codebase.

### The problem
```
User opens F12 → Console
         ↓
localStorage.getItem('seafood_qms_db')
         ↓
All data is visible and editable
         ↓
❌ Security breach!
```

### What this means
- ❌ Anyone can open the browser console and inspect the data
- ❌ Anyone can change issue status
- ❌ Anyone can log in as any user
- ❌ Anyone can delete data
- ❌ Anyone can add fake issues

### Why it happened
Because the data was stored in browser `localStorage`, meaning:
- data lived on the client machine
- there was no server-side validation
- there was no real authentication
- there were no authorization checks

---

## Available solutions

### Solution 1: Real backend (implemented ✅)

Description:
The database sits on the server, and the frontend talks to the backend through an API.

Benefits:
- ✅ Data is stored on the server instead of in the browser
- ✅ Real authentication with JWT
- ✅ Authorization checks including role-based access control
- ✅ Server-side validation
- ✅ Secure password hashing with bcrypt

Architecture:
```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTP/HTTPS
         │ (API Calls)
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
├─────────────────┤
│ - Auth          │
│ - Validation    │
│ - Authorization │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│   Database      │
│   (SQLite)      │
└─────────────────┘
```

Actual code:
- `server/src/index.ts` - server logic for auth, routes, and middleware
- `client/src/services/apiClient.ts` - frontend API client

---

### Solution 2: Firebase Firestore (cloud alternative)

Description:
Use Firebase as a Backend as a Service.

Benefits:
- ✅ No custom server required
- ✅ Real-time updates
- ✅ Security rules
- ✅ Built-in authentication
- ✅ Scalable

Implementation steps:
1. Create a Firebase project
2. Enable Firestore
3. Add security rules
4. Use the Firebase SDK in the frontend

Example rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null 
                    && (request.auth.token.role == 'admin' 
                        || request.auth.token.role == 'quality_manager');
      allow delete: if request.auth != null 
                    && request.auth.token.role == 'admin';
    }
  }
}
```

---

### Solution 3: Encryption in localStorage (not recommended)

Description:
Encrypt data before storing it in localStorage.

Problems:
- ❌ Encryption key is in the frontend
- ❌ Anyone can decode it if the key is exposed
- ❌ Not a real security solution
- ❌ Performance issues

Not recommended except for demos.

---

## Security comparison

| Option | Security | Ease of use | Cost | Production-ready |
|---|---|---|---|---|
| **Real backend** | ✅ High | ⚠️ Medium | 💰 Low | ✅ Yes |
| **Firebase** | ✅ High | ✅ Easy | 💰 Medium | ✅ Yes |
| **Encrypted localStorage** | ❌ Weak | ✅ Easy | 💰 Free | ❌ No |

---

## How to run the app

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Development - frontend and backend together
npm run dev

# Production
npm run build
npm start
```

Refer to `README.md` and `RUNNING.md` for full setup details and environment configuration (`server/.env`, `client/.env`).

### Security verification

```bash
# Open the browser devtools console
# Try to modify data in the app
# It will not work in the production-ready backend version ✅
```

---

## Backend security features

### 1. Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "admin@seafood.com",
  "password": "Admin@123456"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-1",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

### 2. Authorization
```javascript
// Every request must include a token
GET /api/issues
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// No token -> 401 Unauthorized
// Invalid token -> 403 Forbidden
```

Role-based access control is enforced by a dedicated middleware (`requireRole(...roles)`) that limits certain endpoints to specific roles regardless of what the UI allows. Real example from the codebase:
```ts
app.delete('/api/issues/:id', authenticateToken, requireRole('admin', 'quality_manager'), (req, res) => {
  // A quality engineer would get 403 even if they called the API directly
});
```

### 3. Server-side validation
```javascript
// Backend validates core payload fields
if (!title || !description) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### 4. Rate limiting
```javascript
// Limit to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### 5. Security headers
```javascript
// Helmet adds security headers
app.use(helmet());
// Content-Security-Policy
// X-Content-Type-Options
// X-Frame-Options
// ...
```

### 6. JSON payload limit
```javascript
// 25mb is enough for a few base64 issue photos in a single report
app.use(express.json({ limit: '25mb' }));
```

---

## Final architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - UI Components                        │
│  - Forms & Validation                   │
│  - API Calls                            │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS + JWT Token
               ▼
┌─────────────────────────────────────────┐
│         Backend (Express)               │
│  - Authentication (JWT)                 │
│  - Authorization                        │
│  - Validation                           │

│  - Rate Limiting                        │
│  - Security Headers                     │
└──────────────┬──────────────────────────┘
               │
               │ SQL Queries
               ▼
┌─────────────────────────────────────────┐
│         Database (SQLite)               │
│  - Users (hashed passwords)             │
│  - Issues                               │
│  - Branches                             │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist للإنتاج

### Backend (مطبَّق):
- [x] Authentication (JWT)
- [x] Authorization checks (بما فيها RBAC عبر `requireRole`)
- [x] Input validation
- [x] SQL injection prevention (parameterized queries)
- [x] Rate limiting
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Password hashing (bcrypt)
- [x] Error handling (try/catch على كل route + `console.error`)

### Backend (لسه مش مطبَّق - قبل إنتاج حقيقي):
- [ ] Structured/persistent logging (حاليًا `console.log`/`console.error` بس، بتضيع لو السيرفر أعيد تشغيله بدون log aggregation)
- [ ] Automated backup strategy لملف SQLite
- [ ] Refresh tokens / password reset flow (راجع `AUTH_GUIDE.md`)

### Frontend:
- [x] Token storage (sessionStorage)
- [x] API client with auth headers
- [x] Error handling
- [x] Loading states
- [x] No direct database access

### Database:
- [x] SQLite on server
- [x] Foreign keys (`branch_id`, `reported_by`, `assigned_to`)
- [x] Indexes (`branch_id`, `status`, `reported_at`, `reported_by` على جدول `issues`)
- [ ] Automated backup strategy (راجع `DATABASE_GUIDE.md`)

---

## 🎯 الخلاصة

### النسخة الحالية (بدون Backend):
- ❌ **غير آمنة** - البيانات في المتصفح
- ❌ **غير مناسبة للإنتاج** - أي حد يقدر يعدل البيانات
- ✅ **مناسبة للـ demo** - لو مش مهم الأمان

### النسخة مع Backend:
- ✅ **آمنة** - البيانات على السيرفر
- ✅ **مناسبة للإنتاج** - حماية كاملة
- ✅ **Scalable** - تقدر تضيف ميزات بسهولة

---

## 📞 التنفيذ

```bash
npm run dev      # تطوير
npm run build && npm start   # إنتاج
```

### لو عايز مساعدة:
- راجع `server/src/index.ts`
- راجع `DEPLOYMENT.md`

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0

<div align="center">

**🔒 Security First! 🛡️**

</div>
