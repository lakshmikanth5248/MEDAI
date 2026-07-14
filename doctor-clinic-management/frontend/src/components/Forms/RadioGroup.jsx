import React from 'react';
import './Form.css';

const RadioGroup = ({ label, name, value, onChange, options, required }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className="radio-group">
        {options.map((opt) => (
          <label key={opt.value} className="radio-label">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
