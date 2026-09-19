/**
 * User Service
 * 
 * Business logic layer for user management.
 */

import { userRepository } from '../database/repositories';
import { User } from '../types';

export class UserService {
  /**
   * Get all users
   */
  getAllUsers(): User[] {
    return userRepository.findAll();
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | null {
    return userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    return userRepository.findByEmail(email);
  }

  /**
   * Authenticate user
   */
  authenticate(email: string, _password: string): User | null {
    // For demo purposes, we skip password validation
    // In production, use proper password hashing and validation
    return userRepository.findByEmail(email);
  }

  /**
   * Create a new user
   */
  createUser(user: Omit<User, 'id'>): string {
    return userRepository.create(user);
  }

  /**
   * Update a user
   */
  updateUser(id: string, updates: Partial<User>): void {
    userRepository.updateUser(id, updates);
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): void {
    userRepository.deleteUser(id);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): User[] {
    return userRepository.findByRole(role);
  }

  /**
   * Get users by branch
   */
  getUsersByBranch(branchId: string): User[] {
    return userRepository.findByBranch(branchId);
  }
}

// Export singleton instance
export const userService = new UserService();
