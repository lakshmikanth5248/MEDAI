import { useState, useCallback, useRef, useEffect } from 'react';

let notificationIdCounter = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef({});

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const id = ++notificationIdCounter;
    const notification = { id, message, type, timestamp: Date.now() };
    setNotifications((prev) => [...prev, notification]);
    timersRef.current[id] = setTimeout(() => {
      removeNotification(id);
    }, 5000);
    return id;
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setNotifications([]);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return { notifications, addNotification, removeNotification, clearNotifications };
}

export default useNotification;
