# Project Summary - Actual Status

> This file replaces an older summary that described features that were planned but never actually implemented, such as Zod validation, a logger module, and Firebase integration. The content below describes only what exists and works in the codebase today.

## ✅ What is built and working

### Real backend (Express + SQLite)
- Real JWT authentication with bcrypt password hashing
- Role-based access control (`requireRole`) on sensitive endpoints
- Modular structure: `routes/`, `db/`, `middleware/`, `utils/`, `config/`
- See `server/README.md`, `AUTH_GUIDE.md`, `DATABASE_GUIDE.md`, and `SECURITY.md`

### Complete frontend (6 functional pages, not placeholders)
- Dashboard: KPI cards + 4 charts + recent issues table, filtered by role (engineers only see their own data; managers see the whole company)
- Report issue: full issue form with photo uploads and real API integration
- My issues / all issues: filters for status, category, and branch; resolve and delete actions for managers/admins
- Branches: overview of each location with compliance statistics
- Staff: team overview with per-user stats
- Reports: time filters, charts, and real PDF export

### Responsiveness and performance
- Responsive sidebar with a mobile drawer and desktop fixed layout
- Each page is lazy-loaded with `React.lazy`
- Charts are isolated from the rest of the dashboard and jsPDF loads on demand when needed
- See `TECH_STACK.md` for the real performance details

## ⚠️ What is not yet built

- Structured or persistent logging - only `console.log` / `console.error` are used
- Automated database backups
- Input validation library such as Zod - validation is still manual in each route
- ESLint / Prettier configuration files
- Refresh tokens / password reset flow
- Add-user UI page - current creation is done via seed data or direct SQL under the current setup
- Arabic support in PDF export - jsPDF uses embedded English labels and does not support Arabic text out of the box

## 📚 Documentation guide

| If you want to know | Read |
|---|---|
| How to run the project | `README.md`, `RUNNING.md` |
| File structure in detail | `PROJECT_STRUCTURE.md` |
| Overall architecture | `ARCHITECTURE.md` |
| Technologies actually used | `TECH_STACK.md` |
| Database schema and tables | `DATABASE_GUIDE.md` |
| Login and permissions | `AUTH_GUIDE.md` |
| Security details | `SECURITY.md` |
| Production deployment | `DEPLOYMENT.md`, `PRODUCTION_CHECKLIST.md` |

---

**Part of Seafood QMS - Quality Management System**
