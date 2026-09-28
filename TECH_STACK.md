# Technologies and Frameworks Used

## Overview

This project is built with technologies that are actually present in the repository. Each section below describes code that exists in the project rather than hypothetical or suggested alternatives.

---

## Frontend technologies

### React 18
**Location:** `client/package.json`

React is used to build the user interface with functional components and hooks (`useState`, `useEffect`, `useMemo`, `useContext`) together with the Context API (`AuthContext`, `DataContext`) and `React.lazy` + `Suspense` for lazy-loaded pages.

### TypeScript
**Location:** `client/tsconfig.json`, `server/tsconfig.json`

Both configs use `strict: true`, with `noUnusedLocals` and `noUnusedParameters` enabled. This means any unused import or variable fails the build intentionally, keeping the codebase clean.

### Vite
**Location:** `client/vite.config.ts`

Vite is the frontend build tool. The `server.proxy` setting redirects `/api/*` to `http://localhost:3001` during development, which allows `VITE_API_URL=/api` to work both in development and in simple production setups.

### Tailwind CSS 4
**Location:** `client/postcss.config.js`, `client/src/index.css`

Tailwind is used as a utility-first CSS framework. The v4 setup uses `@import "tailwindcss";` instead of the older `@tailwind base/components/utilities` pattern, and the matching PostCSS plugin (`@tailwindcss/postcss`) must align with the installed `tailwindcss` version; otherwise the build fails with the error "Cannot find module '@tailwindcss/postcss'".

### Page navigation without a router library

There is no `react-router-dom` or other routing library in the project. Navigation is handled by simple React state in `client/src/App.tsx`:
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
`PageId` in `client/src/types/index.ts` is a union type covering every page. A wrong page name breaks the TypeScript build immediately instead of failing only at runtime.

---

## Data visualization

### Recharts
**Installed version:** `^2.15.4`
**Location:** `client/src/components/dashboard/DashboardCharts.tsx`, `client/src/pages/Reports.tsx`

The charts currently used are `LineChart`, `PieChart`, and `BarChart` for time trends, compliance ratio, and branch/category distribution.

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

Important performance note: `Dashboard.tsx` does not import `recharts` directly. The charts are isolated in `DashboardCharts.tsx` and loaded with `React.lazy` inside a dedicated `Suspense` block so the summary cards and main table render first while the charts load afterward.

---

## Form handling without a validation library

**Location:** `client/src/pages/ReportIssue.tsx`

There is no `react-hook-form`, `zod`, or validation library in the project. The form is built with plain `useState`, and a simple `isFormValid` check ensures the required fields are present before enabling submit:
```typescript
const isFormValid =
  formData.title.trim() &&
  formData.description.trim() &&
  formData.branchId &&
  formData.category &&
  formData.priority &&
  formData.complianceStatus;
```
The actual validation of field values is done on the server in `server/src/routes/issues.routes.ts` before the data is saved.

---

## PDF generation

### jsPDF + jspdf-autotable
**Installed versions:** `jspdf ^4.2.1`, `jspdf-autotable ^5.0.8`
**Location:** `client/src/pages/Reports.tsx`

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

Important: the bundled jsPDF fonts do not support Arabic text. The generated PDF is intentionally titled and labeled in English even though the rest of the app may be in Arabic. Supporting Arabic PDF output would require adding a custom Arabic TTF font, which is not implemented yet.

The libraries are lazy-loaded via `import()` within the `generatePDF` function so they are not loaded up front when the page is opened.

---

## Icons and notifications

### Lucide React
**Location:** `client/src/components/Layout.tsx` and other pages

```typescript
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react';
<LayoutDashboard className="w-5 h-5" />
```

### React Hot Toast
**Location:** `client/src/App.tsx` (`<Toaster />`)

Used across pages with actions such as `ReportIssue` and `IssuesList` to display success and error notifications without embedding static messages directly in the page.

---

## Error handling

### Error Boundary (native React, no external library)
**Location:** `client/src/components/ErrorBoundary.tsx`

This is a standard class component using React built-ins (`getDerivedStateFromError`, `componentDidCatch`):
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
      return <div>An error occurred - <button onClick={() => window.location.reload()}>Reload</button></div>;
    }
    return this.props.children;
  }
}
```

---

## Database

### better-sqlite3
**Location:** `server/src/db/index.ts`

This is a real SQLite database running on the Node.js server, not in the browser. There is no `sql.js` or Firebase/Firestore usage in the project.

```typescript
import Database from 'better-sqlite3';
const db = new Database(DB_PATH);

