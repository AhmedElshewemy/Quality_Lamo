import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';
import { logger } from '../utils/logger';
import { toastNotifications } from '../utils/notifications';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored token and restore session
    const token = sessionStorage.getItem('auth_token');
    const storedUser = sessionStorage.getItem('auth_user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        logger.setUserId(user.id);
        logger.info('Session restored', 'Auth', { userId: user.id });
      } catch (err) {
        logger.error('Failed to restore session', 'Auth', { error: err });
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      logger.info('Login attempt', 'Auth', { email });
      
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      
      // Store token and user
      apiClient.setToken(response.token);
      sessionStorage.setItem('auth_user', JSON.stringify(response.user));
      
      setCurrentUser(response.user);
      logger.setUserId(response.user.id);
      logger.info('Login successful', 'Auth', { userId: response.user.id, role: response.user.role });
      toastNotifications.success.loginSuccess();
      return true;
    } catch (err) {
      logger.error('Login failed', 'Auth', { error: err, email });
      toastNotifications.error.loginFailed();
      return false;
    }
  };

  const logout = () => {
    logger.info('User logout', 'Auth', { userId: currentUser?.id });
    apiClient.clearToken();
    setCurrentUser(null);
    sessionStorage.removeItem('auth_user');
    logger.setUserId(null);
    toastNotifications.success.logoutSuccess();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: !!currentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
