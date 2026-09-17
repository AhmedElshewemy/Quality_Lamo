import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { users } from '../data/users';

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
    const stored = localStorage.getItem('qms_currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, _password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('qms_currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('qms_currentUser');
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
