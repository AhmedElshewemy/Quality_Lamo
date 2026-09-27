import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { User } from '../types';

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  userName: (userId: string | undefined) => string;
  refetch: () => void;
}

/**
 * Loads the user list once and exposes a `userName` lookup helper, mirroring
 * useBranches. Any authenticated user can call GET /api/users.
 */
export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<User[]>('/users')
      .then(setUsers)
      .catch((err) => {
        console.error('Failed to load users:', err);
        setError('فشل تحميل قائمة المستخدمين');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const userName = (userId: string | undefined) =>
    users.find((u) => u.id === userId)?.name || '—';

  return { users, isLoading, error, userName, refetch: fetchUsers };
};
