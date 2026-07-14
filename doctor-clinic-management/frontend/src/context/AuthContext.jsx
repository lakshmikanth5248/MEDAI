import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

export const AuthContext = createContext(null);

const MOCK_USERS = {
  'admin@clinic.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 3 },
  'doctor@clinic.com': { password: 'doctor123', role: 'doctor', name: 'Dr. Arjun Mehta', id: 1 },
  'reception@clinic.com': { password: 'reception123', role: 'reception', name: 'Priya Sharma', id: 2 },
  'patient@clinic.com': { password: 'patient123', role: 'patient', name: 'Rajesh Gupta', id: 1 },
  'store@clinic.com': { password: 'store123', role: 'medical_store', name: 'City Pharmacy', id: 1 },
};

const ROLE_LABELS = {
  admin: 'Admin',
  doctor: 'Doctor',
  reception: 'Receptionist',
  patient: 'Patient',
  medical_store: 'Medical Store',
};

export function AuthProvider({ children }) {
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

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const matchedUser = MOCK_USERS[email];
      if (!matchedUser || matchedUser.password !== password) {
        setError('Invalid email or password');
        setLoading(false);
        return false;
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
    } catch (err) {
      setError('Login failed. Please try again.');
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
      if (MOCK_USERS[data.email]) {
        setError('An account with this email already exists');
        setLoading(false);
        return false;
      }
      setLoading(false);
      return true;
    } catch {
      setError('Registration failed. Please try again.');
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
