# 🚀 دليل التشغيل الكامل

## 📋 المتطلبات

- Node.js 18+
- npm أو yarn

---

## 🔧 التثبيت

```bash
# تثبيت الـ dependencies
npm install
```

---

## 🏃 التشغيل

### الوضع 1: التطوير (Development)

**في Terminal 1 - شغل الـ Backend:**
```bash
npm run server:dev
```

**في Terminal 2 - شغل الـ Frontend:**
```bash
npm run dev
```

- الـ Backend هيشتغل على: `http://localhost:3001`
- الـ Frontend هيشتغل على: `http://localhost:5173`

---

### الوضع 2: الإنتاج (Production)

**الخطوة 1: اعمل build للـ Frontend:**
```bash
npm run build
```

ده هيعمل مجلد `dist/` فيه الـ Frontend بعد الـ build.

**الخطوة 2: شغل الـ Backend:**
```bash
npm run server
```

أو مباشرة:
```bash
npm start
```

ده هي:
1. يعمل build للـ Frontend
2. يشغل الـ Backend
3. الـ Backend هيخدم الـ Frontend على نفس البورت

**النتيجة:**
- النظام كله هيشتغل على: `http://localhost:3001`
- مفيش CORS issues
- مفيش need لـ 2 servers

---

## 🔐 بيانات الدخول

### 👑 مدير النظام (Admin):
```
البريد: admin@seafood.com
كلمة المرور: Admin@123456
```

### 📊 مدير الجودة:
```
البريد: sara@seafood.com
كلمة المرور: Manager@123
```

### 🔧 مهندس جودة (مثال):
```
البريد: ahmed@seafood.com
كلمة المرور: Engineer@123
```

---

## 📁 هيكل المشروع

```
seafood-qms/
├── server/
│   └── index.ts              # Backend بـ TypeScript
├── src/
│   ├── contexts/             # React Contexts
│   ├── services/             # Services (API Client)
│   ├── pages/                # Pages
│   └── ...
├── dist/                     # Frontend build (بعد الـ build)
├── package.json
├── tsconfig.server.json      # TypeScript config للـ server
└── README.md
```

---

## 🔒 الأمان

### في الإنتاج:
- ✅ البيانات على السيرفر (مش في المتصفح)
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS protection
- ✅ Server-side validation

### يعني إيه؟
- ❌ حد يقدر يفتح F12 ويعدل البيانات
- ❌ حد يقدر يتجاوز الـ Authentication
- ❌ حد يقدر يعمل SQL injection
- ✅ كل request لازم يكون معاه token
- ✅ كل البيانات محمية

---

## 🛠️ الأوامر المتاحة

```bash
# التطوير
npm run dev              # شغل الـ Frontend فقط
npm run server           # شغل الـ Backend فقط
npm run server:dev       # شغل الـ Backend مع watch mode

# الإنتاج
npm run build            # اعمل build للـ Frontend
npm start                # اعمل build + شغل الـ Backend

# Utilities
npm run typecheck        # تحقق من الـ TypeScript
```

---

## 🌐 Environment Variables

لو عايز تغير الـ configuration، اعمل ملف `.env`:

```bash
# Port
PORT=3001

# JWT Secret (غيره في الإنتاج!)
JWT_SECRET=your-super-secret-key-change-this

# Database Path
DB_PATH=./seafood_qms.db

# Client URL (للـ CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الـ Backend مش شغال
```bash
# تأكد إن الـ port مش مستخدم
lsof -i :3001

# لو مستخدم، اقتل الـ process
kill -9 <PID>

# شغل الـ Backend تاني
npm run server
```

### المشكلة: الـ Frontend مش بيتصل بالـ Backend
```bash
# تأكد إن الـ Backend شغال
curl http://localhost:3001/api/health

# لازم يرجع:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### المشكلة: مفيش dist folder
```bash
# اعمل build
npm run build

# تأكد إن مجلد dist اتعمل
ls dist/
```

---

## 📊 البنية النهائية

```
┌─────────────────────────────────────────┐
│         Browser (Client)                │
│    http://localhost:3001                │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────┐
│         Express Server                  │
│         (Port 3001)                     │
├─────────────────────────────────────────┤
│  /api/*      → API Endpoints            │
│  /*          → Static Files (dist/)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         SQLite Database                 │
│         (seafood_qms.db)                │
└─────────────────────────────────────────┘
```

---

## 🎯 الخلاصة

### للتطوير:
```bash
# Terminal 1
npm run server:dev

# Terminal 2
npm run dev
```

### للإنتاج:
```bash
npm start
```

وده هي:
1. ✅ يعمل build للـ Frontend
2. ✅ يشغل الـ Backend
3. ✅ يخدم كل حاجة على port واحد
4. ✅ يحمي البيانات

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0

<div align="center">

**🚀 Ready to Run! 🎉**

</div>
