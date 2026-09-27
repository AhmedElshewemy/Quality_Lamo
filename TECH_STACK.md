# 🛠️ التقنيات والـ Frameworks المستخدمة

## 📋 نظرة عامة

المشروع مبني بتقنيات حقيقية ومطبَّقة بالفعل - كل قسم هنا يوصف كود موجود فعليًا في المستودع، مش خيارات نظرية أو مقترحة.

---

## 🎨 Frontend Technologies

### React 18
**الموقع:** `client/package.json`

مكتبة JavaScript لبناء واجهات المستخدم. مستخدمة بـ Functional Components + Hooks (`useState`, `useEffect`, `useMemo`, `useContext`) و Context API (`AuthContext`, `DataContext`) و `React.lazy` + `Suspense` للتحميل المؤجل لكل صفحة (راجع قسم الأداء تحت).

### TypeScript
**الموقع:** `client/tsconfig.json`, `server/tsconfig.json`

`strict: true` في الاتنين، مع `noUnusedLocals` و `noUnusedParameters` مفعّلين - أي import أو متغير مش مستخدم يفشّل الـ build عمدًا، عشان الكود يفضل نظيف.

### Vite
**الموقع:** `client/vite.config.ts`

Build tool للفرونت إند. فيه `server.proxy` بيحوّل `/api/*` لـ `http://localhost:3001` وقت التطوير - ده اللي يخلي `VITE_API_URL=/api` (نسبي) يشتغل صحيح في التطوير والإنتاج مع بعض (راجع `README.md` → قسم الإعدادات).

### Tailwind CSS 4
**الموقع:** `client/postcss.config.js`, `client/src/index.css`

Utility-first CSS. النسخة 4 بتستخدم `@import "tailwindcss";` في `index.css` بدل الـ `@tailwind base/components/utilities` القديمة، وplugin الـ PostCSS الخاص بيها (`@tailwindcss/postcss`) - لازم يكون متطابق مع نسخة `tailwindcss` نفسها في `package.json`، وإلا الـ build بيفشل بخطأ "Cannot find module '@tailwindcss/postcss'".

### التنقل بين الصفحات (بدون router library)

مفيش `react-router-dom` ولا أي مكتبة routing في المشروع. التنقل بـ React state بسيط في `client/src/App.tsx`:
```typescript
const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

const renderPage = () => {
  switch (currentPage) {
    case 'dashboard': return <Dashboard />;
    case 'report-issue': return <ReportIssue />;
    // ...
  }
};
```
`PageId` (في `client/src/types/index.ts`) هو union type لكل الصفحات الممكنة، فأي اسم صفحة غلط بيبوّظ الـ TypeScript build فورًا بدل ما يبان باج وقت التشغيل.

---

## 📊 Data Visualization

### Recharts
**الإصدار المثبَّت:** `^2.15.4`
**الموقع:** `client/src/components/dashboard/DashboardCharts.tsx`, `client/src/pages/Reports.tsx`

