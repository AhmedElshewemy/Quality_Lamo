# 🐟 نظام إدارة الجودة - مطعم سي فود

## ✅ النظام جاهز للإنتاج!

نظام شامل لإدارة الجودة مبني بـ **Clean Architecture** مع **Backend حقيقي** و**SQLite Database**.

---

## 🎯 المميزات

### للأمان:
- ✅ Backend حقيقي بـ TypeScript
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Protection
- ✅ Server-side Validation
- ✅ البيانات على السيرفر (مش في المتصفح)

### للوظائف:
- ✅ رفع المشاكل بالصور والتفاصيل
- ✅ تقييم المطابقة (مطابق / مطابق جزئياً / غير مطابق)
- ✅ لوحة تحكم شاملة مع تحليلات
- ✅ تقارير PDF
- ✅ إدارة الفروع والموظفين
- ✅ مقارنة الأداء (أسبوعي / شهري / ربع سنوي)

---

## 🚀 التشغيل السريع

### للتطوير (Development):

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

---

### للإنتاج (Production):

```bash
npm start
```

ده هي:
1. ✅ يعمل build للـ Frontend
2. ✅ يشغل الـ Backend
3. ✅ يخدم كل حاجة على **port واحد**: `http://localhost:3001`

---

## 🔐 بيانات الدخول

### 👑 مدير النظام:
```
البريد: admin@seafood.com
كلمة المرور: Admin@123456
```

### 📊 مدير الجودة:
```
البريد: sara@seafood.com
كلمة المرور: Manager@123
```

### 🔧 مهندس جودة:
```
البريد: ahmed@seafood.com
كلمة المرور: Engineer@123
```

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────┐
│         Browser (Client)                │
│    http://localhost:3001                │
└──────────────┬──────────────────────────┘
               │
               │ HTTP + JWT Token
               ▼
┌─────────────────────────────────────────┐
│    Express Server (TypeScript)          │
│         Port 3001                       │
├─────────────────────────────────────────┤
│  /api/*      → API Endpoints            │
│  /*          → Static Files (dist/)     │
├─────────────────────────────────────────┤
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
│         SQLite Database                 │
│         (seafood_qms.db)                │
└─────────────────────────────────────────┘
```

---

## 🛠️ التقنيات المستخدمة

### Frontend:
- React 18 + TypeScript
- Tailwind CSS
- Recharts (Charts)
- jsPDF (PDF Reports)
- React Hook Form + Zod (Validation)

### Backend:
- Express.js + TypeScript
- better-sqlite3 (Database)
- JWT (Authentication)
- bcryptjs (Password Hashing)
- Helmet (Security)
- CORS & Rate Limiting

---

## 📁 هيكل المشروع

```
seafood-qms/
├── server/
│   └── index.ts              # Backend بـ TypeScript
├── src/
│   ├── contexts/             # React Contexts (Auth, Data)
│   ├── services/             # API Client
│   ├── pages/                # Pages
│   ├── components/           # Components
│   └── ...
├── dist/                     # Frontend build
├── package.json
├── tsconfig.server.json
└── README.md
```

---

## 🔒 الأمان

### قبل (بدون Backend):
```
❌ البيانات في localStorage
❌ أي حد يفتح F12 ويشوف/يعدل البيانات
❌ مفيش Authentication حقيقي
❌ غير آمن للإنتاج
```

### بعد (مع Backend):
```
✅ البيانات على السيرفر
✅ F12 مش هينفع يعدل البيانات
✅ JWT Authentication
✅ Password Hashing
✅ آمن للإنتاج
```

---

## 📊 الأوامر المتاحة

```bash
# التطوير
npm run dev              # Frontend فقط
npm run server           # Backend فقط
npm run server:dev       # Backend مع watch mode

# الإنتاج
npm run build            # Build Frontend
npm start                # Build + Run Backend

# Utilities
npm run typecheck        # TypeScript check
```

---

## 📖 التوثيق

- **[RUNNING.md](./RUNNING.md)** - دليل التشغيل الكامل
- **[ARCHITECTURE_AR.md](./ARCHITECTURE_AR.md)** - شرح المعمارية
- **[TECH_STACK.md](./TECH_STACK.md)** - التقنيات المستخدمة
- **[SECURITY.md](./SECURITY.md)** - دليل الأمان
- **[AUTH_GUIDE.md](./AUTH_GUIDE.md)** - دليل المصادقة

---

## 🎯 الخلاصة

### النظام دلوقتي:
- ✅ **آمن** - Backend حقيقي + JWT
- ✅ **Production Ready** - جاهز للإنتاج
- ✅ **Scalable** - قابل للتوسع
- ✅ **Maintainable** - سهل الصيانة
- ✅ **Well Documented** - موثق بشكل شامل

---

## 🚀 البدء السريع

```bash
# 1. تثبيت الـ dependencies
npm install

# 2. للتطوير
npm run server:dev    # Terminal 1
npm run dev           # Terminal 2

# 3. للإنتاج
npm start

# 4. افتح المتصفح
http://localhost:3001
```

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0

<div align="center">

**🎉 Production Ready! 🚀**

Made with ❤️ and Best Practices

</div>
