import { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user from storage on mount
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email, password) => {
    // Simple mock authentication - in production, use proper authentication
    const foundUser = storageService.getUserByEmail(email);

    if (foundUser) {
      setUser(foundUser);
      storageService.setCurrentUser(foundUser);
      return true;
    }

    return false;
  };

  const register = async (userData) => {
    const existingUser = storageService.getUserByEmail(userData.email);

    if (existingUser) {
      return false; // Email already exists
    }

    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    storageService.addUser(newUser);
    setUser(newUser);
    storageService.setCurrentUser(newUser);

    return true;
  };

  const logout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      storageService.updateUser(user.id, updates);
      storageService.setCurrentUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
