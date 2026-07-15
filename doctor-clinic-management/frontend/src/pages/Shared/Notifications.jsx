import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { notifications as initialNotifications } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';
import './Notifications.css';

const TYPE_LABELS = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Alert',
};

const Notifications = () => {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const unread = items.filter((n) => !n.read).length;

  const toggleRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
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
        {filtered.length === 0 ? (
          <p className="text-muted">No notifications.</p>
        ) : (
          <div className="notification-list">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`notification-item notification-${n.type}${n.read ? ' read' : ''}`}
                onClick={() => toggleRead(n.id)}
              >
                <div className={`notification-dot notification-dot-${n.type}`} />
                <div className="notification-body">
                  <div className="notification-top">
                    <span className={`notification-type-badge badge-${n.type}`}>{TYPE_LABELS[n.type] || n.type}</span>
                    <span className="notification-time">{n.time}</span>
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
