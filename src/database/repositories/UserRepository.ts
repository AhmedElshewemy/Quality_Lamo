/**
 * User Repository
 * 
 * Handles all database operations for users.
 */

import { BaseRepository } from './BaseRepository';
import { User } from '../../types';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  /**
   * Map database row to User object
   */
  protected mapRow(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      branch: row.branch_id,
    };
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const results = this.findWhere('email = ?', [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find users by role
   */
  findByRole(role: string): User[] {
    return this.findWhere('role = ?', [role]);
  }

  /**
   * Find users by branch
   */
  findByBranch(branchId: string): User[] {
    return this.findWhere('branch_id = ?', [branchId]);
  }

  /**
   * Create a new user
   */
  create(user: Omit<User, 'id'>): string {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.insert({
      id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch_id: user.branch,
    });

    return id;
  }

  /**
   * Update a user
   */
  updateUser(id: string, updates: Partial<User>): void {
    const mappedUpdates: any = {};
    
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.role !== undefined) mappedUpdates.role = updates.role;
    if (updates.branch !== undefined) mappedUpdates.branch_id = updates.branch;

    super.update(id, mappedUpdates);
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): void {
    super.delete(id);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
