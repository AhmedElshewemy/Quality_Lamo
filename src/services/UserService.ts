/**
 * User Service
 * 
 * Business logic layer for user management.
 */

import { userRepository } from '../database/repositories';
import { User } from '../types';
import { getDefaultUsers } from '../config/env';
import { logger } from '../utils/logger';

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
   * Authenticate user with password validation
   */
  authenticate(email: string, password: string): User | null {
    // Get default users from environment variables
    const defaultUsers = getDefaultUsers();
    
    // Find user in default users
    const defaultUser = defaultUsers.find(u => u.email === email);
    
    if (defaultUser) {
      // Validate password
      if (defaultUser.password !== password) {
        logger.warn('Authentication failed: Invalid password', 'AuthService', { email });
        return null;
      }
      
      // Find or create user in database
      let user = userRepository.findByEmail(email);
      
      if (!user) {
        // Create user in database
        const userId = userRepository.create({
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role,
          branch: defaultUser.branch,
        });
        user = userRepository.findById(userId);
      }
      
      logger.info('User authenticated successfully', 'AuthService', { 
        email, 
        role: user?.role 
      });
      
      return user;
    }
    
    // Check database users (for custom users)
    const dbUser = userRepository.findByEmail(email);
    if (dbUser) {
      // In production, validate password hash here
      logger.info('User authenticated from database', 'AuthService', { 
        email, 
        role: dbUser.role 
      });
      return dbUser;
    }
    
    logger.warn('Authentication failed: User not found', 'AuthService', { email });
    return null;
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
