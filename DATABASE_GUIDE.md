# 📚 دليل قاعدة البيانات

## الوضع الحالي

النظام مصمم بـ **Dual Mode** - يشتغل بطريقتين:

### 1️⃣ وضع التطوير (Development Mode)
- **قاعدة البيانات:** localStorage
- **الاستخدام:** Demo وتطوير
- **المميزات:**
  - سريع وسهل
  - لا يحتاج إعدادات
  - البيانات محفوظة محلياً
  - مناسب للاختبار

### 2️⃣ وضع الإنتاج (Production Mode)
- **قاعدة البيانات:** Firebase Firestore
- **الاستخدام:** الإنتاج الفعلي
- **المميزات:**
  - قاعدة بيانات سحابية
  - تحديثات فورية (Real-time)
  - مجانية للاستخدام البسيط
  - قابلة للتوسع

---

## 🔄 التبديل بين الوضعين

### التبديل تلقائي!

النظام بيكتشف تلقائياً:
- لو **Firebase Config** موجود → يستخدم Firestore
- لو **Firebase Config** مش موجود → يستخدم localStorage

---

## 🔥 إعداد Firebase Firestore

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اضغط **"Add Project"**
3. اكتب اسم المشروع (مثلاً: `seafood-qms`)
4. اتبع الخطوات لإنشاء المشروع

### الخطوة 2: تفعيل Firestore Database

1. في القائمة الجانبية، اضغط **Build > Firestore Database**
2. اضغط **"Create database"**
3. اختر **"Start in test mode"** (للتطوير)
4. اختر الموقع الأقرب ليك
5. اضغط **"Enable"**

### الخطوة 3: إنشاء Web App

1. في الصفحة الرئيسية للمشروع، اضغط على أيقونة **Web** (</>)
2. اكتب اسم التطبيق (مثلاً: `Seafood QMS Web`)
3. **لا** تضع علامة على "Firebase Hosting"
4. اضغط **"Register app"**
5. انسخ الـ **Config** اللي هيظهر

### الخطوة 4: تحديث الكود

افتح ملف `src/config/firebase.ts` واستبدل القيم:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyB...............",           // من Firebase
  authDomain: "seafood-qms.firebaseapp.com",
  projectId: "seafood-qms",
  storageBucket: "seafood-qms.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### الخطوة 5: إعادة التشغيل

```bash
npm run dev
```

الآن النظام هيستخدم Firebase Firestore تلقائياً!

---

## 📊 هيكل البيانات في Firestore

### Collection: `issues`

```javascript
{
  id: "auto-generated",
  title: "ارتفاع درجة حرارة الثلاجة",
  description: "تم رصد ارتفاع في درجة الحرارة...",
  branchId: "branch-1",
  category: "temperature",
  priority: "critical",
  status: "open",
  complianceStatus: "non_compliant",
  images: ["url1", "url2"],
  reportedBy: "user-1",
  reportedAt: "2024-01-15T10:30:00Z",
  resolvedAt: null,
  resolutionNotes: null,
  assignedTo: null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `users`

```javascript
{
  id: "user-1",
  name: "أحمد محمد",
  email: "ahmed@seafood.com",
  role: "quality_engineer",
  branch: "branch-1"
}
```

---

## 🔐 إعداد Security Rules

في Firebase Console > Firestore > Rules، ضع:

### للبدء (Development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### للإنتاج (مع Authentication):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Issues Collection
    match /issues/{issueId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null 
                    && request.auth.token.role == 'admin';
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.token.role == 'admin';
    }
  }
}
```

---

## 🎯 استخدام الـ Service Layer

### إضافة مشكلة جديدة:

```typescript
import { IssuesService } from './services/firestoreService';

const newIssue = {
  title: "مشكلة جديدة",
  description: "وصف المشكلة",
  branchId: "branch-1",
  category: "hygiene",
  priority: "high",
  status: "open",
  complianceStatus: "non_compliant",
  images: [],
  reportedBy: "user-1",
  reportedAt: new Date().toISOString()
};

const issueId = await IssuesService.create(newIssue);
console.log("تم إنشاء المشكلة:", issueId);
```

### تحديث مشكلة:

```typescript
await IssuesService.update(issueId, {
  status: "resolved",
  resolvedAt: new Date().toISOString(),
  resolutionNotes: "تم حل المشكلة"
});
```

### الحصول على مشاكل فرع معين:

```typescript
const branchIssues = await IssuesService.getByBranch("branch-1");
```

### Real-time Updates:

