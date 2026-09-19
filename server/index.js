/**
 * Backend API Server
 * 
 * Production-ready Express server with SQLite
 * 
 * To run:
 * npm install express better-sqlite3 cors helmet express-rate-limit bcryptjs jsonwebtoken
 * node server/index.js
 */

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
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
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Database setup
const db = new Database('seafood_qms.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDB = () => {
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
  `);

  console.log('✅ Database initialized');
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
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

// Issues routes
app.get('/api/issues', authenticateToken, (req, res) => {
  try {
    const { branch, status, category, priority, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];

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

    const issues = db.prepare(query).all(...params);
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/issues/:id', authenticateToken, (req, res) => {
  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/issues', authenticateToken, (req, res) => {
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

    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    db.prepare(`
      INSERT INTO issues (id, title, description, branch_id, category, priority, compliance_status, images, reported_by, reported_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, branchId, category, priority, complianceStatus, JSON.stringify(images || []), reportedBy, reportedAt);

    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/issues/:id', authenticateToken, (req, res) => {
  try {
    const updates = req.body;
    const columns = Object.keys(updates).map(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbKey} = ?`;
    }).join(', ');

    const values = Object.values(updates);
    
    db.prepare(`
      UPDATE issues 
      SET ${columns}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, req.params.id);

    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/issues/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Branches routes
app.get('/api/branches', authenticateToken, (req, res) => {
  try {
    const branches = db.prepare('SELECT * FROM branches ORDER BY name').all();
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, branch_id FROM users ORDER BY name').all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistics routes
app.get('/api/stats/issues', authenticateToken, (req, res) => {
  try {
    const stats = {
      total: db.prepare('SELECT COUNT(*) as count FROM issues').get().count,
      open: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'open'").get().count,
      inProgress: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'").get().count,
      resolved: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status IN ('resolved', 'closed')").get().count,
      critical: db.prepare("SELECT COUNT(*) as count FROM issues WHERE priority = 'critical' AND status NOT IN ('resolved', 'closed')").get().count,
    };
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
initDB();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
