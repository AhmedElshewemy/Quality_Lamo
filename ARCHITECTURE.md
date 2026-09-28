# Architecture Overview

> This document replaces the old architecture documentation that described a "Clean Architecture" with repository/service layers (`IssueRepository`, `UserService`, `DatabaseManager`, and similar) that never existed in this codebase. The real system is simpler and is documented here once to avoid duplication and drift.

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

For the exact file tree on both sides, see `PROJECT_STRUCTURE.md`. That document acts as the single source of truth for "what file does what" so this one does not duplicate it and drift over time.

## Why there is no repository/service layer

The dataset is small (a handful of branches and only a few hundred issues at most), and the queries are simple CRUD operations with a few filters. A route handler in `server/src/routes/issues.routes.ts` that calls `db.prepare(...).all()` directly is easier to read and trace than a layered abstraction such as `IssueRepository` → `IssueService` → route, especially for the amount of logic actually implemented. If the query complexity grows significantly, extracting a query layer would be a reasonable next step, but adding it now would create indirection without a payoff.

## The one non-obvious architectural rule to know

Every read from the `issues` table must pass through `mapIssueRow()` in `server/src/utils/mapIssueRow.ts` before it reaches `res.json(...)`. SQLite columns are snake_case (`branch_id`, `reported_at`), while the client's issue type is camelCase (`branchId`, `reportedAt`). Skipping this transformation is the single most common way to silently break the frontend. See `DATABASE_GUIDE.md` for the full explanation.

## Frontend structure

The frontend structure is covered in `client/README.md`, including pages, hooks, `utils/labels.ts`, and the lazy-loading strategy. It is not repeated here to avoid duplication.

---

**Part of Seafood QMS - Quality Management System**
