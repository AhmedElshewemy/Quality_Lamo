# 🖥️ Frontend - Seafood QMS

Frontend application built with React, TypeScript, and Vite.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Recharts** - Dashboard and report charts (lazy-loaded, see Performance below)
- **jsPDF + jspdf-autotable** - PDF report export (lazy-loaded)

Navigation between pages is handled with simple React state (`currentPage` in `App.tsx`), not a router library - there's no `react-router-dom` dependency.

## 📁 Structure

```
client/
├── src/
│   ├── components/       # Reusable components (Layout, ErrorBoundary, dashboard/*)
│   ├── contexts/         # AuthContext, DataContext
│   ├── hooks/            # useBranches, useUsers - shared data-fetching hooks
│   ├── pages/            # One component per page (lazy-loaded in App.tsx)
│   ├── services/         # apiClient.ts
│   ├── types/            # Shared TypeScript types (Issue, Branch, User, PageId, ...)
│   ├── utils/
│   │   └── labels.ts     # Single source of truth for Arabic labels/colors/icons
│   │                     # (status, priority, category, compliance, branch type, role)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── .env                  # VITE_API_URL (see below)
├── package.json
├── tsconfig.json
├── vite.config.ts        # includes the /api dev proxy to the backend
└── tailwind.config.js
```

## 🚀 Development

```bash
npm install
npm run dev        # Vite dev server on :5173, proxies /api to :3001
npm run build       # tsc + vite build → dist/
npm run preview
```

## ⚙️ Environment

`VITE_API_URL=/api` — kept relative so the same build works against the Vite dev proxy and against the production server (which serves the frontend and API from the same origin). Vite inlines `VITE_*` vars at **build time**: after editing `.env`, re-run `npm run build`.

## 🔐 Authentication

JWT tokens stored in `sessionStorage`. `services/apiClient.ts` attaches the token to every request and surfaces the server's `{ error }` message on failure.

## 🧩 Adding a new page

1. Add the page id to the `PageId` union in `types/index.ts`.
2. Create `pages/YourPage.tsx`.
3. Register it as a `lazy()` import + route case in `App.tsx`.
4. Add a menu entry in `components/Layout.tsx` (`BASE_MENU` or `MANAGER_ONLY_ITEMS`).
5. Reuse `hooks/useBranches` / `useUsers` and `utils/labels.ts` instead of re-fetching or re-declaring labels locally.

## ⚡ Performance

- Every page is `React.lazy`-loaded from `App.tsx`, so only the JS for the page currently open is downloaded.
- `Dashboard.tsx` itself does **not** import `recharts` directly - the charts live in `components/dashboard/DashboardCharts.tsx`, lazy-loaded with its own `Suspense` boundary. The KPI cards and recent-issues table render immediately; the charts stream in right after with a skeleton placeholder in their place.
- `jsPDF`/`jspdf-autotable` in `Reports.tsx` are loaded via dynamic `import()` inside the export button's click handler, not at the top of the file - so visiting the Reports page never downloads them unless the user actually exports a PDF.

## 🎨 Styling

Tailwind CSS with RTL support for the Arabic interface. Colors/labels for domain concepts (issue status, priority, category, compliance, branch type, user role) live in `utils/labels.ts` - update them there, not per-page.

---

**Part of Seafood QMS - Quality Management System**
