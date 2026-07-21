import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import * as notificationsApi from '../../services/api/notifications';
import { getErrorMessage } from '../../services/apiError';
import './Notifications.css';

const TYPE_LABELS = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Alert',
};

// The backend only stores an absolute createdAt timestamp (no server-side
// "5 minutes ago" string like the old mock had) - compute a relative label
// client-side instead.
function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationsApi.getNotifications();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const unread = items.filter((n) => !n.read).length;

  const toggleRead = async (n) => {
    if (n.read) return; // no "mark unread" endpoint - matches backend's one-way read tracking
    setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    try {
      await notificationsApi.markNotificationRead(n.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark as read'));
      load(); // reconcile local state with server on failure
    }
  };

  const markAllRead = async () => {
    const previous = items;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllNotificationsRead();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark all as read'));
      setItems(previous);
    }
  };

  const filtered = items.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="page notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted">{unread} unread of {items.length} total</p>
        </div>
        <Button variant="outline" icon="✅" onClick={markAllRead} disabled={unread === 0}>
          Mark all as read
        </Button>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="notification-filters">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'read', label: 'Read' },
        ].map((f) => (
          <button
            key={f.key}
            className={`notification-filter ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <p className="text-muted">No notifications.</p>
        ) : (
          <div className="notification-list">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`notification-item notification-${n.type}${n.read ? ' read' : ''}`}
                onClick={() => toggleRead(n)}
              >
                <div className={`notification-dot notification-dot-${n.type}`} />
                <div className="notification-body">
                  <div className="notification-top">
                    <span className={`notification-type-badge badge-${n.type}`}>{TYPE_LABELS[n.type] || n.type}</span>
                    {n.fromRole && <span className="notification-from">· {n.fromRole.replace('_', ' ')}</span>}
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="notification-message">{n.message}</p>
                </div>
                <span className="notification-status">{n.read ? 'Read' : 'New'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
