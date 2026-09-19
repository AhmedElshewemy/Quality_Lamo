/**
 * Branch Repository
 * 
 * Handles all database operations for branches.
 */

import { BaseRepository } from './BaseRepository';
import { Branch } from '../../types';

export class BranchRepository extends BaseRepository<Branch> {
  protected tableName = 'branches';

  /**
   * Map database row to Branch object
   */
  protected mapRow(row: any): Branch {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      type: row.type,
    };
  }

  /**
   * Find branches by type
   */
  findByType(type: string): Branch[] {
    return this.findWhere('type = ?', [type]);
  }

  /**
   * Create a new branch
   */
  create(branch: Omit<Branch, 'id'>): string {
    const id = `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.insert({
      id,
      name: branch.name,
      location: branch.location,
      type: branch.type,
    });

    return id;
  }

  /**
   * Update a branch
   */
  updateBranch(id: string, updates: Partial<Branch>): void {
    const mappedUpdates: any = {};
    
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.location !== undefined) mappedUpdates.location = updates.location;
    if (updates.type !== undefined) mappedUpdates.type = updates.type;

    super.update(id, mappedUpdates);
  }

  /**
   * Delete a branch
   */
  deleteBranch(id: string): void {
    super.delete(id);
  }
}

// Export singleton instance
export const branchRepository = new BranchRepository();
