# Deployment Guide

This project supports two practical deployment paths, and everything below reflects the files that actually exist in this repository rather than theoretical options.

---

## Method 1: Docker (recommended for real deployment)

The repository already includes a `Dockerfile`, which builds the frontend and backend in separate stages and produces a working single image.

```bash
# Set secrets in a .env file next to docker-compose.yml
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

docker compose up -d --build
```

After that, the app is available at `http://localhost:3001`.

Key notes for `docker-compose.yml`:
- `DB_PATH=/app/data/seafood_qms.db` must live inside the mounted volume (`volumes: app-data:/app/data`), or the database will be lost on restarts.
- `JWT_SECRET` is read from your local `.env` file, not from `server/.env`; change it to a real random value before any real deployment.
- The health check uses `/api/health`; if the container remains unhealthy, inspect the logs with `docker compose logs -f`.

Create a database backup:
```bash
docker compose cp app:/app/data/seafood_qms.db ./backup-$(date +%Y%m%d).db
```
There is no automatic backup mechanism currently built in. This is handled manually or by your own server cron/job process.

---

## Method 2: Direct Node.js deployment without Docker

This is useful for a simple VPS or for testing without Docker.

```bash
npm run install:all
npm run build

# Set server/.env (PORT, JWT_SECRET, DB_PATH, CLIENT_URL) - see README.md
npm start
```

`npm start` at the project root runs `server/dist/index.js`, which serves both the API and the built frontend (`client/dist`) on the same port.

If you want the app to continue running after closing the terminal, use a process manager already available on the server such as `pm2`, `systemd`, `screen`, or similar. No project-specific process manager is required.

---

## Before you deploy

- [ ] `JWT_SECRET` has been changed from the default placeholder
- [ ] `client/.env` uses `VITE_API_URL=/api` before the final build
- [ ] The database (`seafood_qms.db`) is stored in a persistent location (Docker volume or a stable server path)
- [ ] `/api/health` returns `200` from the final domain
- [ ] Review `SECURITY.md` and `PRODUCTION_CHECKLIST.md` for any remaining production gaps

---

**Part of Seafood QMS - Quality Management System**
