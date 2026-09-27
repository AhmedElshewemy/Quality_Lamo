import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { PORT, JWT_SECRET, DB_PATH, CLIENT_DIST_PATH, CLIENT_URL, NODE_ENV } from './config/index.js';
import { db, initDB } from './db/index.js';

import authRoutes from './routes/auth.routes.js';
import issuesRoutes from './routes/issues.routes.js';
import branchesRoutes from './routes/branches.routes.js';
import usersRoutes from './routes/users.routes.js';
import statsRoutes from './routes/stats.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// ============================================
// Middleware
// ============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', healthRoutes);

// ============================================
// Serve Static Files (Production)
// ============================================

app.use(express.static(CLIENT_DIST_PATH));

// SPA fallback - serve index.html for any non-API route
app.get('/*splat', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'));
});

// ============================================
// Error Handling
// ============================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ============================================
// Start Server
// ============================================

initDB();

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Seafood QMS Backend Server                          ║
║                                                           ║
║   📡 Server running on: http://localhost:${PORT}            ║
║   🗄️  Database: SQLite (${DB_PATH})                       ║
║   🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...          ║
║   🌍 Environment: ${NODE_ENV}                       ║
║                                                           ║
║   📋 Available endpoints:                                 ║
║   - POST   /api/auth/login                               ║
║   - GET    /api/issues                                   ║
║   - POST   /api/issues                                   ║
║   - PUT    /api/issues/:id                               ║
║   - DELETE /api/issues/:id                               ║
║   - GET    /api/branches                                 ║
║   - GET    /api/users                                    ║
║   - GET    /api/stats/issues                             ║
║   - GET    /api/health                                   ║
║                                                           ║
║   🌐 Serving frontend from: ${CLIENT_DIST_PATH}           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  db.close();
  process.exit(0);
});
