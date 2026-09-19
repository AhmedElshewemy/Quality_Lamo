import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue } from '../types';
import { issueService } from '../services/IssueService';
import { dbManager } from '../database/connection';

interface DataContextType {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  addIssue: (issue: Omit<Issue, 'id'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  refreshIssues: () => void;
  getIssuesByBranch: (branchId: string) => Issue[];
  getIssuesByStatus: (status: string) => Issue[];
  getIssuesByDateRange: (start: Date, end: Date) => Issue[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load issues
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        await dbManager.initialize();
        
        // Load issues from SQLite
        const loadedIssues = issueService.getAllIssues();
        setIssues(loadedIssues);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const refreshIssues = () => {
    const loadedIssues = issueService.getAllIssues();
    setIssues(loadedIssues);
  };

  const addIssue = (issue: Omit<Issue, 'id'>) => {
    try {
      issueService.createIssue(issue);
      refreshIssues();
    } catch (err) {
      console.error('Failed to add issue:', err);
      setError('Failed to add issue');
    }
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    try {
      issueService.updateIssue(id, updates);
      refreshIssues();
    } catch (err) {
      console.error('Failed to update issue:', err);
      setError('Failed to update issue');
    }
  };

  const deleteIssue = (id: string) => {
    try {
      issueService.deleteIssue(id);
      refreshIssues();
    } catch (err) {
      console.error('Failed to delete issue:', err);
      setError('Failed to delete issue');
    }
  };

  const getIssuesByBranch = (branchId: string): Issue[] => {
    return issueService.getIssuesByBranch(branchId);
  };

  const getIssuesByStatus = (status: string): Issue[] => {
    return issueService.getIssuesByStatus(status);
  };

  const getIssuesByDateRange = (start: Date, end: Date): Issue[] => {
    return issueService.getIssuesByDateRange(start, end);
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
