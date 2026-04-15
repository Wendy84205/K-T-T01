import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-load stored token from SecureStore on app startup
    const loadStoredAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('accessToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        
        if (storedToken !== null && storedUser !== null) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error reading SecureStore", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (userData, accessToken) => {
    // Backend returns 'roles' array, Mobile needs a single 'role' for navigation routing
    const normalizedUser = { ...userData };
    if (userData.roles && Array.isArray(userData.roles)) {
      if (userData.roles.includes('Admin')) normalizedUser.role = 'Admin';
      else if (userData.roles.includes('Manager')) normalizedUser.role = 'Manager';
      else if (userData.roles.includes('User')) normalizedUser.role = 'User';
      else normalizedUser.role = userData.roles[0]; // Fallback
    }

    setUser(normalizedUser);
    setToken(accessToken);
    
    await SecureStore.setItemAsync('accessToken', String(accessToken || ''));
    await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userData');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
