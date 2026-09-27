// Maps a raw SQLite issues row (snake_case) to the camelCase shape the client's
// Issue type expects. All issue read/write endpoints must go through this so the
// API contract stays consistent no matter which column names SQLite uses internally.
export const mapIssueRow = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  branchId: row.branch_id,
  category: row.category,
  priority: row.priority,
  status: row.status,
  complianceStatus: row.compliance_status,
  images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
  reportedBy: row.reported_by,
  reportedAt: row.reported_at,
  resolvedAt: row.resolved_at,
  resolutionNotes: row.resolution_notes,
  assignedTo: row.assigned_to,
  followUpDate: row.follow_up_date,
});
