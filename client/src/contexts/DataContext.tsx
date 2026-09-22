import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue } from '../types';
import { apiClient } from '../services/apiClient';

interface DataContextType {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  addIssue: (issue: Omit<Issue, 'id'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  refreshIssues: () => Promise<void>;
  getIssuesByBranch: (branchId: string) => Issue[];
  getIssuesByStatus: (status: string) => Issue[];
  getIssuesByDateRange: (start: Date, end: Date) => Issue[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setIsLoading(true);
      const loadedIssues = await apiClient.get<Issue[]>('/issues');
      setIssues(loadedIssues);
      setError(null);
    } catch (err) {
      console.error('Failed to load issues:', err);
      setError('Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIssues = async () => {
    await loadIssues();
  };

  const addIssue = async (issue: Omit<Issue, 'id'>) => {
    try {
      await apiClient.post<Issue>('/issues', issue);
      await refreshIssues();
    } catch (err) {
      console.error('Failed to add issue:', err);
      setError('Failed to add issue');
      throw err;
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      await apiClient.put<Issue>(`/issues/${id}`, updates);
      await refreshIssues();
    } catch (err) {
      console.error('Failed to update issue:', err);
      setError('Failed to update issue');
      throw err;
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      await apiClient.delete(`/issues/${id}`);
      await refreshIssues();
    } catch (err) {
      console.error('Failed to delete issue:', err);
      setError('Failed to delete issue');
      throw err;
    }
  };

  const getIssuesByBranch = (branchId: string): Issue[] => {
    return issues.filter(issue => issue.branchId === branchId);
  };

  const getIssuesByStatus = (status: string): Issue[] => {
    return issues.filter(issue => issue.status === status);
  };

  const getIssuesByDateRange = (start: Date, end: Date): Issue[] => {
    return issues.filter(issue => {
      const date = new Date(issue.reportedAt);
      return date >= start && date <= end;
    });
  };

  return (
    <DataContext.Provider value={{
      issues,
      isLoading,
      error,
      addIssue,
      updateIssue,
      deleteIssue,
      refreshIssues,
      getIssuesByBranch,
      getIssuesByStatus,
      getIssuesByDateRange,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
