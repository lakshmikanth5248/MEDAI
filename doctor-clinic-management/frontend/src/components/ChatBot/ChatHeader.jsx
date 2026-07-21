import React from 'react';
import { useAuth } from '../../context/AuthContext';

const roleColors = {
  patient: '#38bdf8',
  reception: '#a78bfa',
  doctor: '#34d399',
  medical_store: '#fbbf24',
  admin: '#f87171',
};

const roleNames = {
  patient: 'Patient Assistant',
  reception: 'Reception Assistant',
  doctor: 'Doctor Assistant',
  medical_store: 'Pharmacy Assistant',
  admin: 'Admin Assistant',
};

const roleIcons = {
  patient: '🩺',
  reception: '📋',
  doctor: '👨‍⚕️',
  medical_store: '💊',
  admin: '📊',
};

export default function ChatHeader({ onClose, onClear, onToggleDark, darkMode }) {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const color = roleColors[role] || '#38bdf8';

  return (
    <div className="cb-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      <div className="cb-header-avatar">
        {roleIcons[role] || '🤖'}
      </div>
      <div className="cb-header-info">
        <div className="cb-header-title">ClinicAssistant</div>
        <div className="cb-header-subtitle">{roleNames[role]}</div>
      </div>
      <div className="cb-header-actions">
        <button className="cb-header-btn" onClick={onToggleDark} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="cb-header-btn" onClick={onClear} title="Clear chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button className="cb-header-btn" onClick={onClose} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
