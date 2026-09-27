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

## ⚙️ الإعدادات (Environment Variables)

كل جزء من المشروع له ملف `.env` خاص بيه (مفصولين عمداً، ومتجاهَلين في git):

### `server/.env`
```bash
PORT=3001                                    # البورت اللي السيرفر شغال عليه
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./seafood_qms.db
CLIENT_URL=http://localhost:5173             # مسموح للـ CORS منه في بيئة التطوير
```

### `client/.env`
```bash
VITE_API_URL=/api        # مسار نسبي - يشتغل صحيح في التطوير والإنتاج مع بعض
```

**ليه `VITE_API_URL` نسبي مش `http://localhost:3001/api`؟**
لأن في الإنتاج، Express نفسه هو اللي بيخدّم الفرونت إند، فمفيش داعي لمسار مطلق. وفي التطوير، `client/vite.config.ts` فيه `proxy` بيحوّل أي طلب لـ `/api` من `localhost:5173` (Vite) لـ `localhost:3001` (Express) تلقائيًا:
```ts
server: {
  proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
}
```

⚠️ **مهم:** Vite بيحقن `VITE_*` variables وقت الـ **build**، مش وقت التشغيل. لو غيّرت `client/.env` لازم تعمل `npm run build` تاني في `client/` عشان القيمة الجديدة تتفعّل.

⚠️ **مهم:** لو غيّرت `PORT` في `server/.env`، السيرفر بيحمّله عن طريق مكتبة `dotenv` (`import 'dotenv/config'` في أول سطر بـ `server/src/index.ts`) - لازم تعيد تشغيل السيرفر (`npm run dev` أو `npm start`) عشان القيمة الجديدة تتفعّل.

---

## 🔐 الصلاحيات (Roles & Permissions)

| الدور | يشوف | يقدر يعمل |
|---|---|---|
| `quality_engineer` | لوحة التحكم (بياناته بس)، تقرير مشكلة، مشاكلي | يسجّل مشاكل، يحلّ مشاكله هو |
| `quality_manager` | كل الصفحات + كل بيانات الشركة | كل حاجة فوق + يشوف/يحل كل المشاكل، يحذف مشاكل |
| `admin` | نفس صلاحيات `quality_manager` | نفس صلاحيات `quality_manager` |

**على مستوى السيرفر:** كل الـ endpoints محتاجة توكن JWT صحيح (`authenticateToken`). حذف المشكلة (`DELETE /api/issues/:id`) محمي كمان بـ middleware إضافي (`requireRole('admin', 'quality_manager')`) - يعني حتى لو مهندس جودة حاول يستخدم الـ API مباشرة (من برة الواجهة)، السيرفر هيرفض الطلب بـ `403`.

---

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

7. **Role-Based Access Control (RBAC)**
   - كل مستخدم عنده `role` (`quality_engineer` / `quality_manager` / `admin`)
   - middleware `requireRole(...)` بيحمي الـ endpoints الحساسة (زي حذف مشكلة) بغض النظر عن الواجهة

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