الرسوم المستخدمة فعليًا: `LineChart` (اتجاه المشاكل عبر الوقت)، `PieChart` (نسبة المطابقة)، `BarChart` (أداء الفروع، توزيع الفئات). مفيش `AreaChart` مستخدم.

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<BarChart data={branchData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="total" fill="#3b82f6" />
</BarChart>
```

**ملاحظة أداء مهمة:** `Dashboard.tsx` نفسه **لا يستورد** `recharts` مباشرة. الرسوم معزولة في `DashboardCharts.tsx` ومحمّلة بـ `React.lazy` جوه `Suspense` منفصل داخل الصفحة - كروت الإحصائيات والجدول بيظهروا فورًا، والرسوم تتحمّل في الخلفية بعد كده. راجع قسم الأداء تحت.

---

## ✅ الفورمات (بدون مكتبة validation)

**الموقع:** `client/src/pages/ReportIssue.tsx`

مفيش `react-hook-form` ولا `zod` ولا أي مكتبة تحقق. الفورم مبني بـ `useState` عادي، والتحقق (`isFormValid`) عبارة عن شرط بسيط بيتأكد إن الحقول المطلوبة مليانة قبل تفعيل زرار الإرسال:
```typescript
const isFormValid =
  formData.title.trim() &&
  formData.description.trim() &&
  formData.branchId &&
  formData.category &&
  formData.priority &&
  formData.complianceStatus;
```
التحقق الحقيقي من نوع البيانات (مطلوب/مفيش، أنواع enum صحيحة) بيحصل تاني على السيرفر (`server/src/routes/issues.routes.ts`) قبل الحفظ في قاعدة البيانات.

---

## 📄 PDF Generation

### jsPDF + jspdf-autotable
**الإصدار المثبَّت:** `jspdf ^4.2.1`, `jspdf-autotable ^5.0.8`
**الموقع:** `client/src/pages/Reports.tsx`

```typescript
const generatePDF = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF();
  doc.text('Seafood Restaurant - Quality Report', 105, 20, { align: 'center' });
  autoTable(doc, {
    head: [['Branch', 'Total Issues', 'Compliance Rate']],
    body: branchData.map((b) => [b.name, b.total, `${b.complianceRate}%`]),
  });
  doc.save('quality-report.pdf');
};
```

⚠️ **مهم:** خطوط jsPDF المدمجة **مبتدعمش العربي**. التقرير المُصدَّر PDF بعناوين وتسميات إنجليزية عمدًا، حتى إن واجهة الموقع نفسها بالعربي بالكامل. لو محتاج PDF بالعربي، الحل هو تضمين خط عربي (TTF) في jsPDF - ده لسه مش متطبّق.

**تحميل مؤجل:** المكتبتين ديل (~260KB مع تبعياتهم `html2canvas` و `dompurify`) بيتحمّلوا بـ dynamic `import()` **جوه** دالة `generatePDF`، مش في أول الملف - يعني حتى لو المستخدم فتح صفحة التقارير، المكتبات ديل ما بتتحمّلش إلا لو دوس "تصدير PDF" فعليًا.

---

## 🎨 Icons & Notifications

### Lucide React
**الموقع:** `client/src/components/Layout.tsx` وكل صفحة

```typescript
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react';
<LayoutDashboard className="w-5 h-5" />
```

### React Hot Toast
**الموقع:** `client/src/App.tsx` (`<Toaster />`)، مستخدم في كل الصفحات اللي فيها إجراءات (`ReportIssue`, `IssuesList`) لإشعارات النجاح/الفشل بدل رسائل ثابتة في الصفحة.

---

## 🛡️ Error Handling

### Error Boundary (React أصلي، بدون مكتبة)
**الموقع:** `client/src/components/ErrorBoundary.tsx`

Class component عادي باستخدام واجهة React المدمجة (`getDerivedStateFromError`, `componentDidCatch`) - مفيش مكتبة `react-error-boundary` أو أي حاجة خارجية:
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>حدث خطأ - <button onClick={() => window.location.reload()}>إعادة تحميل</button></div>;
    }
    return this.props.children;
  }
}
```

---

## 💾 Database

### better-sqlite3
**الموقع:** `server/src/db/index.ts`

SQLite حقيقي على السيرفر (Node.js)، **مش** في المتصفح. مفيش `sql.js` ومفيش Firebase/Firestore في المشروع - راجع `DATABASE_GUIDE.md` للتفاصيل الكاملة (الجداول، الـ seeding، إلخ).
```typescript
import Database from 'better-sqlite3';
const db = new Database(DB_PATH);

const issues = db.prepare('SELECT * FROM issues WHERE status = ?').all('open');
db.prepare('INSERT INTO issues (title, description) VALUES (?, ?)').run('عنوان', 'وصف');
```

---

## 🔐 Authentication & Backend

### Express.js 5
**الموقع:** `server/src/index.ts` (bootstrap) + `server/src/routes/*.ts`

```typescript
import express from 'express';
const app = express();
app.use(express.json());
app.use('/api/issues', issuesRoutes);
```
> Express 5 بيستخدم `path-to-regexp` v7، اللي بطّلت تدعم الصيغة القديمة لـ wildcard route (`app.get('*', ...)`). الصيغة الصحيحة المستخدمة هنا: `app.get('/*splat', ...)` (لخدمة صفحة الـ SPA لأي route غير API).

### dotenv
**الموقع:** أول سطر في `server/src/index.ts`

```typescript
import 'dotenv/config';   // لازم يكون أول import في الملف
```
بيحمّل `server/.env` في `process.env`. بدونه، أي تعديل في `.env` (زي `PORT`) بيتكتب بس من غير أي تأثير فعلي.

### JWT (jsonwebtoken)
**الموقع:** `server/src/routes/auth.routes.ts`, `server/src/middleware/auth.ts`

```typescript
const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid or expired token' });
  req.user = user;
});
```

