# 🗄️ دليل قاعدة البيانات

النظام يستخدم **SQLite** عن طريق `better-sqlite3` - قاعدة بيانات ملف واحد (`server/seafood_qms.db`)، تُنشأ وتُهيّأ تلقائيًا عند أول تشغيل للسيرفر. مفيش أي اعتماد على Firebase أو أي قاعدة بيانات سحابية.

## 📍 مكان الملف

مسار الملف محدد في `server/.env`:
```bash
DB_PATH=./seafood_qms.db
```
مسار نسبي لمجلد التشغيل الحالي (`server/` عادة). في حاوية Docker، الملف بيتخزن في `/app/data` (راجع `Dockerfile`).

## 🧱 الجداول

### `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,       -- bcrypt، مش plain text
  role TEXT NOT NULL,                -- 'quality_engineer' | 'quality_manager' | 'admin'
  branch_id TEXT,                    -- NULL للمدير/الأدمن (مش مربوطين بفرع)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `branches`
```sql
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'branch' | 'central_kitchen_warehouse'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `issues`
```sql
CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',       -- 'open' | 'in_progress' | 'resolved' | 'closed'
  compliance_status TEXT NOT NULL,           -- 'compliant' | 'partially_compliant' | 'non_compliant'
  images TEXT DEFAULT '[]',                  -- JSON array من base64 data URIs
  reported_by TEXT NOT NULL,
  reported_at DATETIME NOT NULL,
  resolved_at DATETIME,
  resolution_notes TEXT,
  assigned_to TEXT,
  follow_up_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ⚠️ camelCase في الـ API، snake_case في الجدول

أعمدة الجدول snake_case (`branch_id`, `reported_at`, ...) لكن كل استجابات الـ API لازم تكون camelCase (`branchId`, `reportedAt`, ...) لأن `client/src/types/index.ts` متوقع الشكل ده.

كل قراءة من جدول `issues` **لازم** تعدّي على دالة `mapIssueRow()` في `server/src/index.ts` قبل ما ترجع في الـ response - دي المسؤولة عن التحويل. لو ضفت endpoint جديد بيرجّع صفوف مشاكل، استخدمها بدل ما ترجّع الصف الخام:

```ts
const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
res.json(mapIssueRow(issue));   // ✅
res.json(issue);                // ❌ هيرجع snake_case ويكسر الفرونت إند
```

جدول `users` بردو فيه نفس النقطة، بس بشكل أبسط: الاستعلام بنفسه بياليس العمود (`branch_id as branch`) بدل استخدام helper منفصل.

## 🌱 البيانات الابتدائية (Seeding)

عند أول تشغيل، لو جدول `users` فاضي، السيرفر بيعمل seed تلقائي بـ:
- 3 حسابات (admin, quality_manager, quality_engineer) - بيانات الدخول في `README.md`
- 4 فروع (3 فروع + المطبخ المركزي والمخزن الرئيسي كمكان واحد)
- كذا مشكلة تجريبية

لو عايز تبدأ من جديد ببيانات فاضية، امسح ملف الداتابيز (وملفات WAL/SHM المصاحبة له) وشغّل السيرفر تاني:
```bash
cd server
rm -f seafood_qms.db seafood_qms.db-shm seafood_qms.db-wal
npm run dev
```

## 🔍 فحص القاعدة يدويًا

```bash
sqlite3 server/seafood_qms.db
.tables
SELECT id, name, email, role FROM users;
SELECT id, name, type FROM branches;
.quit
```

## 🚀 للترقية لقاعدة بيانات أكبر (PostgreSQL/MySQL)

SQLite كافي لحجم الاستخدام الحالي (فريق جودة واحد، عدد فروع محدود). لو الحجم كبر لدرجة تحتاج قاعدة بيانات منفصلة عن ملف السيرفر (تكرار السيرفر، نسخ متعددة، إلخ)، النقاط اللي لازم تتغيّر:
1. استبدال `better-sqlite3` بمكتبة الاتصال المناسبة (`pg`, `mysql2`, ...)
2. تحويل استعلامات `db.prepare(...).get/all/run` لصيغة async المكتبة الجديدة
3. الحفاظ على `mapIssueRow()` كما هي - هي منفصلة عن نوع القاعدة تمامًا، بتتعامل مع أي object جاي بمفاتيح snake_case

---

**Part of Seafood QMS - Quality Management System**
