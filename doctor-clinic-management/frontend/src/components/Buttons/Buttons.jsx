import React from 'react';
import './Buttons.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="btn-spinner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export const IconButton = ({
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  tooltip,
}) => {
  return (
    <button
      className={`icon-btn icon-btn-${variant} icon-btn-${size}`}
      onClick={onClick}
      title={tooltip}
    >
      {icon}
      {tooltip && <span className="icon-btn-tooltip">{tooltip}</span>}
    </button>
  );
};

export const ButtonGroup = ({ children, orientation = 'horizontal' }) => {
  return (
    <div className={`btn-group btn-group-${orientation}`}>
      {children}
    </div>
  );
};
