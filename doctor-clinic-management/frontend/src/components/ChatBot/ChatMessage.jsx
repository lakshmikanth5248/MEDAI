import React from 'react';
import { formatTime } from '../../utils/chatbotUtils';

function formatContent(text) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return React.createElement('strong', { key: i }, trimmed.slice(2, -2));
    }
    if (trimmed.startsWith('---')) {
      return React.createElement('hr', { key: i, className: 'cb-msg-divider' });
    }
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      return React.createElement('span', { key: i, className: 'cb-msg-table-row' }, trimmed);
    }
    if (trimmed.startsWith('* ')) {
      return React.createElement('span', { key: i, className: 'cb-msg-bullet' }, trimmed);
    }
    if (trimmed.startsWith('•')) {
      return React.createElement('span', { key: i, className: 'cb-msg-bullet' }, trimmed);
    }
    if (/^\d+\./.test(trimmed)) {
      return React.createElement('span', { key: i, className: 'cb-msg-num' }, trimmed);
    }
    if (trimmed === '') {
      return React.createElement('br', { key: i });
    }
    return React.createElement('span', { key: i }, trimmed);
  });
}

function getMessageClass(type) {
  const classes = ['cb-msg', 'cb-msg-bot'];
  if (type === 'symptom') classes.push('cb-msg-symptom');
  if (type === 'emergency') classes.push('cb-msg-emergency');
  if (type === 'stats') classes.push('cb-msg-stats');
  if (type === 'alert') classes.push('cb-msg-alert');
  if (type === 'patient_info') classes.push('cb-msg-patient');
  if (type === 'patient_history') classes.push('cb-msg-history');
  if (type === 'insights') classes.push('cb-msg-insights');
  if (type === 'list') classes.push('cb-msg-list');
  if (type === 'table') classes.push('cb-msg-table');
  if (type === 'prescription') classes.push('cb-msg-prescription');
  return classes.join(' ');
}

export default function ChatMessage({ message }) {
  const isUser = message.from === 'user';

  return (
    <div className={`cb-msg-wrapper ${isUser ? 'cb-msg-wrapper-user' : 'cb-msg-wrapper-bot'}`}>
      {!isUser && (
        <div className="cb-msg-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          </svg>
        </div>
      )}
      <div className={isUser ? 'cb-msg cb-msg-user' : getMessageClass(message.type)}>
        <div className="cb-msg-content">
          {formatContent(message.content)}
        </div>
        <div className="cb-msg-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
      {isUser && (
        <div className="cb-msg-avatar cb-msg-avatar-user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}
