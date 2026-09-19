# 🏗️ Clean Architecture Guide

## نظرة عامة على البنية المعمارية

النظام مبني على **Clean Architecture** مع **Repository Pattern** و **Service Layer** عشان يكون:
- ✅ نظيف ومنظم
- ✅ مرن وقابل للتوسع
- ✅ سهل الصيانة
- ✅ قابل للاختبار

---

## 📐 البنية المعمارية

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components, Pages, Hooks, Contexts)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  (Business Logic, Use Cases, Validation)                │
│  - IssueService                                         │
│  - UserService                                          │
│  - BranchService                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Repository Layer                        │
│  (Data Access, Query Building)                          │
│  - IssueRepository                                      │
│  - UserRepository                                       │
│  - BranchRepository                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
│  (SQLite via sql.js, Connection Management)             │
│  - DatabaseManager                                      │
│  - Schema Definition                                    │
│  - Migrations                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ هيكل الملفات

```
src/
├── database/
│   ├── schema.ts                    # تعريف الـ Schema
│   ├── connection.ts                # إدارة الاتصال
│   ├── sql.js.d.ts                  # TypeScript definitions
│   └── repositories/
│       ├── BaseRepository.ts        # Base class للـ repositories
│       ├── IssueRepository.ts       # Issue data access
│       ├── UserRepository.ts        # User data access
│       ├── BranchRepository.ts      # Branch data access
│       └── index.ts                 # Central exports
│
├── services/
│   ├── IssueService.ts              # Issue business logic
│   ├── UserService.ts               # User business logic
│   └── BranchService.ts             # Branch business logic
│
├── contexts/
│   ├── AuthContext.tsx              # Authentication state
│   └── DataContext.tsx              # Data state management
│
├── types/
│   └── index.ts                     # TypeScript types
│
├── components/
│   └── Layout.tsx                   # Main layout
│
├── pages/
│   ├── Dashboard.tsx
│   ├── ReportIssue.tsx
│   ├── IssuesList.tsx
│   ├── Reports.tsx
│   ├── Branches.tsx
│   ├── Staff.tsx
│   └── Login.tsx
│
└── App.tsx                          # Main app component
```

---

## 🎯 الـ Layers بالتفصيل

### 1️⃣ Database Layer

**المسؤولية:** إدارة الاتصال بقاعدة البيانات وتنفيذ الـ SQL queries.

#### DatabaseManager
```typescript
// Singleton pattern لإدارة الاتصال
const dbManager = DatabaseManager.getInstance();

// تهيئة قاعدة البيانات
await dbManager.initialize();

// حفظ التغييرات
dbManager.save();
```

**المميزات:**
- Singleton pattern
- Auto-migration
- Schema versioning
- Data persistence in localStorage

#### Schema Definition
```typescript
// src/database/schema.ts
export const TABLES: TableSchema[] = [
  {
    name: 'issues',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'title', type: 'TEXT', constraints: 'NOT NULL' },
      // ...
    ],
    indexes: [
      { name: 'idx_issues_branch', columns: ['branch_id'] },
      // ...
    ],
  },
];
```

---

### 2️⃣ Repository Layer

**المسؤولية:** توفير واجهة موحدة للوصول للبيانات.

#### BaseRepository
```typescript
abstract class BaseRepository<T> {
  protected abstract tableName: string;
  protected abstract mapRow(row: any): T;
  
  findAll(): T[]
  findById(id: string): T | null
  protected findWhere(whereClause: string, params: any[]): T[]
  protected insert(record: any): void
  protected update(id: string, updates: Partial<any>): void
  protected delete(id: string): void
  protected count(whereClause?: string, params?: any[]): number
}
```

#### IssueRepository
```typescript
class IssueRepository extends BaseRepository<Issue> {
  create(issue: Omit<Issue, 'id'>): string
  updateIssue(id: string, updates: Partial<Issue>): void
  deleteIssue(id: string): void
  findByBranch(branchId: string): Issue[]
  findByUser(userId: string): Issue[]
  findByStatus(status: string): Issue[]
  findByDateRange(start: Date, end: Date): Issue[]
  search(query: string): Issue[]
  findWithFilters(filters: object): Issue[]
  getStats(): object
  getComplianceStats(): object
}
```

**استخدام:**
```typescript
import { issueRepository } from './database/repositories';

// Get all issues
const issues = issueRepository.findAll();

// Find by branch
const branchIssues = issueRepository.findByBranch('branch-1');

// Create issue
const id = issueRepository.create({
  title: 'New Issue',
  description: 'Description',
  // ...
});
```

---

### 3️⃣ Service Layer

**المسؤولية:** تنفيذ الـ Business Logic والـ Use Cases.

