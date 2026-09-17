import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue } from '../types';
import { sampleIssues } from '../data/sampleIssues';

interface DataContextType {
  issues: Issue[];
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  getIssuesByBranch: (branchId: string) => Issue[];
  getIssuesByStatus: (status: string) => Issue[];
  getIssuesByDateRange: (start: Date, end: Date) => Issue[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('qms_issues');
    if (stored) {
      setIssues(JSON.parse(stored));
    } else {
      setIssues(sampleIssues);
      localStorage.setItem('qms_issues', JSON.stringify(sampleIssues));
    }
  }, []);

  const saveIssues = (newIssues: Issue[]) => {
    setIssues(newIssues);
    localStorage.setItem('qms_issues', JSON.stringify(newIssues));
  };

  const addIssue = (issue: Issue) => {
    const newIssues = [issue, ...issues];
    saveIssues(newIssues);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    const newIssues = issues.map(issue =>
      issue.id === id ? { ...issue, ...updates } : issue
    );
    saveIssues(newIssues);
  };

  const deleteIssue = (id: string) => {
    const newIssues = issues.filter(issue => issue.id !== id);
    saveIssues(newIssues);
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
