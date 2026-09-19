# 🐟 نظام إدارة الجودة - مطعم سي فود

## نظام شامل لإدارة الجودة مبني على Clean Architecture مع SQLite

---

## 🎯 نظرة عامة

نظام إدارة جودة متكامل لمطعم سي فود يمتلك 3 فروع وإدارة رئيسية ومطبخ مركزي ومخزن رئيسي. النظام مبني بأفضل الممارسات الهندسية وجاهز للإنتاج.

### ✨ المميزات الرئيسية

#### لمهندس الجودة:
- ✅ رفع المشاكل بالصور والتفاصيل
- ✅ تقييم المطابقة (مطابق / مطابق جزئياً / غير مطابق)
- ✅ متابعة المشاكل المسجلة
- ✅ تسجيل حلول المشاكل
- ✅ رفع الصور مع ضغط تلقائي

#### لمدير الجودة:
- 📊 لوحة تحكم شاملة مع تحليلات
- 📈 مقارنة الأداء (أسبوعي / شهري / ربع سنوي)
- 📋 تقارير PDF تفصيلية
- 🏢 متابعة أداء جميع الفروع
- 👥 إدارة فريق الجودة
- 📧 إشعارات فورية

---

## 🏗️ المعمارية

النظام مبني على **Clean Architecture** مع **Repository Pattern**:

```
┌─────────────────────────────────────┐
│   Presentation (React Components)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Context Layer (State Management)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Service Layer (Business Logic)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer (Data Access)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database Layer (SQLite/sql.js)    │
└─────────────────────────────────────┘
```

---

## 🛠️ التقنيات المستخدمة

### Frontend:
- **React 18** + **TypeScript** - UI Framework
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Visualizations
- **React Hook Form** + **Zod** - Forms & Validation
- **React Hot Toast** - Notifications
- **React Error Boundary** - Error Handling
- **jsPDF** - PDF Reports
- **sql.js** - SQLite in Browser

### Backend (Optional):
- **Node.js** + **Express** - API Server
- **better-sqlite3** - SQLite Database
- **JWT** - Authentication
- **Helmet** - Security Headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - API Protection

### Infrastructure:
- **Docker** - Containerization
- **Firebase** - Authentication & Storage (Optional)
- **PM2** - Process Management
- **Nginx** - Reverse Proxy (Optional)

---

## 🚀 البدء السريع

### المتطلبات:
- Node.js 18+
- npm أو yarn

### التثبيت:

```bash
# Clone repository
git clone https://github.com/your-org/seafood-qms.git
cd seafood-qms

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

التطبيق هيشتغل على: `http://localhost:5173`

---

## 👥 حسابات تجريبية

### مهندس جودة:
- **Email:** ahmed@seafood.com
- **Password:** أي نص (في الوضع التجريبي)

### مدير جودة:
- **Email:** sara@seafood.com
- **Password:** أي نص (في الوضع التجريبي)

---

## 📁 هيكل المشروع

```
seafood-qms/
├── src/
│   ├── components/          # React Components
│   │   ├── Layout.tsx       # Main Layout
│   │   └── ErrorBoundary.tsx # Error Handling
│   │
│   ├── contexts/            # React Contexts
│   │   ├── AuthContext.tsx  # Authentication
│   │   └── DataContext.tsx  # Data Management
│   │
│   ├── database/            # Database Layer
│   │   ├── schema.ts        # Schema Definition
│   │   ├── connection.ts    # Connection Manager
│   │   └── repositories/    # Data Access
│   │       ├── BaseRepository.ts
│   │       ├── IssueRepository.ts
│   │       ├── UserRepository.ts
│   │       └── BranchRepository.ts
│   │
│   ├── services/            # Business Logic
│   │   ├── IssueService.ts
│   │   ├── UserService.ts
│   │   ├── BranchService.ts
│   │   ├── FileUploadService.ts
│   │   └── apiClient.ts
│   │
│   ├── validation/          # Validation Layer
│   │   └── schemas.ts       # Zod Schemas
│   │
│   ├── utils/               # Utilities
│   │   ├── logger.ts        # Logging
│   │   ├── errorHandler.ts  # Error Handling
│   │   ├── security.ts      # Security Utils
│   │   ├── performance.ts   # Performance Utils
│   │   └── notifications.ts # Toast Notifications
│   │
│   ├── pages/               # Page Components
│   │   ├── Dashboard.tsx
│   │   ├── ReportIssue.tsx
│   │   ├── IssuesList.tsx
│   │   ├── Reports.tsx
│   │   ├── Branches.tsx
│   │   ├── Staff.tsx
│   │   └── Login.tsx
│   │
│   └── App.tsx              # Main App
│
├── server/                  # Backend API
│   └── index.js             # Express Server
│
├── docker-compose.yml       # Docker Setup
├── Dockerfile               # Docker Build
├── .env.example             # Environment Template
│
└── Documentation/
    ├── README.md            # This file
    ├── ARCHITECTURE.md      # Architecture Guide
    ├── DATABASE_GUIDE.md    # Database Guide
    ├── DEPLOYMENT.md        # Deployment Guide
    └── PRODUCTION_CHECKLIST.md # Production Checklist
```

