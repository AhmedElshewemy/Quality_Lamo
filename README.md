# 🐟 نظام إدارة الجودة - مطعم سي فود

نظام شامل لإدارة الجودة مبني بـ **Clean Architecture** مع فصل كامل بين Frontend و Backend.

---

## 📁 هيكل المشروع

```
seafood-qms/
│
├── client/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/        # مكونات React
│   │   ├── contexts/          # إدارة الحالة
│   │   ├── pages/             # صفحات التطبيق
│   │   ├── services/          # خدمات API
│   │   ├── types/             # تعريفات TypeScript
│   │   ├── App.tsx            # المكون الرئيسي
│   │   ├── main.tsx           # نقطة الدخول
│   │   └── index.css          # الأنماط العامة
│   ├── dist/                  # ملفات البناء
│   ├── package.json           # تبعيات Frontend
│   ├── vite.config.ts         # إعدادات Vite
│   └── tsconfig.json          # إعدادات TypeScript
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/
│   │   └── index.ts           # السيرفر الرئيسي
│   ├── dist/                  # ملفات JavaScript المبنية
│   ├── package.json           # تبعيات Backend
│   └── tsconfig.json          # إعدادات TypeScript
│
├── package.json               # إدارة الأوامر الرئيسية
└── README.md                  # هذا الملف
```

---

## 🚀 التشغيل

### 1️⃣ التثبيت

```bash
# تثبيت كل التبعيات
npm install
```

### 2️⃣ التطوير

```bash
# تشغيل Frontend و Backend معاً
npm run dev

# أو بشكل منفصل:
npm run dev:client    # Frontend على http://localhost:5173
npm run dev:server    # Backend على http://localhost:3001
```

### 3️⃣ الإنتاج

```bash
# بناء المشروع
npm run build

# تشغيل السيرفر (يخدم Frontend من client/dist/)
npm start
```

**النتيجة:** كل شيء على `http://localhost:3001`

---

## 🔐 بيانات الدخول

### 👑 مدير النظام
```
البريد: admin@seafood.com
كلمة المرور: Admin@123456
```

### 📊 مدير الجودة
```
البريد: sara@seafood.com
كلمة المرور: Manager@123
```

### 🔧 مهندس جودة
```
البريد: ahmed@seafood.com
كلمة المرور: Engineer@123
```

---

## 🏗️ المعمارية

### Frontend (client/)

```
client/src/
├── components/          # مكونات قابلة لإعادة الاستخدام
│   ├── Layout.tsx       # التخطيط الرئيسي
│   └── ErrorBoundary.tsx # معالجة الأخطاء
│
├── contexts/            # إدارة الحالة
│   ├── AuthContext.tsx  # المصادقة
│   └── DataContext.tsx  # البيانات
│
├── pages/               # صفحات التطبيق
│   ├── Login.tsx        # تسجيل الدخول
│   ├── Dashboard.tsx    # لوحة التحكم
│   ├── ReportIssue.tsx  # رفع مشكلة
│   ├── IssuesList.tsx   # قائمة المشاكل
│   ├── Reports.tsx      # التقارير
│   ├── Branches.tsx     # الفروع
│   └── Staff.tsx        # الموظفين
│
├── services/            # خدمات API
│   └── apiClient.ts     # عميل API
│
└── types/               # تعريفات TypeScript
    └── index.ts         # الأنواع
```

### Backend (server/)

```
server/src/
└── index.ts             # السيرفر الرئيسي
    ├── إعدادات الأمان
    ├── قاعدة البيانات (SQLite)
    ├── المصادقة (JWT)
    ├── مسارات (Routes)
    │   ├── /api/auth/login
    │   ├── /api/issues
    │   ├── /api/branches
    │   ├── /api/users
    │   └── /api/stats
    └── خدمة Frontend
```

---

## 📡 API Endpoints

### المصادقة
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### المشاكل
```
GET    /api/issues              # جلب كل المشاكل
GET    /api/issues/:id          # جلب مشكلة واحدة
POST   /api/issues              # إنشاء مشكلة
PUT    /api/issues/:id          # تحديث مشكلة
DELETE /api/issues/:id          # حذف مشكلة
```

### الفروع
```
GET /api/branches               # جلب كل الفروع
```

### المستخدمين
```
GET /api/users                  # جلب كل المستخدمين
GET /api/users/:id              # جلب مستخدم واحد
```

### الإحصائيات
```
GET /api/stats/issues           # إحصائيات المشاكل
```

### الصحة
```
GET /api/health                 # فحص صحة السيرفر
```

---

## 🔒 الأمان

### ✅ ما هو مطبق:

1. **JWT Authentication**
   - كل طلب لازم يكون معاه token
   - token صالح لمدة 24 ساعة
   - تخزين آمن في sessionStorage

2. **Password Hashing**
   - كلمات المرور مش مخزنة plain text
   - استخدام bcrypt مع salt rounds = 10

3. **Rate Limiting**
   - حد 100 طلب كل 15 دقيقة
   - حماية من الهجمات

4. **Security Headers**
   - Helmet يضيف headers أمان
   - حماية من XSS, CSRF, etc.

5. **CORS Protection**
   - السماح فقط للـ Frontend
   - منع الوصول من مصادر غير مصرح بها

6. **Server-side Validation**
   - التحقق من كل البيانات
   - منع SQL Injection

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
- **Tailwind CSS** - Styling
- **Lucide React** - أيقونات
- **React Hot Toast** - إشعارات

### Backend:
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite** - قاعدة بيانات
- **JWT** - مصادقة
- **bcrypt** - تشفير كلمات المرور
- **Helmet** - أمان
- **CORS** - Cross-origin
- **Rate Limit** - حماية

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
API Calls → http://localhost:3001/api/*
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
- type (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

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