### Role-Based Access Control (middleware مخصّص)
**الموقع:** `server/src/middleware/auth.ts`

```typescript
export const requireRole = (...roles: string[]) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// الاستخدام: حذف مشكلة محصور في admin/quality_manager
app.delete('/api/issues/:id', authenticateToken, requireRole('admin', 'quality_manager'), handler);
```

### bcryptjs
**الموقع:** `server/src/db/seed.ts`, `server/src/routes/auth.routes.ts`

```typescript
const passwordHash = bcrypt.hashSync(password, 10);
const validPassword = bcrypt.compareSync(password, user.password_hash);
```
> الاستخدام هنا **synchronous** (`hashSync`/`compareSync`) مش async - مناسب لحجم السيرفر الحالي (SQLite + طلبات محدودة)، لو الحمل كبر يستحق التحويل لـ async.

---

## 🔒 Security Middleware

### Helmet
```typescript
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] /* ... */ } } }));
```

### CORS
```typescript
app.use(cors({ origin: CLIENT_URL, credentials: true }));
```

### express-rate-limit
```typescript
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
```

### JSON Payload Limit
```typescript
app.use(express.json({ limit: '25mb' }));  // كافي لكذا صورة base64 في تقرير مشكلة واحد
```

كل التفاصيل دي متوزعة على ملفات `server/src/index.ts` (bootstrap) و middleware مخصص - راجع `PROJECT_STRUCTURE.md` لخريطة الملفات كاملة.

---

## 📦 Package Management

### 3 ملفات package.json مستقلة (بدون npm workspaces حقيقية)

المشروع فيه root، `client/`، و `server/` - كل واحد بملف `package.json` خاص بيه ودياله ديبندنسيز مختلفة تمامًا. **مفيش** إعداد `workspaces` حقيقي في npm. الأمر `npm run install:all` في الـ root بس بينفذ `npm install` في التلاتة بالتتابع (`cd client && npm install && cd ../server && npm install`).

---

## 📊 ملخص التقنيات

### Frontend Stack:
```
┌─────────────────────────────────────┐
│  React 18 + TypeScript              │  ← Core Framework
├─────────────────────────────────────┤
│  Vite                               │  ← Build Tool
├─────────────────────────────────────┤
│  Tailwind CSS 4                     │  ← Styling
├─────────────────────────────────────┤
│  Recharts (lazy-loaded)             │  ← Charts
├─────────────────────────────────────┤
│  jsPDF + jspdf-autotable (lazy)     │  ← PDF Export
├─────────────────────────────────────┤
│  Lucide React                       │  ← Icons
├─────────────────────────────────────┤
│  React Hot Toast                    │  ← Notifications
└─────────────────────────────────────┘
```

### Backend Stack:
```
┌─────────────────────────────────────┐
│  Express.js 5                       │  ← Web Framework
├─────────────────────────────────────┤
│  better-sqlite3                     │  ← Database
├─────────────────────────────────────┤
│  JWT + bcryptjs                     │  ← Auth
├─────────────────────────────────────┤
│  dotenv                             │  ← Config
├─────────────────────────────────────┤
│  Helmet + CORS + Rate Limit         │  ← Security
└─────────────────────────────────────┘
```

---

## ⚡ الأداء - قرارات حقيقية اتخدناها

هذا القسم يوثّق تريد-أوفز حقيقية حصلت في تطوير المشروع، مش نصايح عامة:

1. **كل صفحة `React.lazy`** في `App.tsx` → أول تحميل بعد تسجيل الدخول ~184KB (59KB مضغوط) بدل تحميل كل الصفحات مرة واحدة.
2. **الرسوم البيانية معزولة عن باقي الداشبورد** (`DashboardCharts.tsx` جوه `Suspense` منفصل) → كروت الإحصائيات تظهر فورًا، الرسوم (اللي بتسحب معاها ~525KB من مكتبات recharts/d3) تتحمّل في الخلفية بعد كده.
3. **jsPDF متحمّل بـ dynamic `import()` جوه دالة التصدير نفسها**، مش أعلى الملف → زيارة صفحة التقارير من غير تصدير PDF ما بتنزّلش المكتبة (390KB) خالص.

القرار الصريح هنا: الداشبورد الغنية (رسوم بيانية من أول لحظة) أهم من أصغر حجم تحميل ممكن - التعويض كان في تأجيل كل حاجة تانية ممكن تتأجل (PDF export، باقي الصفحات).

---

**Part of Seafood QMS - Quality Management System**
