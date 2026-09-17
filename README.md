# نظام إدارة الجودة - مطعم سي فود 🐟

نظام شامل لإدارة الجودة لمطعم سي فود يمتلك 3 فروع وإدارة رئيسية ومطبخ مركزي ومخزن رئيسي.

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

## 🏗️ الهيكل التقني

### التقنيات المستخدمة:
- **React** + **TypeScript** - Frontend Framework
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Visualizations
- **jsPDF** - PDF Reports
- **Firebase Firestore** - Database (Production)
- **localStorage** - Storage (Development/Demo)

### قاعدة البيانات:

#### الوضع الحالي (Development):
- النظام يستخدم **localStorage** كـ storage مؤقت
- مناسب للـ demo والتطوير
- البيانات محفوظة محلياً في المتصفح

#### للإنتاج (Production):
- النظام جاهز لاستخدام **Firebase Firestore**
- قاعدة بيانات سحابية حقيقية
- تحديثات فورية (Real-time)
- مجانية للاستخدام البسيط

## 🚀 التشغيل

### للتطوير (بدون Firebase):
```bash
npm install
npm run dev
```

### للإنتاج (مع Firebase):

#### 1. إعداد Firebase:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اعمل مشروع جديد
3. فعّل **Firestore Database**
4. اعمل Web App وانسخ الـ Config

#### 2. تحديث الـ Config:

افتح ملف `src/config/firebase.ts` واستبدل القيم:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### 3. إعداد Firestore Rules:

في Firebase Console > Firestore > Rules، ضع:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 4. Build & Deploy:

```bash
npm run build
```

## 👥 حسابات تجريبية

### مهندس جودة:
- **Email:** ahmed@seafood.com
- **Password:** أي نص

### مدير جودة:
- **Email:** sara@seafood.com
- **Password:** أي نص

## 📁 هيكل المشروع

```
src/
├── components/          # React Components
│   └── Layout.tsx      # Main Layout with Sidebar
├── contexts/           # React Contexts
│   ├── AuthContext.tsx # Authentication
│   └── DataContext.tsx # Data Management
├── data/              # Static Data
│   ├── branches.ts    # Branches Info
│   ├── sampleIssues.ts # Sample Data
│   └── users.ts       # Users Data
├── pages/             # Page Components
│   ├── Dashboard.tsx  # Main Dashboard
│   ├── ReportIssue.tsx # Report New Issue
│   ├── IssuesList.tsx  # Issues List
│   ├── Reports.tsx     # Reports & PDF
│   ├── Branches.tsx    # Branches Overview
│   ├── Staff.tsx       # Team Management
│   └── Login.tsx       # Login Page
├── services/          # Service Layer
│   └── firestoreService.ts # Firestore Operations
├── types/             # TypeScript Types
│   └── index.ts       # Type Definitions
├── config/            # Configuration
│   └── firebase.ts    # Firebase Config
└── App.tsx            # Main App Component
```

## 🔄 التوسع المستقبلي

### مميزات مقترحة:
- 🔐 نظام مصادقة كامل مع Firebase Auth
- 📧 إشعارات بالبريد الإلكتروني
- 📱 تطبيق موبايل
- 📸 رفع الصور على Firebase Storage
- 📊 تحليلات متقدمة بالـ AI
- 🔔 نظام تنبيهات
- 📋 قوائم فحص (Checklists)
- 📅 جدولة عمليات التفتيش

### إضافة مميزات جديدة:

1. **إضافة صفحة جديدة:**
```typescript
// src/pages/NewPage.tsx
import React from 'react';

const NewPage: React.FC = () => {
  return <div>New Page Content</div>;
};

export default NewPage;
```

2. **تسجيل الصفحة في App.tsx:**
```typescript
case 'new-page':
  return <NewPage />;
```

3. **إضافة للقائمة الجانبية:**
```typescript
{ id: 'new-page', label: 'صفحة جديدة', icon: Icon }
```

## 📝 ملاحظات مهمة

### قاعدة البيانات:
- النظام مصمم ليكون **مرن** - يشتغل بـ localStorage للـ demo ويتحول لـ Firebase للإنتاج
- الـ **Service Layer** يفصل منطق قاعدة البيانات عن الـ UI
- سهل التبديل بين قواعد البيانات المختلفة

### الأمان:
- في الإنتاج، استخدم **Firebase Authentication**
- ضع **Security Rules** مناسبة في Firestore
- لا تشارك الـ API Keys في الـ Repository

### الأداء:
- البيانات محفوظة في **localStorage** كـ cache
- Firebase يوفر **Real-time updates**
- استخدم **Pagination** للقوائم الكبيرة

## 🛠️ التطوير

### إضافة حقول جديدة للمشكلة:

1. **حدث الـ Type:**
```typescript
// src/types/index.ts
export interface Issue {
  // ... existing fields
  newField: string;
}
```

2. **حدث الفورم:**
```typescript
// src/pages/ReportIssue.tsx
<input 
  value={formData.newField}
  onChange={(e) => setFormData(prev => ({ ...prev, newField: e.target.value }))}
/>
```

3. **حدث العرض:**
```typescript
// src/pages/IssuesList.tsx
<p>{issue.newField}</p>
```

## 📞 الدعم

للمساعدة أو الاستفسارات، تواصل مع فريق التطوير.

---

**مطعم سي فود** - نظام إدارة الجودة © 2024
