import React, { useState } from 'react';
import './Forms.css';

export const FormGroup = ({ label, children, error, required }) => {
  return (
    <div className={`form-group ${error ? 'form-group-error' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export const Input = ({ label, name, type = 'text', value, onChange, error, placeholder, required, disabled, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <FormGroup label={label} error={error} required={required}>
      <div className={`input-wrapper ${focused ? 'input-focused' : ''} ${error ? 'input-error' : ''} ${disabled ? 'input-disabled' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-field ${icon ? 'input-has-icon' : ''}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </FormGroup>
  );
};

export const Select = ({ label, name, value, onChange, options = [], error, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <FormGroup label={label} error={error}>
      <div className={`input-wrapper select-wrapper ${focused ? 'input-focused' : ''} ${error ? 'input-error' : ''}`}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="input-field select-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <span className="select-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </FormGroup>
  );
};

export const TextArea = ({ label, name, value, onChange, error, rows = 4 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <FormGroup label={label} error={error}>
      <div className={`input-wrapper ${focused ? 'input-focused' : ''} ${error ? 'input-error' : ''}`}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="input-field textarea-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </FormGroup>
  );
};

export const DatePicker = ({ label, name, value, onChange, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <FormGroup label={label} error={error}>
      <div className={`input-wrapper ${focused ? 'input-focused' : ''} ${error ? 'input-error' : ''}`}>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="input-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </FormGroup>
  );
};

export const TimePicker = ({ label, name, value, onChange, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <FormGroup label={label} error={error}>
      <div className={`input-wrapper ${focused ? 'input-focused' : ''} ${error ? 'input-error' : ''}`}>
        <input
          type="time"
          name={name}
          value={value}
          onChange={onChange}
          className="input-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </FormGroup>
  );
};

export const Checkbox = ({ label, name, checked, onChange }) => {
  return (
    <label className="checkbox-wrapper">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
      />
      <span className="checkbox-custom">
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

export const RadioGroup = ({ label, name, value, onChange, options = [] }) => {
  return (
    <FormGroup label={label}>
      <div className="radio-group">
        {options.map((opt) => {
          const optValue = opt.value ?? opt;
          const optLabel = opt.label ?? opt;
          return (
            <label key={optValue} className="radio-wrapper">
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={value === optValue}
                onChange={onChange}
                className="radio-input"
              />
              <span className="radio-custom">
                {value === optValue && <span className="radio-dot" />}
              </span>
              <span className="radio-label">{optLabel}</span>
            </label>
          );
        })}
      </div>
    </FormGroup>
  );
};

export const Toggle = ({ label, checked, onChange }) => {
  return (
    <label className="toggle-wrapper">
      <span className="toggle-label">{label}</span>
      <div className={`toggle-switch ${checked ? 'toggle-on' : 'toggle-off'}`} onClick={onChange}>
        <div className="toggle-thumb" />
      </div>
    </label>
  );
};
