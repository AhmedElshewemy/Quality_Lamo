import express, { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'seafood_qms.db');
const CLIENT_DIST_PATH = process.env.CLIENT_DIST_PATH || path.join(__dirname, '..', '..', 'client', 'dist');

// ============================================
// Initialize Express App
// ============================================

const app = express();

// ============================================
// Middleware
// ============================================

// Security
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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// ============================================
// Database Setup
// ============================================

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDB = () => {
  console.log('🗄️  Initializing database...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      branch_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      compliance_status TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      reported_by TEXT NOT NULL,
      reported_at DATETIME NOT NULL,
      resolved_at DATETIME,
      resolution_notes TEXT,
      assigned_to TEXT,
      follow_up_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (reported_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_issues_branch ON issues(branch_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_issues_reported_at ON issues(reported_at);
    CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON issues(reported_by);
  `);

  console.log('✅ Database tables created');

  // Seed initial data if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedInitialData();
  }
};

// Seed initial data
const seedInitialData = () => {
  console.log('🌱 Seeding initial data...');

  // Create branches
  const branches = [
    ['branch-1', 'فرع المعادي', 'المعادي، القاهرة', 'branch'],
    ['branch-2', 'فرع مدينة نصر', 'مدينة نصر، القاهرة', 'branch'],
    ['branch-3', 'فرع التجمع الخامس', 'التجمع الخامس، القاهرة الجديدة', 'branch'],
    ['headquarters', 'الإدارة الرئيسية', 'المهندسين، الجيزة', 'headquarters'],
    ['central-kitchen', 'المطبخ المركزي', 'العاشر من رمضان', 'central_kitchen'],
    ['main-warehouse', 'المخزن الرئيسي', 'العبور، القاهرة', 'main_warehouse'],
  ];

  const insertBranch = db.prepare(
    'INSERT INTO branches (id, name, location, type) VALUES (?, ?, ?, ?)'
  );

  for (const branch of branches) {
    insertBranch.run(...branch);
  }

  // Create users with hashed passwords
  const users = [
    ['admin-1', 'مدير النظام', 'admin@seafood.com', 'Admin@123456', 'admin', null],
    ['manager-1', 'د. سارة أحمد', 'sara@seafood.com', 'Manager@123', 'quality_manager', null],
    ['user-1', 'أحمد محمد', 'ahmed@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-1'],
    ['user-2', 'محمود علي', 'mahmoud@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-2'],
    ['user-3', 'خالد حسن', 'khaled@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-3'],
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const user of users) {
    const [id, name, email, password, role, branchId] = user;
    const passwordHash = bcrypt.hashSync(password as string, 10);
    insertUser.run(id, name, email, passwordHash, role, branchId);
  }

  // Create sample issues
  const now = new Date();
  const daysAgo = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  };

  const issues = [
    ['issue-1', 'ارتفاع درجة حرارة الثلاجة الرئيسية', 'تم رصد ارتفاع في درجة حرارة الثلاجة الرئيسية عن المعدل المطلوب', 'branch-1', 'temperature', 'critical', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(2), daysAgo(1), 'تم إصلاح الثلاجة وضبط الحرارة', null, null],
    ['issue-2', 'عدم ارتداء قفازات أثناء تحضير الطعام', 'لاحظ عدم ارتداء بعض العاملين للقفازات', 'branch-2', 'hygiene', 'high', 'in_progress', 'partially_compliant', '[]', 'user-2', daysAgo(5), null, null, 'user-2', null],
    ['issue-3', 'تخزين منتجات منتهية الصلاحية', 'تم العثور على بعض المنتجات منتهية الصلاحية', 'main-warehouse', 'storage', 'high', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(10), daysAgo(8), 'تم التخلص من المنتجات', null, null],
    ['issue-4', 'عدم وجود سجلات تنظيف يومية', 'سجلات التنظيف اليومية غير مكتملة', 'branch-3', 'documentation', 'medium', 'open', 'partially_compliant', '[]', 'user-3', daysAgo(3), null, null, null, null],
    ['issue-5', 'تسريب مياه في منطقة التحضير', 'يوجد تسريب مياه بالقرب من منطقة تحضير الخضروات', 'central-kitchen', 'equipment', 'medium', 'in_progress', 'partially_compliant', '[]', 'user-1', daysAgo(7), null, null, 'user-1', null],
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, title, description, branch_id, category, priority, status, compliance_status, images, reported_by, reported_at, resolved_at, resolution_notes, assigned_to, follow_up_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const issue of issues) {
    insertIssue.run(...issue);
  }

  console.log('✅ Initial data seeded');
};

// ============================================
// Authentication Middleware
// ============================================

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user as JwtPayload;
    next();
  });
};

// ============================================
// Auth Routes
// ============================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// Issues Routes
// ============================================

app.get('/api/issues', authenticateToken, (req: Request, res: Response) => {
  try {
    const { branch, status, category, priority, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params: any[] = [];

    if (branch) {
      query += ' AND branch_id = ?';
      params.push(branch);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (startDate) {
      query += ' AND reported_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND reported_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY reported_at DESC';

    const issues = db.prepare(query).all(...params) as any[];
    
    // Parse images JSON
    const parsedIssues = issues.map(issue => ({
      ...issue,
      images: JSON.parse(issue.images || '[]'),
    }));

    res.json(parsedIssues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/issues/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id) as any;
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Parse images JSON
    issue.images = JSON.parse(issue.images || '[]');
    
    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/issues', authenticateToken, (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      branchId,
      category,
      priority,
      complianceStatus,
      images,
      reportedBy,
      reportedAt,
    } = req.body;

    // Validation
    if (!title || !description || !branchId || !category || !priority || !complianceStatus || !reportedBy || !reportedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO issues (id, title, description, branch_id, category, priority, compliance_status, images, reported_by, reported_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      description,
      branchId,
      category,
      priority,
      complianceStatus,
      JSON.stringify(images || []),
      reportedBy,
      reportedAt
    );

    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as any;
    issue.images = JSON.parse(issue.images || '[]');
    
    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/issues/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Map camelCase to snake_case
    const mappedUpdates: any = {};
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.branchId !== undefined) mappedUpdates.branch_id = updates.branchId;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.complianceStatus !== undefined) mappedUpdates.compliance_status = updates.complianceStatus;
    if (updates.images !== undefined) mappedUpdates.images = JSON.stringify(updates.images);
    if (updates.resolvedAt !== undefined) mappedUpdates.resolved_at = updates.resolvedAt;
    if (updates.resolutionNotes !== undefined) mappedUpdates.resolution_notes = updates.resolutionNotes;
    if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = updates.assignedTo;
    if (updates.followUpDate !== undefined) mappedUpdates.follow_up_date = updates.followUpDate;

    const columns = Object.keys(mappedUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(mappedUpdates);
    
    if (values.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    db.prepare(`
      UPDATE issues 
      SET ${columns}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, req.params.id);

    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id) as any;
    issue.images = JSON.parse(issue.images || '[]');
    
    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/issues/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// Branches Routes
// ============================================

app.get('/api/branches', authenticateToken, (req: Request, res: Response) => {
  try {
    const branches = db.prepare('SELECT * FROM branches ORDER BY name').all();
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// Users Routes
// ============================================

app.get('/api/users', authenticateToken, (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, branch_id FROM users ORDER BY name').all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, branch_id FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// Statistics Routes
// ============================================

app.get('/api/stats/issues', authenticateToken, (req: Request, res: Response) => {
  try {
    const stats = {
      total: (db.prepare('SELECT COUNT(*) as count FROM issues').get() as any).count,
      open: (db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'open'").get() as any).count,
      inProgress: (db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'").get() as any).count,
      resolved: (db.prepare("SELECT COUNT(*) as count FROM issues WHERE status IN ('resolved', 'closed')").get() as any).count,
      critical: (db.prepare("SELECT COUNT(*) as count FROM issues WHERE priority = 'critical' AND status NOT IN ('resolved', 'closed')").get() as any).count,
    };
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// Health Check
// ============================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// Serve Static Files (Production)
// ============================================

// Serve static files from client/dist folder
app.use(express.static(CLIENT_DIST_PATH));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  // Don't serve index.html for API routes
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
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                       ║
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
