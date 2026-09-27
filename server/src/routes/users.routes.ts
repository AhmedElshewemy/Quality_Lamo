import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const VALID_ROLES = ['quality_engineer', 'quality_manager', 'admin'];

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, branch_id as branch FROM users ORDER BY name').all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, branch_id as branch FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Creating accounts is admin-only - a quality_manager can manage issues but
// not mint new logins, which is a more sensitive action.
router.post('/', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password و role مطلوبين' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'role غير صحيح' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور لازم تكون 8 حروف على الأقل' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // Only engineers are tied to a specific branch; managers/admins oversee everything.
    const resolvedBranchId = role === 'quality_engineer' ? branchId || null : null;

    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, passwordHash, role, resolvedBranchId);

    res.status(201).json({ id, name, email, role, branch: resolvedBranchId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
