# 🏗️ Architecture Overview / نظرة عامة على البنية

> This replaces the old `ARCHITECTURE.md` and `ARCHITECTURE_AR.md`, which described a "Clean Architecture" with Repository/Service layers (`IssueRepository`, `UserService`, `DatabaseManager`, ...) that never actually existed in this codebase. The real architecture is simpler and is documented once here instead of duplicated across two files that could drift out of sync.

## The real shape of the system

```
┌─────────────────────────────────────────────┐
│  Browser                                     │
│  React app (client/) - pages, contexts,      │
│  hooks, one shared labels/colors file        │
└───────────────────┬───────────────────────────┘
                    │ fetch('/api/...')  [see README.md → Configuration]
                    ▼
┌─────────────────────────────────────────────┐
│  Express app (server/)                       │
│  index.ts → middleware → routes/*.routes.ts  │
│  Each route file talks to `db` directly -    │
│  there is no repository/service layer        │
└───────────────────┬───────────────────────────┘
                    │ better-sqlite3 (synchronous)
                    ▼
┌─────────────────────────────────────────────┐
│  SQLite file (server/seafood_qms.db)          │
└─────────────────────────────────────────────┘
```

For the exact file tree on both sides, see `PROJECT_STRUCTURE.md` - it's kept as the single source of truth for "what file does what" so this document doesn't duplicate it and drift.

## Why no repository/service layer

The dataset here is small (a handful of branches, a few hundred issues at most) and the queries are simple CRUD with a couple of filters. A route handler in `server/src/routes/issues.routes.ts` calling `db.prepare(...).all()` directly is easier to read and trace than an abstraction with `IssueRepository` → `IssueService` → route, for the amount of logic actually involved. If the query complexity grows significantly, extracting a query layer would be a reasonable next step - but adding it now, for what exists today, would be indirection without a payoff.

## The one non-obvious architectural rule worth knowing

Every read from the `issues` table must go through `mapIssueRow()` (`server/src/utils/mapIssueRow.ts`) before it reaches `res.json(...)`. SQLite's columns are snake_case (`branch_id`, `reported_at`); the client's `Issue` type is camelCase (`branchId`, `reportedAt`). Skipping this mapping is the single most common way to silently break the frontend - see `DATABASE_GUIDE.md` for the full explanation.

## Frontend structure

Covered in `client/README.md` (pages, hooks, `utils/labels.ts`, lazy-loading strategy). Not repeated here to avoid the same duplication problem this file used to have with its old Arabic twin.

---

**Part of Seafood QMS - Quality Management System**