---

## 📖 التوثيق

### 📘 [ARCHITECTURE.md](./ARCHITECTURE.md)
دليل شامل لمعمارية النظام والـ Clean Architecture

### 📗 [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
دليل قاعدة البيانات SQLite وإعدادها

### 📙 [DEPLOYMENT.md](./DEPLOYMENT.md)
دليل النشر والإنتاج

### 📕 [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
قائمة التحقق قبل النشر

---

## 🔧 الأوامر المتاحة

### التطوير:
```bash
npm run dev          # تشغيل السيرفر التطويري
npm run build        # بناء النسخة النهائية
npm run preview      # معاينة النسخة النهائية
npm run lint         # فحص الأخطاء
```

### الإنتاج:
```bash
# Build
npm run build

# Run with Node.js
node server/index.js

# Run with Docker
docker-compose up -d

# Run with PM2
pm2 start server/index.js --name "seafood-qms"
```

---

## 🗄️ قاعدة البيانات

### الوضع التجريبي (Development):
- **SQLite في المتصفح** عبر sql.js
- البيانات محفوظة في localStorage
- لا يحتاج إعدادات

### الوضع الإنتاجي (Production):
- **SQLite على السيرفر** عبر better-sqlite3
- أو **Firebase Firestore** (اختياري)
- أو **PostgreSQL/MySQL** (للتوسع)

### الجداول:
- `users` - المستخدمون
- `branches` - الفروع
- `issues` - المشاكل
- `issue_images` - الصور
- `inspections` - عمليات التفتيش
- `audit_log` - سجل التدقيق

---

## 🔐 الأمان

### المميزات الأمنية:
- ✅ Authentication مع JWT
- ✅ Authorization checks
- ✅ Input validation (Zod)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ HTTPS ready
- ✅ Environment variables secured

### أفضل الممارسات:
- لا ترفع `.env` على Git
- استخدم كلمات مرور قوية
- فعّل HTTPS في الإنتاج
- حدّث الـ dependencies بانتظام
- راقب الـ logs

---

## 📊 المراقبة والتتبع

### Logging:
```typescript
import { logger } from './utils/logger';

logger.info('User logged in', 'Auth', { userId: '123' });
logger.error('Failed to create issue', 'IssueService', { error });
```

### Error Tracking:
- Error Boundaries للـ React
- Global error handlers
- Structured error logging
- Sentry integration ready

### Performance Monitoring:
- Page load metrics
- API response times
- Database query times
- Memory usage tracking

---

## 🧪 الاختبار

### Unit Tests:
```bash
npm test
```

### Integration Tests:
```bash
npm run test:integration
```

### E2E Tests:
```bash
npm run test:e2e
```

---

## 🚀 النشر

### خيارات النشر:

#### 1. Vercel (Frontend only):
```bash
npm install -g vercel
vercel --prod
```

#### 2. Docker (Full stack):
```bash
docker-compose up -d
```

#### 3. Traditional Server:
```bash
npm run build
pm2 start server/index.js --name "seafood-qms"
```

### خطوات النشر:
1. راجع [DEPLOYMENT.md](./DEPLOYMENT.md)
2. اتبع [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
3. اختبر في بيئة staging
4. انشر في الإنتاج

---

## 📈 الأداء

### التحسينات المطبقة:
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image compression
- ✅ Caching strategy
- ✅ Debouncing/Throttling
- ✅ Virtual scrolling ready
- ✅ Bundle optimization

### الأهداف:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- API Response Time: < 200ms

---

## 🔄 التحديثات

### آخر التحديثات:
- ✅ SQLite Database
- ✅ Clean Architecture
- ✅ Input Validation (Zod)
- ✅ Error Handling
- ✅ Logging System
- ✅ Security Features
- ✅ Docker Support
- ✅ API Client
- ✅ File Upload Service
- ✅ Performance Utils

### Roadmap:
- [ ] Unit Tests
- [ ] E2E Tests
- [ ] Email Notifications
- [ ] Mobile App
- [ ] Advanced Analytics
- [ ] AI-Powered Insights

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📞 الدعم

### التواصل:
- 📧 Email: support@seafood-qms.com
- 📱 Phone: +20 123 456 7890
- 🌐 Website: www.seafood-qms.com

### الموارد:
- 📚 [التوثيق الكامل](./docs/)
- 🎥 [فيديوهات تعليمية](https://youtube.com/seafood-qms)
- 💬 [مجتمع المستخدمين](https://discord.gg/seafood-qms)

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](./LICENSE).

---

## 🙏 شكر خاص

شكراً لكل من ساهم في تطوير هذا النظام.

---

**مطعم سي فود** - نظام إدارة الجودة  
**الإصدار:** 1.0.0  
**آخر تحديث:** 2024

---

<div align="center">

**⭐ إذا أعجبك المشروع، لا تنسى إعطاءه نجمة! ⭐**

Made with ❤️ for Seafood Restaurant

</div>
