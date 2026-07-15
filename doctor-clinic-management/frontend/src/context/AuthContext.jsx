import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getUsers, addUser } from '../services/userStore';
import { useTranslation } from '../i18n/LanguageContext';

export const AuthContext = createContext(null);

const ROLE_LABELS = {
  admin: 'Admin',
  doctor: 'Doctor',
  reception: 'Receptionist',
  patient: 'Patient',
  medical_store: 'Medical Store',
};

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const matchedUser = getUsers()[email?.trim().toLowerCase()];
      if (!matchedUser || matchedUser.password !== password) {
        const msg = t('auth.invalidCredentials');
        setError(msg); setLoading(false); return false;
      }
      if (matchedUser.role !== role) {
        const msg = t('auth.invalidCredentials');
        setError(msg); setLoading(false); return false;
      }
      const tokenStr = 'mock-jwt-token-' + Date.now();
      const userData = {
        id: matchedUser.id,
        name: matchedUser.name,
        email,
        role: matchedUser.role,
        roleLabel: ROLE_LABELS[matchedUser.role] || matchedUser.role,
      };
      setToken(tokenStr);
      setUser(userData);
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return true;
    } catch {
      setError(t('auth.errorOccurred'));
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const role = data.role || 'patient';
      const added = addUser({
        email: data.email,
        password: data.password,
        role,
        name: data.fullName || data.name || data.email,
        id: data.id,
      });
      if (!added) {
        setError(t('auth.accountExists'));
        setLoading(false);
        return false;
      }
      setLoading(false);
      return true;
    } catch {
      setError(t('auth.errorOccurred'));
      setLoading(false);
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    clearError,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
