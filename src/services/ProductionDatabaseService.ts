/**
 * Production Database Service
 * 
 * Handles all database operations through secure API calls
 * No direct database access from frontend!
 */

import { apiClient } from './apiClient';
import { Issue, User, Branch } from '../types';
import { logger } from '../utils/logger';

export class ProductionDatabaseService {
  private static instance: ProductionDatabaseService;
  private useBackend: boolean = false;

  private constructor() {
    // Check if backend is available
    this.checkBackendAvailability();
  }

  public static getInstance(): ProductionDatabaseService {
    if (!ProductionDatabaseService.instance) {
      ProductionDatabaseService.instance = new ProductionDatabaseService();
    }
    return ProductionDatabaseService.instance;
  }

  /**
   * Check if backend API is available
   */
  private async checkBackendAvailability(): Promise<void> {
    try {
      const response = await fetch('/api/health', { method: 'GET' });
      this.useBackend = response.ok;
      logger.info(`Backend availability: ${this.useBackend}`, 'DatabaseService');
    } catch {
      this.useBackend = false;
      logger.warn('Backend not available, using fallback', 'DatabaseService');
    }
  }

  /**
   * Check if using backend
   */
  public isUsingBackend(): boolean {
    return this.useBackend;
  }

  // ============================================
  // Issues
  // ============================================

  async getAllIssues(): Promise<Issue[]> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const issues = await apiClient.get<Issue[]>('/issues');
      return issues;
    } catch (error) {
      logger.error('Failed to fetch issues', 'DatabaseService', { error });
      throw error;
    }
  }

  async getIssueById(id: string): Promise<Issue | null> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const issue = await apiClient.get<Issue>(`/issues/${id}`);
      return issue;
    } catch (error) {
      logger.error('Failed to fetch issue', 'DatabaseService', { error, id });
      return null;
    }
  }

  async createIssue(issue: Omit<Issue, 'id'>): Promise<Issue> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const newIssue = await apiClient.post<Issue>('/issues', issue);
      logger.info('Issue created', 'DatabaseService', { id: newIssue.id });
      return newIssue;
    } catch (error) {
      logger.error('Failed to create issue', 'DatabaseService', { error });
      throw error;
    }
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const updatedIssue = await apiClient.put<Issue>(`/issues/${id}`, updates);
      logger.info('Issue updated', 'DatabaseService', { id });
      return updatedIssue;
    } catch (error) {
      logger.error('Failed to update issue', 'DatabaseService', { error, id });
      throw error;
    }
  }

  async deleteIssue(id: string): Promise<void> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      await apiClient.delete(`/issues/${id}`);
      logger.info('Issue deleted', 'DatabaseService', { id });
    } catch (error) {
      logger.error('Failed to delete issue', 'DatabaseService', { error, id });
      throw error;
    }
  }

  async getIssuesByBranch(branchId: string): Promise<Issue[]> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const issues = await apiClient.get<Issue[]>('/issues', { branch: branchId });
      return issues;
    } catch (error) {
      logger.error('Failed to fetch issues by branch', 'DatabaseService', { error, branchId });
      throw error;
    }
  }

  async getIssuesByStatus(status: string): Promise<Issue[]> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const issues = await apiClient.get<Issue[]>('/issues', { status });
      return issues;
    } catch (error) {
      logger.error('Failed to fetch issues by status', 'DatabaseService', { error, status });
      throw error;
    }
  }

  // ============================================
  // Users
  // ============================================

  async getAllUsers(): Promise<User[]> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const users = await apiClient.get<User[]>('/users');
      return users;
    } catch (error) {
      logger.error('Failed to fetch users', 'DatabaseService', { error });
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const user = await apiClient.get<User>(`/users/${id}`);
      return user;
    } catch (error) {
      logger.error('Failed to fetch user', 'DatabaseService', { error, id });
      return null;
    }
  }

  // ============================================
  // Branches
  // ============================================

  async getAllBranches(): Promise<Branch[]> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const branches = await apiClient.get<Branch[]>('/branches');
      return branches;
    } catch (error) {
      logger.error('Failed to fetch branches', 'DatabaseService', { error });
      throw error;
    }
  }

  // ============================================
  // Statistics
  // ============================================

  async getIssueStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
  }> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const stats = await apiClient.get<any>('/stats/issues');
      return stats;
    } catch (error) {
      logger.error('Failed to fetch stats', 'DatabaseService', { error });
      throw error;
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async login(email: string, password: string): Promise<{
    token: string;
    user: User;
  }> {
    if (!this.useBackend) {
      throw new Error('Backend not available');
    }

    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      
      // Store token
      apiClient.setToken(response.token);
      
      logger.info('Login successful', 'DatabaseService', { email });
      return response;
    } catch (error) {
      logger.error('Login failed', 'DatabaseService', { error, email });
      throw error;
    }
  }

  logout(): void {
    apiClient.clearToken();
    logger.info('Logout successful', 'DatabaseService');
  }
}

export const productionDatabaseService = ProductionDatabaseService.getInstance();
