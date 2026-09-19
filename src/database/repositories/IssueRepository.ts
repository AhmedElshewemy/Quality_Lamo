/**
 * Issue Repository
 * 
 * Handles all database operations for issues.
 */

import { BaseRepository } from './BaseRepository';
import { Issue } from '../../types';

export class IssueRepository extends BaseRepository<Issue> {
  protected tableName = 'issues';

  /**
   * Map database row to Issue object
   */
  protected mapRow(row: any): Issue {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      branchId: row.branch_id,
      category: row.category,
      priority: row.priority,
      status: row.status,
      complianceStatus: row.compliance_status,
      images: JSON.parse(row.images || '[]'),
      reportedBy: row.reported_by,
      reportedAt: row.reported_at,
      resolvedAt: row.resolved_at,
      resolutionNotes: row.resolution_notes,
      assignedTo: row.assigned_to,
      followUpDate: row.follow_up_date,
    };
  }

  /**
   * Create a new issue
   */
  create(issue: Omit<Issue, 'id'>): string {
    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.insert({
      id,
      title: issue.title,
      description: issue.description,
      branch_id: issue.branchId,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      compliance_status: issue.complianceStatus,
      images: JSON.stringify(issue.images || []),
      reported_by: issue.reportedBy,
      reported_at: issue.reportedAt,
      resolved_at: issue.resolvedAt,
      resolution_notes: issue.resolutionNotes,
      assigned_to: issue.assignedTo,
      follow_up_date: issue.followUpDate,
    });

    return id;
  }

  /**
   * Update an issue
   */
  updateIssue(id: string, updates: Partial<Issue>): void {
    const mappedUpdates: any = {};
    
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.branchId !== undefined) mappedUpdates.branch_id = updates.branchId;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.complianceStatus !== undefined) mappedUpdates.compliance_status = updates.complianceStatus;
    if (updates.images !== undefined) mappedUpdates.images = JSON.stringify(updates.images);
    if (updates.reportedBy !== undefined) mappedUpdates.reported_by = updates.reportedBy;
    if (updates.reportedAt !== undefined) mappedUpdates.reported_at = updates.reportedAt;
    if (updates.resolvedAt !== undefined) mappedUpdates.resolved_at = updates.resolvedAt;
    if (updates.resolutionNotes !== undefined) mappedUpdates.resolution_notes = updates.resolutionNotes;
    if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = updates.assignedTo;
    if (updates.followUpDate !== undefined) mappedUpdates.follow_up_date = updates.followUpDate;

    super.update(id, mappedUpdates);
  }

  /**
   * Delete an issue
   */
  deleteIssue(id: string): void {
    super.delete(id);
  }

  /**
   * Find issues by branch
   */
  findByBranch(branchId: string): Issue[] {
    return this.findWhere('branch_id = ?', [branchId]);
  }

  /**
   * Find issues by user (reported by)
   */
  findByUser(userId: string): Issue[] {
    return this.findWhere('reported_by = ?', [userId]);
  }

  /**
   * Find issues by status
   */
  findByStatus(status: string): Issue[] {
    return this.findWhere('status = ?', [status]);
  }

  /**
   * Find issues by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Issue[] {
    return this.findWhere('reported_at >= ? AND reported_at <= ?', [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);
  }

  /**
   * Find issues by compliance status
   */
  findByComplianceStatus(complianceStatus: string): Issue[] {
    return this.findWhere('compliance_status = ?', [complianceStatus]);
  }

  /**
   * Search issues by title or description
   */
  search(query: string): Issue[] {
    return this.findWhere('(title LIKE ? OR description LIKE ?)', [
      `%${query}%`,
      `%${query}%`,
    ]);
  }

  /**
   * Get issues with multiple filters
   */
  findWithFilters(filters: {
    branchId?: string;
    status?: string;
    category?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
  }): Issue[] {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.branchId) {
      conditions.push('branch_id = ?');
      params.push(filters.branchId);
    }
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    if (filters.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }
    if (filters.startDate) {
      conditions.push('reported_at >= ?');
      params.push(filters.startDate.toISOString());
    }
    if (filters.endDate) {
      conditions.push('reported_at <= ?');
      params.push(filters.endDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    return this.findWhere(whereClause, params);
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
  } {
    return {
      total: this.count(),
      open: this.count('status = ?', ['open']),
      inProgress: this.count('status = ?', ['in_progress']),
      resolved: this.count('status IN (?, ?)', ['resolved', 'closed']),
      critical: this.count('priority = ? AND status NOT IN (?, ?)', ['critical', 'resolved', 'closed']),
    };
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats(): {
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    complianceRate: number;
  } {
    const total = this.count();
    const compliant = this.count('compliance_status = ?', ['compliant']);
    const partiallyCompliant = this.count('compliance_status = ?', ['partially_compliant']);
    const nonCompliant = this.count('compliance_status = ?', ['non_compliant']);

    return {
      compliant,
      partiallyCompliant,
      nonCompliant,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
    };
  }
}

// Export singleton instance
export const issueRepository = new IssueRepository();
