# Quick Start Guide

For the full setup details, permissions, and troubleshooting, refer to `README.md`. This file only covers the commands.

## First-time installation

```bash
npm run install:all
```

## Development

```bash
npm run dev
```
This starts the frontend (`http://localhost:5173`) and backend (`http://localhost:3001`) together. Vite automatically proxies `/api` requests to the backend, as configured in `client/vite.config.ts`.

## Production

```bash
npm run build   # Build frontend and backend
npm start       # Start the server; it serves both the API and built frontend on port 3001
```

## Default login accounts (seeded on first run)

| Role | Email | Password |
|---|---|---|
| System Administrator | `admin@seafood.com` | `Admin@123456` |
| Quality Manager | `sara@seafood.com` | `Manager@123` |
| Quality Engineer | `ahmed@seafood.com` | `Engineer@123` |

See `AUTH_GUIDE.md` for the full account table and role details.

## If something is not working

Check `README.md` in the troubleshooting section. It includes the real issues observed during setup, such as login failures after changing the port and the server not picking up a changed `.env` value.

---

**Part of Seafood QMS - Quality Management System**
