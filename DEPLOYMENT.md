# Deployment Guide

This project supports two practical deployment paths, and everything below reflects the files that actually exist in this repository rather than theoretical options.

---

## Method 1: Docker (recommended for real deployment)

The repository already includes a `Dockerfile`, which builds the frontend and backend in separate stages and produces a working single image.

```bash
# Set the domain and a strong secret in a .env file next to docker-compose.yml
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "CLIENT_URL=https://quality.lamo2a5za.cloud" >> .env

docker compose up -d --build
```

The app listens on `127.0.0.1:3001` on the server, so a host-installed Caddy can proxy to it. It is not published directly on the server's public network interfaces.

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

## Method 3: Put Caddy in front of the app (recommended for a custom domain)

If you do not want users to access the app by raw IP and port, place Caddy in front of the Node app and use your own domain instead.

The application itself still runs internally on port `3001`, but Caddy handles public HTTPS traffic and proxies requests to the app.

Example Caddyfile:

```caddyfile
your-domain.com {
	encode gzip
	reverse_proxy 127.0.0.1:3001
}
```

Typical setup:

1. Deploy the app on the server and keep it listening on `:3001`.
2. Install Caddy and place the above `Caddyfile` on the machine.
3. Point your DNS record to the server IP for `your-domain.com`.
4. Open ports `80` and `443` on the server.
5. Set the application environment to the real domain:

```bash
export CLIENT_URL="https://quality.lamo2a5za.cloud"
export JWT_SECRET="your-very-strong-secret"
```

In Docker mode, the Compose port binding is restricted to `127.0.0.1:3001`, and Caddy on the host proxies `https://your-domain.com` to `http://127.0.0.1:3001`. Set `CLIENT_URL=https://your-domain.com` in the `.env` file used by Compose so the server's CORS origin matches the domain.

This avoids exposing the direct server IP and keeps the public URL clean and production-friendly.

---

---

## Before you deploy

- [ ] `JWT_SECRET` has been changed from the default placeholder
- [ ] `client/.env` uses `VITE_API_URL=/api` before the final build
- [ ] A real domain is configured and Caddy is proxying to the app instead of exposing the raw IP
- [ ] The database (`seafood_qms.db`) is stored in a persistent location (Docker volume or a stable server path)
- [ ] `/api/health` returns `200` from the final domain
- [ ] Review `SECURITY.md` and `PRODUCTION_CHECKLIST.md` for any remaining production gaps

---

**Part of Seafood QMS - Quality Management System**
