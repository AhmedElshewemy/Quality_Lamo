# Database Guide

The system uses SQLite via `better-sqlite3`. It is a single-file database (`server/seafood_qms.db`) created and initialized automatically on the first server startup. There is no Firebase or cloud database dependency.

## Database file location

The file path is defined in `server/.env`:
```bash
DB_PATH=./seafood_qms.db
```
This is a relative path from the current working directory, typically `server/`. In Docker, the file is stored under `/app/data` as defined by `Dockerfile`.

## Tables

### `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,       -- bcrypt hash, not plain text
  role TEXT NOT NULL,                -- 'quality_engineer' | 'quality_manager' | 'admin'
  branch_id TEXT,                    -- NULL for managers/admins (not tied to a branch)
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
  images TEXT DEFAULT '[]',                  -- JSON array of base64 data URIs
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

## camelCase in the API, snake_case in the database

Database columns use snake_case (`branch_id`, `reported_at`, ...) but API responses need camelCase (`branchId`, `reportedAt`, ...) because `client/src/types/index.ts` expects that shape.

Every read from the `issues` table must pass through `mapIssueRow()` in `server/src/index.ts` before being returned to the client. If a new endpoint returns issue rows, use this mapping instead of returning the raw row object:

```ts
const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
res.json(mapIssueRow(issue));   // ✅
res.json(issue);                // ❌ returns snake_case and breaks the frontend
```

The `users` table follows the same pattern: the query selects `branch_id as branch` instead of relying on a separate helper.

## Seed data

On first startup, if the `users` table is empty, the server seeds the database with:
- 3 users (`admin`, `quality_manager`, `quality_engineer`)
- 4 branches (3 restaurant branches + central kitchen/warehouse)
- several demo issues

To start with a completely empty database, remove the database file and any WAL/SHM files, then restart the server:

```bash
cd server
rm -f seafood_qms.db seafood_qms.db-shm seafood_qms.db-wal
npm run dev
```

## Manual database checks

```bash
sqlite3 server/seafood_qms.db
.tables
SELECT id, name, email, role FROM users;
SELECT id, name, type FROM branches;
.quit
```

## Upgrading to a larger database (PostgreSQL/MySQL)

SQLite is sufficient for the current scale (small team, limited number of branches). If usage grows enough to require a separate database engine (multi-instance deployment, replication, etc.), the required changes are:
1. Replace `better-sqlite3` with the appropriate driver (`pg`, `mysql2`, etc.)
2. Convert `db.prepare(...).get/all/run` calls to the async pattern of the new database library
3. Keep the `mapIssueRow()` pattern in place; it is separate from the database type and handles any object with snake_case keys

---

**Part of Seafood QMS - Quality Management System**