```typescript
const unsubscribe = IssuesService.subscribe((issues) => {
  console.log("تم تحديث المشاكل:", issues);
  // تحديث الـ UI
});

// لاحقة، عند الخروج:
unsubscribe();
```

---

## 📈 مقارنة قواعد البيانات

| الميزة | localStorage | Firebase Firestore |
|--------|-------------|-------------------|
| **التكلفة** | مجاني | مجاني حتى 1GB |
| **السرعة** | سريع جداً | سريع |
| **Real-time** | ❌ | ✅ |
| **Multi-device** | ❌ | ✅ |
| **Backup** | ❌ | ✅ |
| **Security** | ❌ | ✅ |
| **Scalability** | ❌ | ✅ |
| **Offline** | ✅ | ✅ (مع caching) |

---

## 🔄 Migration من localStorage لـ Firestore

### الخطوة 1: تصدير البيانات من localStorage

```javascript
// في Console المتصفح
const data = localStorage.getItem('qms_issues');
console.log(data);
// انسخ الـ JSON
```

### الخطوة 2: استيراد البيانات إلى Firestore

استخدم Firebase Console:
1. اذهب إلى Firestore Database
2. اضغط **"Start collection"**
3. اسم الـ collection: `issues`
4. أضف الـ documents يدوياً أو استخدم script

### Script للاستيراد:

```typescript
import { IssuesService } from './services/firestoreService';

const importData = async () => {
  const storedData = localStorage.getItem('qms_issues');
  if (!storedData) return;
  
  const issues = JSON.parse(storedData);
  
  for (const issue of issues) {
    const { id, ...issueData } = issue;
    await IssuesService.create(issueData);
  }
  
  console.log(`تم استيراد ${issues.length} مشكلة`);
};

importData();
```

---

## 🎨 بدائل أخرى لقاعدة البيانات

### 1. Supabase (بديل مفتوح المصدر لـ Firebase)

**المميزات:**
- PostgreSQL database
- Real-time subscriptions
- Authentication مدمج
- مفتوح المصدر

**التكامل:**
```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_KEY'
);

// استخدام مشابه لـ Firebase
```

### 2. Node.js + Express + MongoDB

**للـ Backend كامل:**

```bash
npm install express mongoose cors
```

**مثال بسيط:**

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('YOUR_MONGODB_URI');

const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  branchId: String,
  // ... rest of fields
});

const Issue = mongoose.model('Issue', IssueSchema);

const app = express();
app.use(express.json());

app.get('/api/issues', async (req, res) => {
  const issues = await Issue.find();
  res.json(issues);
});

app.post('/api/issues', async (req, res) => {
  const issue = new Issue(req.body);
  await issue.save();
  res.json(issue);
});

app.listen(3000);
```

### 3. AWS Amplify + DynamoDB

**للـ Enterprise Solutions:**

```bash
npm install aws-amplify
```

---

## 💡 نصائح للأداء

### 1. Indexes

في Firestore، أضف indexes للاستعلامات المعقدة:

```javascript
// Firestore Console > Indexes
// مثال:
// Collection: issues
// Fields: branchId (Ascending), reportedAt (Descending)
```

### 2. Caching

```typescript
// DataContext.tsx
const [cache, setCache] = useState<Map<string, Issue[]>>(new Map());

const getCachedIssues = (key: string) => cache.get(key);
const setCachedIssues = (key: string, issues: Issue[]) => {
  setCache(prev => new Map(prev).set(key, issues));
};
```

### 3. Pagination

```typescript
const getIssuesPaginated = async (
  pageSize: number, 
  lastDoc?: DocumentSnapshot
) => {
  let q = query(
    collection(db, 'issues'),
    orderBy('reportedAt', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  return await getDocs(q);
};
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: "Firebase not configured"

**الحل:**
1. تأكد من تحديث `src/config/firebase.ts`
2. تأكد من استبدال `YOUR_API_KEY` بالقيمة الحقيقية
3. أعد تشغيل الـ dev server

### المشكلة: "Missing or insufficient permissions"

**الحل:**
1. راجع Security Rules في Firebase Console
2. للتطوير، استخدم rules مفتوحة
3. للإنتاج، أضف Authentication

### المشكلة: البيانات لا تظهر

**الحل:**
1. افتح Firebase Console > Firestore Database
2. تأكد من وجود data في collections
3. راجع Console في المتصفح للأخطاء

---

## 📞 الدعم

للمساعدة في إعداد قاعدة البيانات:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)

---

**آخر تحديث:** 2024
