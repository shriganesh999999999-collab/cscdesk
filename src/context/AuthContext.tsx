import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types';
import { DEMO_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  switchRole: (role: RoleName) => void;
  hasPermission: (permission: string) => boolean;
  demoUsers: User[];
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('enterprise_itsm_active_user_id');
    if (saved) {
      const found = DEMO_USERS.find((u) => u.id === saved);
      if (found) return found;
    }
    // Default to Alex Rivera (Senior Cloud Developer / Requester)
    return DEMO_USERS[0];
  });

  const switchUser = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('enterprise_itsm_active_user_id', found.id);
    }
  };

  const switchRole = (role: RoleName) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('enterprise_itsm_active_user_id', found.id);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUser.role === 'Super Admin') return true;
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes('ticket.view.all');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        switchRole,
        hasPermission,
        demoUsers: DEMO_USERS,
        isSuperAdmin: currentUser.role === 'Super Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
