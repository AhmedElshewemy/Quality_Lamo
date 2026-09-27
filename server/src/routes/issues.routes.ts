import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { mapIssueRow } from '../utils/mapIssueRow.js';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
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

    res.json(issues.map(mapIssueRow));
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id) as any;

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(mapIssueRow(issue));
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, (req: Request, res: Response) => {
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

    res.status(201).json(mapIssueRow(issue));
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // Map camelCase (client) to snake_case (DB columns)
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

    const columns = Object.keys(mappedUpdates).map((key) => `${key} = ?`).join(', ');
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

    res.json(mapIssueRow(issue));
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletion is restricted to managers/admins, enforced here regardless of the
// UI - a direct API call from another role gets a 403.
router.delete('/:id', authenticateToken, requireRole('admin', 'quality_manager'), (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
