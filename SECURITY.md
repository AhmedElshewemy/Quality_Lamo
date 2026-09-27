# 🔒 الأمان وحماية البيانات

## ⚠️ المشكلة الأمنية في النسخة الأولى (v1 - قبل الـ backend)

> هذا القسم تاريخي: يوصف مشكلة النسخة الأولى (v1) اللي كانت بتخزن كل حاجة في `localStorage` بالمتصفح بدون أي سيرفر حقيقي. **النظام الحالي (v2) طبّق "الحل 1" تحت بالكامل - Backend حقيقي.** باقي الحلول (Firebase، Encryption) اتسيبت هنا للمرجعية بس، ومش مطبّقة ولا محتاجة تتطبّق.

### المشكلة:
```
المستخدم يفتح F12 → Console
         ↓
localStorage.getItem('seafood_qms_db')
         ↓
يشوف كل البيانات ويعدلها!
         ↓
❌ Security Breach!
```

### يعني إيه؟
- ❌ أي حد يقدر يفتح F12 ويشوف كل البيانات
- ❌ يقدر يغير حالة المشاكل
- ❌ يقدر يسجل دخول بأي حساب
- ❌ يقدر يمسح البيانات
- ❌ يقدر يضيف مشاكل مزيفة

### ليه ده بيحصل؟
لأن البيانات مخزنة في **localStorage** في المتصفح، يعني:
- البيانات في جهاز المستخدم
- مفيش server-side validation
- مفيش authentication حقيقي
- مفيش authorization checks

---

## ✅ الحلول المتاحة

### الحل 1: Backend حقيقي (مطبَّق ✅)

**الوصف:**
قاعدة البيانات على السيرفر، والـ frontend بيتكلم مع الـ backend عبر API فقط.

**المميزات:**
- ✅ البيانات على السيرفر (مش في المتصفح)
- ✅ Authentication حقيقي (JWT)
- ✅ Authorization checks (بما فيها Role-Based Access Control)
- ✅ Server-side validation
- ✅ Secure password hashing (bcrypt)

**البنية:**
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

**الكود الفعلي:**
- `server/src/index.ts` - كل منطق السيرفر (auth, routes, middleware)
- `client/src/services/apiClient.ts` - عميل الـ API في الفرونت إند

---

### الحل 2: Firebase Firestore (بديل سحابي)

**الوصف:**
استخدام Firebase كـ Backend as a Service.

**المميزات:**
- ✅ No server needed
- ✅ Real-time updates
- ✅ Security rules
- ✅ Authentication مدمج
- ✅ Scalable

**التنفيذ:**
1. اعمل مشروع Firebase
2. فعّل Firestore
3. حط Security Rules
4. استخدم Firebase SDK في الـ frontend

**Security Rules مثال:**
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

### الحل 3: Encryption في localStorage (مش موصى به)

**الوصف:**
تشفير البيانات في localStorage.

**المشاكل:**
- ❌ الـ encryption key في الـ frontend
- ❌ حد يقدر يفك التشفير
- ❌ مش حل حقيقي للأمان
- ❌ Performance issues

**مش موصى به إلا للـ demo فقط!**

---

## 🛡️ مقارنة الحلول

| الحل | الأمان | السهولة | التكلفة | الإنتاج |
|------|--------|---------|---------|---------|
| **Backend حقيقي** | ✅ عالي | ⚠️ متوسط | 💰 منخفض | ✅ نعم |
| **Firebase** | ✅ عالي | ✅ سهل | 💰 متوسط | ✅ نعم |
| **Encryption** | ❌ ضعيف | ✅ سهل | 💰 مجاني | ❌ لا |

---

## 🚀 طريقة التشغيل (النظام مبني بالفعل)

```bash
# تثبيت كل الـ dependencies (root + client + server)
npm run install:all

# تطوير - Frontend و Backend مع بعض
npm run dev

# إنتاج
npm run build
npm start
```

راجع `README.md` و `RUNNING.md` للتفاصيل الكاملة والإعدادات (`server/.env`, `client/.env`).

### التحقق من الأمان

```bash
# جرب تفتح F12 Console
# حاول تعدل البيانات
# مش هينفع! ✅
```

---

## 🔐 مميزات الـ Backend

### 1. Authentication
```javascript
// تسجيل الدخول
POST /api/auth/login
{
  "email": "admin@seafood.com",
  "password": "Admin@123456"
}

// الرد
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-1",
    "name": "مدير النظام",
    "role": "admin"
  }
}
```

### 2. Authorization
```javascript
// كل request لازم يكون فيه token
GET /api/issues
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

// لو مفيش token → 401 Unauthorized
// لو token غلط → 403 Forbidden
```

**Role-Based Access Control:** middleware إضافي (`requireRole(...roles)`) بيقيّد بعض الـ endpoints بدور معيّن، بغض النظر عن أي تحقق في الواجهة. مثال حقيقي من الكود:
```ts
app.delete('/api/issues/:id', authenticateToken, requireRole('admin', 'quality_manager'), (req, res) => {
  // مهندس الجودة (quality_engineer) هياخد 403 حتى لو نادى الـ API مباشرة
});
```

### 3. Server-side Validation
```javascript
// Backend يتحقق من البيانات
if (!title || !description) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### 4. Rate Limiting
```javascript
// حد 100 request كل 15 دقيقة
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### 5. Security Headers
```javascript
// Helmet بيضيف security headers
app.use(helmet());
// Content-Security-Policy
// X-Content-Type-Options
// X-Frame-Options
// ...
```

### 6. JSON Payload Limit
```javascript
// 25mb - كافي لكذا صورة (base64) في تقرير مشكلة واحد
app.use(express.json({ limit: '25mb' }));
```

---

## 📊 البنية النهائية

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
