import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/issues', authenticateToken, (req: Request, res: Response) => {
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

export default router;
