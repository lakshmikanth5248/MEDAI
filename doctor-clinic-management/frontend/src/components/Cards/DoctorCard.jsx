import React from 'react';
import './DoctorCard.css';
import { getInitials } from '../../utils/helpers';

const DoctorCard = ({ doctor, onBook, onClick }) => {
  const initials = getInitials(doctor.name);
  return (
    <div className="doctor-card" onClick={() => onClick && onClick(doctor)}>
      <div className="doctor-card-avatar" style={{ backgroundColor: '#38BDF8' }}>
        {initials}
      </div>
      <div className="doctor-card-info">
        <h4>{doctor.name}</h4>
        <p className="doctor-specialization">{doctor.specialization}</p>
        <div className="doctor-card-details">
          <span>{doctor.experience} yrs exp</span>
          <span className="doctor-rating">★ {doctor.rating}</span>
        </div>
        <p className="doctor-fee">Fee: ₹{doctor.fee}</p>
      </div>
      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onBook && onBook(doctor); }}>
        Book Appointment
      </button>
    </div>
  );
};

export default DoctorCard;
