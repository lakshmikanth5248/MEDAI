import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, className = '', type = 'button', disabled, ...props }) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
