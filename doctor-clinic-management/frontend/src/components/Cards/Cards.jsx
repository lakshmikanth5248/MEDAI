import React from 'react';
import { Link } from 'react-router-dom';
import './Cards.css';

export const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  const trendUp = trend === 'up';
  return (
    <div className="stat-card" style={{ '--card-accent': color || '#38BDF8' }}>
      <div className="stat-card-content">
        <span className="stat-card-label">{title}</span>
        <span className="stat-card-value">{value ?? 0}</span>
        {trendValue && (
          <span className={`stat-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {trendUp ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
            <span>{trendValue}</span>
          </span>
        )}
      </div>
      <div className="stat-card-icon" style={{ background: `${color || '#38BDF8'}15` }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color || '#38BDF8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon || 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
        </svg>
      </div>
    </div>
  );
};

export const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;
  const initials = doctor.name
    ? doctor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';
  const slotsAvailable = doctor.availableSlots || 0;

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-card-avatar" style={{ background: `linear-gradient(135deg, #38BDF8, #0369A1)` }}>
          {initials}
        </div>
        <div className="doctor-card-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`star ${star <= Math.round(doctor.rating || 0) ? 'star-filled' : ''}`}>
              ★
            </span>
          ))}
          <span className="doctor-card-rating-text">({doctor.rating || 'N/A'})</span>
        </div>
      </div>
      <h3 className="doctor-card-name">{doctor.name}</h3>
      <p className="doctor-card-specialization">{doctor.specialization}</p>
      <div className="doctor-card-details">
        <div className="doctor-card-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{doctor.experience || 0} yrs exp.</span>
        </div>
        <div className="doctor-card-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>₹{doctor.fee || 0}</span>
        </div>
      </div>
      <div className="doctor-card-slots">
        <div className={`slot-indicator ${slotsAvailable > 0 ? 'slots-available' : 'slots-full'}`} />
        <span>{slotsAvailable > 0 ? `${slotsAvailable} slots available` : 'Fully booked'}</span>
      </div>
      <Link
        to={`/book-appointment?doctor=${doctor.id}`}
        className="doctor-card-btn"
      >
        Book Appointment
      </Link>
    </div>
  );
};

export const AppointmentCard = ({ appointment }) => {
  if (!appointment) return null;
  const statusColors = {
    completed: '#10b981',
    active: '#10b981',
    scheduled: '#f59e0b',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    'in-progress': '#38BDF8',
  };
  const statusColor = statusColors[appointment.status?.toLowerCase()] || '#64748b';

  return (
    <div className="appointment-card">
      <div className="appointment-card-top">
        <div className="appointment-card-info">
          <h4 className="appointment-card-title">
            {appointment.patientName || appointment.doctorName || 'Appointment'}
          </h4>
          <p className="appointment-card-subtitle">{appointment.department}</p>
        </div>
        <span
          className="appointment-card-status"
          style={{ background: `${statusColor}15`, color: statusColor }}
        >
          {appointment.status}
        </span>
      </div>
      <div className="appointment-card-datetime">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{appointment.date ? new Date(appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
        {appointment.time && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{appointment.time}</span>
          </>
        )}
      </div>
    </div>
  );
};

export const PatientCard = ({ patient }) => {
  if (!patient) return null;
  const initials = patient.name
    ? patient.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'PT';

  return (
    <div className="patient-card">
      <div className="patient-card-top">
        <div className="patient-card-avatar">{initials}</div>
        <div className="patient-card-info">
          <h4 className="patient-card-name">{patient.name}</h4>
          <span className="patient-card-id">ID: {patient.patientId || patient.id}</span>
        </div>
      </div>
      <div className="patient-card-contact">
        {patient.email && (
          <div className="patient-card-contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{patient.email}</span>
          </div>
        )}
        {patient.phone && (
          <div className="patient-card-contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span>{patient.phone}</span>
          </div>
        )}
      </div>
      <div className="patient-card-actions">
        <Link to={`/patients/${patient.id}`} className="patient-card-action-btn view">View Profile</Link>
        <Link to={`/book-appointment?patient=${patient.id}`} className="patient-card-action-btn book">Book Appt.</Link>
      </div>
    </div>
  );
};