#### IssueService
```typescript
class IssueService {
  getAllIssues(): Issue[]
  getIssueById(id: string): Issue | null
  createIssue(issue: Omit<Issue, 'id'>): string
  updateIssue(id: string, updates: Partial<Issue>): void
  deleteIssue(id: string): void
  resolveIssue(id: string, notes: string): void
  
  // Business logic methods
  getIssuesByBranch(branchId: string): Issue[]
  getIssuesByUser(userId: string): Issue[]
  getIssuesWithFilters(filters: object): Issue[]
  getIssueStats(): object
  getComplianceStats(): object
  getWeeklyComparison(): object
  getMonthlyComparison(): object
}
```

**استخدام:**
```typescript
import { issueService } from './services/IssueService';

// Create issue
const id = issueService.createIssue({
  title: 'Temperature Issue',
  description: 'High temperature detected',
  branchId: 'branch-1',
  category: 'temperature',
  priority: 'critical',
  status: 'open',
  complianceStatus: 'non_compliant',
  images: [],
  reportedBy: 'user-1',
  reportedAt: new Date().toISOString(),
});

// Resolve issue
issueService.resolveIssue(id, 'Fixed the temperature');

// Get statistics
const stats = issueService.getIssueStats();
```

---

### 4️⃣ Context Layer (React Integration)

**المسؤولية:** ربط الـ Services مع React Components.

#### DataContext
```typescript
const DataProvider: React.FC = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      await dbManager.initialize();
      const loadedIssues = issueService.getAllIssues();
      setIssues(loadedIssues);
      setIsLoading(false);
    };
    init();
  }, []);
  
  const addIssue = (issue: Omit<Issue, 'id'>) => {
    issueService.createIssue(issue);
    refreshIssues();
  };
  
  return (
    <DataContext.Provider value={{ issues, addIssue, ... }}>
      {children}
    </DataContext.Provider>
  );
};
```

**استخدام في Components:**
```typescript
const MyComponent: React.FC = () => {
  const { issues, addIssue, updateIssue } = useData();
  
  const handleSubmit = () => {
    addIssue({
      title: 'New Issue',
      // ...
    });
  };
  
  return (
    <div>
      {issues.map(issue => (
        <div key={issue.id}>{issue.title}</div>
      ))}
    </div>
  );
};
```

---

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
Context (useData, useAuth)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database Layer (SQLite)
    ↓
localStorage (Persistence)
```

### مثال: إضافة مشكلة جديدة

```typescript
// 1. User clicks "Submit" in ReportIssue.tsx
const handleSubmit = () => {
  addIssue(issueData);
};

// 2. DataContext calls IssueService
const addIssue = (issue) => {
  issueService.createIssue(issue);
  refreshIssues();
};

// 3. IssueService calls IssueRepository
createIssue(issue) {
  return issueRepository.create(issue);
}

// 4. IssueRepository executes SQL
create(issue) {
  const id = generateId();
  this.insert({ id, ...issue });
  dbManager.save();
  return id;
}

