import React from 'react';
import { getQuickActions } from '../../services/chatbotService';

export default function QuickActions({ role, onAction }) {
  const actions = getQuickActions(role);

  return (
    <div className="cb-quick-actions">
      <div className="cb-quick-label">Quick Actions</div>
      <div className="cb-quick-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="cb-quick-btn"
            data-action-id={action.id}
            onClick={() => onAction(action.id)}
            title={action.label}
          >
            <span className="cb-quick-icon">{action.icon}</span>
            <span className="cb-quick-text">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
