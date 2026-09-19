/**
 * Branch Service
 * 
 * Business logic layer for branch management.
 */

import { branchRepository } from '../database/repositories';
import { issueRepository } from '../database/repositories';
import { Branch } from '../types';

export class BranchService {
  /**
   * Get all branches
   */
  getAllBranches(): Branch[] {
    return branchRepository.findAll();
  }

  /**
   * Get branch by ID
   */
  getBranchById(id: string): Branch | null {
    return branchRepository.findById(id);
  }

  /**
   * Create a new branch
   */
  createBranch(branch: Omit<Branch, 'id'>): string {
    return branchRepository.create(branch);
  }

  /**
   * Update a branch
   */
  updateBranch(id: string, updates: Partial<Branch>): void {
    branchRepository.updateBranch(id, updates);
  }

  /**
   * Delete a branch
   */
  deleteBranch(id: string): void {
    branchRepository.deleteBranch(id);
  }

  /**
   * Get branches by type
   */
  getBranchesByType(type: string): Branch[] {
    return branchRepository.findByType(type);
  }

  /**
   * Get branch with issue statistics
   */
  getBranchWithStats(branchId: string): {
    branch: Branch | null;
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    complianceRate: number;
  } {
    const branch = branchRepository.findById(branchId);
    if (!branch) {
      return {
        branch: null,
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        complianceRate: 0,
      };
    }

    const issues = issueRepository.findByBranch(branchId);
    const openIssues = issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const resolvedIssues = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const compliantIssues = issues.filter(i => i.complianceStatus === 'compliant').length;
    const complianceRate = issues.length > 0 ? Math.round((compliantIssues / issues.length) * 100) : 100;

    return {
      branch,
      totalIssues: issues.length,
      openIssues,
      resolvedIssues,
      complianceRate,
    };
  }

  /**
   * Get all branches with statistics
   */
  getAllBranchesWithStats(): Array<{
    branch: Branch;
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    complianceRate: number;
  }> {
    const branches = branchRepository.findAll();
    return branches.map(branch => {
      const stats = this.getBranchWithStats(branch.id);
      return {
        branch,
        totalIssues: stats.totalIssues,
        openIssues: stats.openIssues,
        resolvedIssues: stats.resolvedIssues,
        complianceRate: stats.complianceRate,
      };
    });
  }
}

// Export singleton instance
export const branchService = new BranchService();