// 5. DatabaseManager saves to localStorage
save() {
  const data = this.db.export();
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}
```

---

## 🎨 مبادئ التصميم المستخدمة

### 1. Single Responsibility Principle (SRP)
كل class عنده مسؤولية واحدة فقط:
- `IssueRepository` → الوصول للبيانات
- `IssueService` → الـ Business Logic
- `DataContext` → إدارة الـ State

### 2. Open/Closed Principle (OCP)
النظام مفتوح للتوسع ومغلق للتعديل:
- إضافة Repository جديدة بدون تعديل الـ Base
- إضافة Service جديدة بدون تعديل الـ Services الموجودة

### 3. Dependency Inversion Principle (DIP)
الـ Services بتعتمد على الـ Repositories مش العكس:
```typescript
class IssueService {
  constructor(private repo: IssueRepository) {}
}
```

### 4. Interface Segregation Principle (ISP)
كل interface صغيرة ومحددة:
```typescript
interface IIssueRepository {
  findAll(): Issue[]
  findById(id: string): Issue | null
  create(issue: Issue): string
  // ...
}
```

---

## 🚀 إضافة ميزة جديدة

### مثال: إضافة نظام Notifications

#### 1. Database Schema
```typescript
// src/database/schema.ts
{
  name: 'notifications',
  columns: [
    { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
    { name: 'user_id', type: 'TEXT', constraints: 'NOT NULL' },
    { name: 'title', type: 'TEXT', constraints: 'NOT NULL' },
    { name: 'message', type: 'TEXT', constraints: 'NOT NULL' },
    { name: 'read', type: 'INTEGER', defaultValue: '0' },
    { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
  ],
}
```

#### 2. Repository
```typescript
// src/database/repositories/NotificationRepository.ts
export class NotificationRepository extends BaseRepository<Notification> {
  protected tableName = 'notifications';
  
  protected mapRow(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      read: row.read === 1,
      createdAt: row.created_at,
    };
  }
  
  findByUser(userId: string): Notification[] {
    return this.findWhere('user_id = ?', [userId]);
  }
  
  markAsRead(id: string): void {
    this.update(id, { read: 1 });
  }
}
```

#### 3. Service
```typescript
// src/services/NotificationService.ts
export class NotificationService {
  createNotification(userId: string, title: string, message: string) {
    return notificationRepository.create({
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
  
  getUnreadCount(userId: string): number {
    return notificationRepository.findByUser(userId)
      .filter(n => !n.read).length;
  }
}
```

#### 4. Context
```typescript
// src/contexts/NotificationContext.tsx
export const NotificationProvider: React.FC = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const refreshNotifications = () => {
    const userId = currentUser?.id;
    if (userId) {
      const notifs = notificationService.getNotificationsByUser(userId);
      setNotifications(notifs);
    }
  };
  
  return (
    <NotificationContext.Provider value={{ notifications, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

---

## 🧪 Testing

### Unit Testing للـ Services
```typescript
import { issueService } from './services/IssueService';

describe('IssueService', () => {
  beforeEach(async () => {
    await dbManager.initialize();
  });
  
  test('should create issue', () => {
    const id = issueService.createIssue({
      title: 'Test Issue',
      description: 'Test Description',
      // ...
    });
    
    expect(id).toBeDefined();
    const issue = issueService.getIssueById(id);
    expect(issue.title).toBe('Test Issue');
  });
  
  test('should get statistics', () => {
    const stats = issueService.getIssueStats();
    expect(stats.total).toBeDefined();
    expect(stats.open).toBeDefined();
  });
});
```

---

## 🔄 Migration من localStorage لـ Backend حقيقي

### الخطوة 1: إنشاء Backend API
```javascript
// server.js (Node.js + Express + better-sqlite3)
const express = require('express');
const Database = require('better-sqlite3');

const db = new Database('seafood_qms.db');
const app = express();

app.get('/api/issues', (req, res) => {
  const issues = db.prepare('SELECT * FROM issues').all();
  res.json(issues);
});

app.post('/api/issues', (req, res) => {
  const stmt = db.prepare(`
    INSERT INTO issues (title, description, ...)
    VALUES (?, ?, ...)
  `);
  const result = stmt.run(req.body);
  res.json({ id: result.lastInsertRowid });
});

app.listen(3001);
```

### الخطوة 2: تعديل الـ Repository
```typescript
// src/database/repositories/IssueRepository.ts
export class IssueRepository extends BaseRepository<Issue> {
  private useRemote = process.env.NODE_ENV === 'production';
  
  async findAll(): Promise<Issue[]> {
    if (this.useRemote) {
      const response = await fetch('/api/issues');
      return response.json();
    }
    return super.findAll();
  }
  
  async create(issue: Omit<Issue, 'id'>): Promise<string> {
    if (this.useRemote) {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
      });
      const data = await response.json();
      return data.id;
    }
    return super.create(issue);
  }
}
```

### الخطوة 3: تحديث الـ Services
```typescript
// Services تبقى async
export class IssueService {
  async getAllIssues(): Promise<Issue[]> {
    return await issueRepository.findAll();
  }
  
  async createIssue(issue: Omit<Issue, 'id'>): Promise<string> {
    return await issueRepository.create(issue);
  }
}
```

---

## 📊 مقارنة مع الأنماط الأخرى

| النمط | المميزات | العيوب |
|-------|---------|--------|
| **Clean Architecture** | ✅ منظم، قابل للاختبار، مرن | ❌ أكثر تعقيداً |
| **MVC** | ✅ بسيط، معروف | ❌ coupling عالي |
| **MVVM** | ✅ separation واضح | ❌ overhead أكبر |
| **Flux/Redux** | ✅ state management قوي | ❌ boilerplate كتير |

---

## 🎯 Best Practices

### 1. استخدم Dependency Injection
```typescript
// ❌ Bad
class IssueService {
  private repo = new IssueRepository();
}

// ✅ Good
class IssueService {
  constructor(private repo: IssueRepository) {}
}
```

### 2. افصل الـ Business Logic
```typescript
// ❌ Bad - في الـ Component
const handleSubmit = () => {
  const id = issueRepository.create(issue);
  issueRepository.updateIssue(id, { status: 'in_progress' });
};

// ✅ Good - في الـ Service
const handleSubmit = () => {
  issueService.createAndStartIssue(issue);
};
```

### 3. استخدم Types
```typescript
// ❌ Bad
function getIssues(branchId) {
  return issueRepository.findByBranch(branchId);
}

// ✅ Good
function getIssues(branchId: string): Issue[] {
  return issueRepository.findByBranch(branchId);
}
```

### 4. Handle Errors
```typescript
// ❌ Bad
const createIssue = (issue) => {
  return issueRepository.create(issue);
};

// ✅ Good
const createIssue = (issue) => {
  try {
    return issueRepository.create(issue);
  } catch (error) {
    console.error('Failed to create issue:', error);
    throw new Error('Failed to create issue');
  }
};
```

---

## 📚 موارد إضافية

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [sql.js Documentation](https://sql.js.org/)

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0
