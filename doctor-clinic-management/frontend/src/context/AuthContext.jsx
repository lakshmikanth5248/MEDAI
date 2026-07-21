import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as authApi from '../services/api/auth';
import * as clinicalApi from '../services/api/clinical';
import * as pharmacyApi from '../services/api/pharmacy';
import { getErrorMessage } from '../services/apiError';

export const AuthContext = createContext(null);

// Merges the auth identity (id, uid, name, email, role, roleLabel, status,
// mustChangePassword - and phone/floor/shift for reception/admin, added
// server-side by GET /me) with the role-specific domain profile from
// clinical-service/pharmacy-service, so pages get one rich profile object -
// mirroring what the old mock's client-side resolveProfile() used to build,
// except sourced from the real backend now. Best-effort: if the domain
// lookup fails, the bare auth identity is still usable.
async function enrichProfile(authUser) {
  try {
    if (authUser.role === 'doctor') {
      const doctors = await clinicalApi.getDoctors({ userId: authUser.id });
      if (doctors[0]) return { ...authUser, ...doctors[0], name: authUser.name, email: authUser.email };
    } else if (authUser.role === 'patient') {
      const patients = await clinicalApi.getPatients({ userId: authUser.id });
      if (patients[0]) return { ...authUser, ...patients[0], name: authUser.name, email: authUser.email };
    } else if (authUser.role === 'medical_store') {
      const stores = await pharmacyApi.getStores({ userId: authUser.id });
      if (stores[0]) {
        return {
          ...authUser, ...stores[0],
          name: authUser.name, email: authUser.email, storeName: stores[0].name,
        };
      }
    } else if (authUser.role === 'reception') {
      return { ...authUser, receptionId: authUser.uid };
    } else if (authUser.role === 'admin') {
      return { ...authUser, adminId: authUser.uid };
    }
  } catch {
    /* best-effort enrichment - fall back to the bare auth identity below */
  }
  return authUser;
}

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

  const login = useCallback(async (identifier, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const { token: tokenStr, user: authUser } = await authApi.login(identifier, password, role);
      // Stash the token immediately - enrichProfile's API calls need it on the Authorization header.
      localStorage.setItem('token', tokenStr);
      setToken(tokenStr);

      const fullProfile = await enrichProfile(authUser);
      setUser(fullProfile);
      localStorage.setItem('user', JSON.stringify(fullProfile));
      setLoading(false);
      return true;
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setError(getErrorMessage(err, 'Invalid credentials'));
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
      await authApi.register({
        email: data.email,
        password: data.password,
        role: data.role || 'patient',
        fullName: data.fullName || data.name,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        bloodGroup: data.bloodGroup,
        address: data.address,
      });
      setLoading(false);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
      setLoading(false);
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Persists editable profile fields to whichever backend owns them
  // (clinical-service for doctor/patient, pharmacy-service for medical_store,
  // auth-service for reception/admin self-edit), then updates the in-memory
  // + cached user so every page reflecting the profile stays in sync.
  const updateProfile = useCallback(async (fields) => {
    if (!user) return false;
    try {
      let updatedFields = fields;
      if (user.role === 'doctor') {
        updatedFields = await clinicalApi.updateDoctor(user.id, fields);
      } else if (user.role === 'patient') {
        updatedFields = await clinicalApi.updatePatient(user.id, fields);
      } else if (user.role === 'medical_store') {
        updatedFields = await pharmacyApi.updateStore(user.id, fields);
      } else {
        updatedFields = await authApi.updateUser(user.id, fields);
      }
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'));
      return false;
    }
  }, [user]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      const updated = { ...user, mustChangePassword: false };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setLoading(false);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password'));
      setLoading(false);
      return false;
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    needsPasswordChange: !!user?.mustChangePassword,
    login,
    logout,
    register,
    changePassword,
    clearError,
    updateProfile,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
