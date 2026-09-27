import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Branch } from '../types';

interface UseBranchesResult {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  branchName: (branchId: string) => string;
}

/**
 * Loads the branch list once and exposes a `branchName` lookup helper.
 * Branches change rarely, so every page that needs them (Dashboard, ReportIssue,
 * IssuesList, ...) can call this hook instead of duplicating the fetch + lookup logic.
 */
export const useBranches = (): UseBranchesResult => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Branch[]>('/branches')
      .then(setBranches)
      .catch((err) => {
        console.error('Failed to load branches:', err);
        setError('فشل تحميل قائمة الفروع');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const branchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name || branchId;

  return { branches, isLoading, error, branchName };
};
