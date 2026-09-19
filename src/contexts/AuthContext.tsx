import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService } from '../services/UserService';
import { dbManager } from '../database/connection';
import { logger } from '../utils/logger';
import { toastNotifications } from '../utils/notifications';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize database if not already initialized
        if (!dbManager.isReady()) {
          await dbManager.initialize();
        }

        // Check for stored session
        const storedUserId = sessionStorage.getItem('qms_currentUserId');
        if (storedUserId) {
          const user = userService.getUserById(storedUserId);
          if (user) {
            setCurrentUser(user);
            logger.setUserId(user.id);
            logger.info('Session restored', 'Auth', { userId: user.id });
          }
        }
      } catch (err) {
        logger.error('Failed to initialize auth', 'Auth', { error: err });
      }
    };

    initializeAuth();
  }, []);

  const login = (email: string, password: string): boolean => {
    try {
      logger.info('Login attempt', 'Auth', { email });
      
      const user = userService.authenticate(email, password);
      
      if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('qms_currentUserId', user.id);
        logger.setUserId(user.id);
        logger.info('Login successful', 'Auth', { userId: user.id, role: user.role });
        toastNotifications.success.loginSuccess();
        return true;
      }
      
      logger.warn('Login failed: Invalid credentials', 'Auth', { email });
      toastNotifications.error.loginFailed();
      return false;
    } catch (err) {
      logger.error('Login error', 'Auth', { error: err });
      toastNotifications.error.custom('حدث خطأ أثناء تسجيل الدخول');
      return false;
    }
  };

  const logout = () => {
    logger.info('User logout', 'Auth', { userId: currentUser?.id });
    setCurrentUser(null);
    sessionStorage.removeItem('qms_currentUserId');
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
