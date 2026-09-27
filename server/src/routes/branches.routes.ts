import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const branches = db.prepare('SELECT * FROM branches ORDER BY name').all();
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
