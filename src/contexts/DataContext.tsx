import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue } from '../types';
import { sampleIssues } from '../data/sampleIssues';
import { IssuesService } from '../services/firestoreService';
import { isFirebaseConfigured } from '../config/firebase';

interface DataContextType {
  issues: Issue[];
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  getIssuesByBranch: (branchId: string) => Issue[];
  getIssuesByStatus: (status: string) => Issue[];
  getIssuesByDateRange: (start: Date, end: Date) => Issue[];
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is configured, use Firestore with real-time updates
    if (isFirebaseConfigured) {
      const unsubscribe = IssuesService.subscribe((newIssues) => {
        setIssues(newIssues);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Fallback to localStorage for demo/development
      const stored = localStorage.getItem('qms_issues');
      if (stored) {
        setIssues(JSON.parse(stored));
      } else {
        setIssues(sampleIssues);
        localStorage.setItem('qms_issues', JSON.stringify(sampleIssues));
      }
      setIsLoading(false);
    }
  }, []);

  const saveIssues = async (newIssues: Issue[]) => {
    setIssues(newIssues);
    
    // Save to localStorage as cache/fallback
    localStorage.setItem('qms_issues', JSON.stringify(newIssues));
  };

  const addIssue = async (issue: Issue) => {
    try {
      if (isFirebaseConfigured) {
        const { id, ...issueData } = issue;
        const newId = await IssuesService.create(issueData);
        const newIssue = { ...issue, id: newId };
        setIssues(prev => [newIssue, ...prev]);
      } else {
        const newIssues = [issue, ...issues];
        await saveIssues(newIssues);
      }
    } catch (err) {
      setError('Failed to add issue');
      console.error(err);
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      if (isFirebaseConfigured) {
        await IssuesService.update(id, updates);
        setIssues(prev => prev.map(issue =>
          issue.id === id ? { ...issue, ...updates } : issue
        ));
      } else {
        const newIssues = issues.map(issue =>
          issue.id === id ? { ...issue, ...updates } : issue
        );
        await saveIssues(newIssues);
      }
    } catch (err) {
      setError('Failed to update issue');
      console.error(err);
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      if (isFirebaseConfigured) {
        await IssuesService.delete(id);
        setIssues(prev => prev.filter(issue => issue.id !== id));
      } else {
        const newIssues = issues.filter(issue => issue.id !== id);
        await saveIssues(newIssues);
      }
    } catch (err) {
      setError('Failed to delete issue');
      console.error(err);
    }
  };

  const getIssuesByBranch = (branchId: string) =>
    issues.filter(issue => issue.branchId === branchId);

  const getIssuesByStatus = (status: string) =>
    issues.filter(issue => issue.status === status);

  const getIssuesByDateRange = (start: Date, end: Date) =>
    issues.filter(issue => {
      const date = new Date(issue.reportedAt);
      return date >= start && date <= end;
    });

  return (
    <DataContext.Provider value={{
      issues,
      addIssue,
      updateIssue,
      deleteIssue,
      getIssuesByBranch,
      getIssuesByStatus,
      getIssuesByDateRange,
      isLoading,
      error,
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
