import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="cb-msg cb-msg-bot cb-typing-indicator">
      <div className="cb-typing-dots">
        <span className="cb-typing-dot" />
        <span className="cb-typing-dot" />
        <span className="cb-typing-dot" />
      </div>
    </div>
  );
}
