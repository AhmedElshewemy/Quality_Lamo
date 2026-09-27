# Multi-stage build for production — client and server are built separately

# ---- Stage 1: Build frontend (client) ----
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: Build backend (server) ----
FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ---- Stage 3: Production image ----
FROM node:18-alpine
WORKDIR /app

# Install production-only backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy compiled backend and built frontend
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# server/src/index.ts resolves the frontend at ../../client/dist relative to server/dist,
# so this must be run from /app with that same layout.
CMD ["node", "server/dist/index.js"]
