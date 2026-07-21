import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    setAlerts((prev) => [...prev, { id, ...alert }]);
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = { alerts, addAlert, removeAlert };
  return React.createElement(NotificationContext.Provider, { value }, children);
}

export default function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Safe no-op fallback for use outside a NotificationProvider (no such
    // provider is currently mounted anywhere in the app - AlertContainer
    // just renders nothing in that case). Mirrors the same fallback pattern
    // used by i18n/LanguageContext.jsx's useTranslation().
    return { alerts: [], addAlert: () => {}, removeAlert: () => {} };
  }
  return ctx;
}