const issues = db.prepare('SELECT * FROM issues WHERE status = ?').all('open');
db.prepare('INSERT INTO issues (title, description) VALUES (?, ?)').run('Issue title', 'Issue description');
```

---

## Authentication and backend

### Express.js 5
**Location:** `server/src/index.ts` and `server/src/routes/*.ts`

```typescript
import express from 'express';
const app = express();
app.use(express.json());
app.use('/api/issues', issuesRoutes);
```

> Express 5 uses `path-to-regexp` v7, which removed support for the older wildcard pattern `app.get('*', ...)`. The correct version used here is `app.get('/*splat', ...)` to serve the SPA for non-API routes.

### dotenv
**Location:** at the top of `server/src/index.ts`

```typescript
import 'dotenv/config';   // must be the first import in the file
```
This loads `server/.env` into `process.env`. Without it, values such as `PORT` are not applied.

### JWT (jsonwebtoken)
**Location:** `server/src/routes/auth.routes.ts`, `server/src/middleware/auth.ts`

```typescript
const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid or expired token' });
  req.user = user;
});
```

### Role-based access control (custom middleware)
**Location:** `server/src/middleware/auth.ts`

```typescript
export const requireRole = (...roles: string[]) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Example usage: delete issue is restricted to admin / quality_manager
app.delete('/api/issues/:id', authenticateToken, requireRole('admin', 'quality_manager'), handler);
```

### bcryptjs
**Location:** `server/src/db/seed.ts`, `server/src/routes/auth.routes.ts`

```typescript
const passwordHash = bcrypt.hashSync(password, 10);
const validPassword = bcrypt.compareSync(password, user.password_hash);
```
> This implementation uses synchronous helpers (`hashSync` / `compareSync`) rather than async methods. That is appropriate for the current app scale (SQLite + limited traffic), but it would be worth converting to async if the load grows substantially.

---

## Security middleware

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

### JSON payload limit
```typescript
app.use(express.json({ limit: '25mb' }));  // Enough for several base64-encoded images in a single issue report
```

These details are distributed across `server/src/index.ts` and dedicated middleware files. See `PROJECT_STRUCTURE.md` for the full file map.

---

## Package management

### Three separate package.json files (no real npm workspaces)

The repo contains a root `package.json`, a `client/` package, and a `server/` package. Each one has its own dependencies and there is no true npm workspaces setup. The root `npm run install:all` runs `npm install` in sequence across all three folders (`cd client && npm install && cd ../server && npm install`).

---

## Technology summary

### Frontend stack:
```
┌─────────────────────────────────────┐
│  React 18 + TypeScript              │  ← Core framework
├─────────────────────────────────────┤
│  Vite                               │  ← Build tool
├─────────────────────────────────────┤
│  Tailwind CSS 4                     │  ← Styling
├─────────────────────────────────────┤
│  Recharts (lazy-loaded)             │  ← Charts
├─────────────────────────────────────┤
│  jsPDF + jspdf-autotable (lazy)     │  ← PDF export
├─────────────────────────────────────┤
│  Lucide React                       │  ← Icons
├─────────────────────────────────────┤
│  React Hot Toast                    │  ← Notifications
└─────────────────────────────────────┘
```

### Backend stack:
```
┌─────────────────────────────────────┐
│  Express.js 5                       │  ← Web framework
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

## Performance decisions that were actually made

This section documents real trade-offs made during development rather than general advice:

1. Every page is loaded with `React.lazy` in `App.tsx`, so the first load after sign-in is smaller than loading every page at once.
2. Charts are isolated from the rest of the dashboard in `DashboardCharts.tsx`, which is loaded inside its own `Suspense` boundary so summary cards render immediately while chart assets load in the background.
3. `jsPDF` is loaded via dynamic `import()` inside the export action itself instead of at the top of the file, so visiting the Reports page does not download the library unless the user actually exports a PDF.

The explicit decision here was to prioritize a richer dashboard experience over the smallest possible first-load size, while delaying non-critical assets such as PDF export and secondary pages.

---

**Part of Seafood QMS - Quality Management System**
