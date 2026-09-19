import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService } from '../services/UserService';
import { dbManager } from '../database/connection';

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
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      }
    };

    initializeAuth();
  }, []);

  const login = (email: string, password: string): boolean => {
    try {
      const user = userService.authenticate(email, password);
      if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('qms_currentUserId', user.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('qms_currentUserId');
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
