# Authentication Guide

## Overview

Authentication is handled entirely by the server. User passwords are stored as hashed values in the SQLite database using `bcrypt`, and login returns a JWT token valid for 24 hours. No passwords or sensitive values are stored in `.env` files or in the frontend source code.

See `DATABASE_GUIDE.md` for table details and `SECURITY.md` for the security model.

---

## Default login accounts (seed data)

These demo accounts are created automatically if the `users` table is empty on first startup. They are defined in `server/src/index.ts` inside `seedInitialData()`.

### Admin
```
admin@seafood.com / Admin@123456
```
Role: `admin` - full system privileges, not tied to a specific branch.

### Quality Manager
```
sara@seafood.com / Manager@123
```
Role: `quality_manager` - can view all branches and all issues and can delete issues.

### Quality Engineers - each one is tied to a branch
| Email | Password | Branch |
|---|---|---|
| `ahmed@seafood.com` | `Engineer@123` | Al-Maadi branch (`branch-1`) |
| `mahmoud@seafood.com` | `Engineer@123` | Nasr City branch (`branch-2`) |
| `khaled@seafood.com` | `Engineer@123` | Fifth Settlement branch (`branch-3`) |

Role: `quality_engineer` - can see only their own data (issues they created) across the dashboard and "My Issues" page.

Refer to `README.md` for the full role matrix and the differences between backend and frontend permissions.

---

## Production setup (remove demo data and retain one real admin)

The `server/` folder contains a ready-to-use script that removes all seeded users and issues, keeps the branch records, and creates a single real admin account using your own details:

```bash
cd server
npm run build   # if build has not been run yet

ADMIN_NAME="Your real name" \
ADMIN_EMAIL="you@yourcompany.com" \
ADMIN_PASSWORD="a-real-strong-password" \
npm run reset-for-production -- --confirm
```

The `--confirm` flag is required. Without it, the script refuses to proceed to prevent accidental data loss. After it runs:
1. Sign in with the new admin account
2. From the Staff page, add the rest of the team with real credentials

Warning: this script deletes everything currently in the database at runtime. If you already have real data (issues, users, production records) that must be retained, do not run it. It is intended for a one-time reset before the system is used in real production.

---

## How to add or update a user

### Add a user from the UI (standard method)

The Staff page includes an "+ Add User" button, visible only to admins (`admin`). The form asks for name, email, password (minimum 8 characters), role, and branch (when the role is quality engineer). It prevents duplicate emails and returns a clear error on failure.

At the server level, `POST /api/users` is protected by `requireRole('admin')`. Even if a quality manager attempts to call the API directly, the server responds with `403`.

### Update or delete a user

There is no update or delete user endpoint in the current codebase beyond creation. If you need to edit or remove an account, use direct SQL as shown below.

### Direct database update (SQL)

```bash
cd server
node -e "
const Database = require('better-sqlite3');
const db = new Database('./seafood_qms.db');
db.prepare('UPDATE users SET role = ? WHERE email = ?').run('quality_manager', 'user@seafood.com');
console.log('User updated');
"
```

---

## Password requirements

No password strength validation is currently implemented in the codebase. The login route only verifies the stored hash. If you want to add a password policy while creating a user, that is the proper place to enforce it.

---

## Security currently in place

✅ Password hashing with `bcrypt` and 10 salt rounds
✅ JWT tokens valid for 24 hours
✅ Rate limiting (100 requests per 15 minutes)
✅ Role-based access control on sensitive endpoints
✅ Token stored in frontend `sessionStorage` and sent as `Authorization: Bearer <token>`

⚠️ Not yet implemented but worth adding before real production use:
- Two-factor authentication
- Password reset flow
- Refresh tokens (once the 24-hour JWT expires, the user must sign in again)
- Account lockout after repeated failed attempts (current rate limiting is global, not login-specific)

---

## Troubleshooting

### "Email or password is incorrect" even when credentials are right

The most common cause is an outdated frontend configuration in `client/.env`. Vite injects `VITE_API_URL` at build time, not runtime. The fix is:

```bash
cd client
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Login returns a network error instead of an auth failure

Ensure the backend is running on the port configured in `server/.env`:

```bash
curl http://localhost:3001/api/health
```

### You want a completely clean demo state

There is no flag to disable seeding currently. The easiest method is to remove the seeded arrays in `seedInitialData()` temporarily, or delete the database and let it reseed before manually cleaning up the demo users after creating your own admin account.

---

**Part of Seafood QMS - Quality Management System**
