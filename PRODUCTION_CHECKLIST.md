# Production Readiness Checklist

This checklist reflects what is actually implemented in the code versus what still needs work before a real production deployment.

## Code quality
- [x] TypeScript strict mode (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- [x] Error boundaries (React built-in)
- [ ] ESLint / Prettier - no config files currently exist
- [ ] Validation library (Zod or equivalent) - validation is currently manual in each route

## Security (see `SECURITY.md`)
- [x] JWT authentication + bcrypt password hashing
- [x] Role-based access control (`requireRole`) on sensitive endpoints
- [x] Rate limiting, Helmet, CORS, and SQL injection prevention through parameterized queries
- [~] CSRF risk is low because JWT is sent in headers rather than cookies, but there is no explicit CSRF middleware
- [ ] Refresh tokens / password reset flow

## Database (see `DATABASE_GUIDE.md`)
- [x] Indexes + foreign keys
- [ ] Automated backups - manual backup is the current option described in `DEPLOYMENT.md`
- [ ] Upgrade plan for PostgreSQL/MySQL if volume grows beyond SQLite’s current suitability

## Performance (see `TECH_STACK.md` → performance section)
- [x] Route-level code splitting (`React.lazy` on each page)
- [x] Charts and PDF export are loaded on demand instead of at initial page load

## Logging & monitoring
- [x] `/api/health` endpoint
- [x] `console.log` / `console.error` are used for the current logging approach
- [ ] Structured or persistent logging; external tracking such as Sentry is not yet configured

## Testing
- [ ] Unit / integration / E2E tests - no test suite exists in the project yet

---

## Deployment

Refer to `DEPLOYMENT.md` for the real deployment steps (Docker or direct Node.js startup). Before deploying:

```bash
npm audit          # Check dependency vulnerabilities
npm run build      # Build the frontend and backend
curl http://localhost:3001/api/health   # Confirm the server is responding after deployment
```

Also make sure:
- [ ] `JWT_SECRET` has been replaced with a real random secret instead of the default placeholder
- [ ] `client/.env` uses `VITE_API_URL=/api` before the final build; see `README.md` if login fails after deployment

---

**Part of Seafood QMS - Quality Management System**
