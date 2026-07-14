import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = '#38BDF8', trend, onClick }) => {
  return (
    <div className="stat-card" onClick={onClick} style={{ '--card-accent': color }}>
      <div className="stat-card-icon" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
        {trend && <span className={`stat-card-trend ${trend.direction}`}>{trend.label}</span>}
      </div>
    </div>
  );
};

export default StatCard;
