/**
 * Issue Service
 * 
 * Business logic layer for issue management.
 * Acts as intermediary between UI and data access layer.
 */

import { issueRepository } from '../database/repositories';
import { Issue } from '../types';

export class IssueService {
  /**
   * Get all issues
   */
  getAllIssues(): Issue[] {
    return issueRepository.findAll();
  }

  /**
   * Get issue by ID
   */
  getIssueById(id: string): Issue | null {
    return issueRepository.findById(id);
  }

  /**
   * Create a new issue
   */
  createIssue(issue: Omit<Issue, 'id'>): string {
    return issueRepository.create(issue);
  }

  /**
   * Update an issue
   */
  updateIssue(id: string, updates: Partial<Issue>): void {
    issueRepository.updateIssue(id, updates);
  }

  /**
   * Delete an issue
   */
  deleteIssue(id: string): void {
    issueRepository.deleteIssue(id);
  }

  /**
   * Resolve an issue
   */
  resolveIssue(id: string, resolutionNotes: string): void {
    issueRepository.updateIssue(id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    });
  }

  /**
   * Get issues by branch
   */
  getIssuesByBranch(branchId: string): Issue[] {
    return issueRepository.findByBranch(branchId);
  }

  /**
   * Get issues by user
   */
  getIssuesByUser(userId: string): Issue[] {
    return issueRepository.findByUser(userId);
  }

  /**
   * Get issues by status
   */
  getIssuesByStatus(status: string): Issue[] {
    return issueRepository.findByStatus(status);
  }

  /**
   * Get issues by date range
   */
  getIssuesByDateRange(startDate: Date, endDate: Date): Issue[] {
    return issueRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Search issues
   */
  searchIssues(query: string): Issue[] {
    return issueRepository.search(query);
  }

  /**
   * Get issues with filters
   */
  getIssuesWithFilters(filters: {
    branchId?: string;
    status?: string;
    category?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
  }): Issue[] {
    return issueRepository.findWithFilters(filters);
  }

  /**
   * Get issue statistics
   */
  getIssueStats() {
    return issueRepository.getStats();
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats() {
    return issueRepository.getComplianceStats();
  }

  /**
   * Get weekly comparison
   */
  getWeeklyComparison() {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const thisWeekIssues = issueRepository.findByDateRange(thisWeekStart, now);
    const lastWeekIssues = issueRepository.findByDateRange(lastWeekStart, lastWeekEnd);

    const change = lastWeekIssues.length > 0 
      ? Math.round(((thisWeekIssues.length - lastWeekIssues.length) / lastWeekIssues.length) * 100)
      : thisWeekIssues.length > 0 ? 100 : 0;

    return {
      thisWeek: thisWeekIssues.length,
      lastWeek: lastWeekIssues.length,
      change,
    };
  }

  /**
   * Get monthly comparison
   */
  getMonthlyComparison() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const thisMonthIssues = issueRepository.findByDateRange(thisMonthStart, now);
    const lastMonthIssues = issueRepository.findByDateRange(lastMonthStart, lastMonthEnd);

    const change = lastMonthIssues.length > 0 
      ? Math.round(((thisMonthIssues.length - lastMonthIssues.length) / lastMonthIssues.length) * 100)
      : thisMonthIssues.length > 0 ? 100 : 0;

    return {
      thisMonth: thisMonthIssues.length,
      lastMonth: lastMonthIssues.length,
      change,
    };
  }
}

// Export singleton instance
export const issueService = new IssueService();
