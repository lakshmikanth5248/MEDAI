import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { doctors } from '../../utils/mockData';
import { getInitials } from '../../utils/helpers';
import './Doctors.css';

const Doctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDept = location.state?.department || 'All';
  const [activeDept, setActiveDept] = useState(initialDept);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const departments = ['All', ...new Set(doctors.map((d) => d.department))];

  const filtered = doctors.filter((d) => {
    const matchDept = activeDept === 'All' || d.department === activeDept;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const doctorDetailColumns = [
    { key: 'label', label: '' },
    { key: 'value', label: '' },
  ];

  if (selectedDoctor) {
    const detailData = [
      { label: 'Name', value: selectedDoctor.name },
      { label: 'Specialization', value: selectedDoctor.specialization },
      { label: 'Department', value: selectedDoctor.department },
      { label: 'Experience', value: `${selectedDoctor.experience} years` },
      { label: 'Qualification', value: selectedDoctor.qualification },
      { label: 'License No', value: selectedDoctor.licenseNo },
      { label: 'Fee', value: `₹${selectedDoctor.fee}` },
      { label: 'Rating', value: `★ ${selectedDoctor.rating}` },
      { label: 'Email', value: selectedDoctor.email },
      { label: 'Phone', value: selectedDoctor.phone },
      { label: 'Availability', value: selectedDoctor.availability.join(', ') },
    ];
  }

  return (
    <div className="page doctors-page">
      <div className="page-header">
        <h1>Our Doctors</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization..." />
      </div>

      <div className="dept-tabs">
        {departments.map((dept) => (
          <button key={dept} className={`dept-tab ${activeDept === dept ? 'active' : ''}`} onClick={() => setActiveDept(dept)}>
            {dept}
          </button>
        ))}
      </div>

      <div className="doctors-grid">
        {filtered.map((doc) => (
          <div key={doc.id} className="doctor-card-item" onClick={() => setSelectedDoctor(doc)}>
            <div className="doc-avatar" style={{ backgroundColor: '#38BDF8' }}>{getInitials(doc.name)}</div>
            <h4>{doc.name}</h4>
            <p className="doc-specialization">{doc.specialization}</p>
            <div className="doc-meta">
              <span>{doc.experience} yrs</span>
              <span className="doc-rating">★ {doc.rating}</span>
            </div>
            <p className="doc-fee">₹{doc.fee}</p>
            <p className="doc-availability">{doc.availability.slice(0, 3).join(', ')}{doc.availability.length > 3 ? '...' : ''}</p>
            <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/patient/book-appointment', { state: { doctor: doc } }); }}>
              Book Appointment
            </Button>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} title="Doctor Profile" size="lg">
        {selectedDoctor && (
          <div className="doctor-profile-modal">
            <div className="dp-header">
              <div className="dp-avatar" style={{ backgroundColor: '#38BDF8' }}>{getInitials(selectedDoctor.name)}</div>
              <div>
                <h2>{selectedDoctor.name}</h2>
                <p className="text-muted">{selectedDoctor.specialization} | {selectedDoctor.department}</p>
                <div className="dp-rating">★ {selectedDoctor.rating} | {selectedDoctor.experience} years experience</div>
              </div>
            </div>
            <div className="dp-details">
              <div className="dp-detail-item"><label>Qualification</label><span>{selectedDoctor.qualification}</span></div>
              <div className="dp-detail-item"><label>License No</label><span>{selectedDoctor.licenseNo}</span></div>
              <div className="dp-detail-item"><label>Consultation Fee</label><span>₹{selectedDoctor.fee}</span></div>
              <div className="dp-detail-item"><label>Email</label><span>{selectedDoctor.email}</span></div>
              <div className="dp-detail-item"><label>Phone</label><span>{selectedDoctor.phone}</span></div>
              <div className="dp-detail-item"><label>Available Days</label><span>{selectedDoctor.availability.join(', ')}</span></div>
            </div>
            <Button onClick={() => { setSelectedDoctor(null); navigate('/patient/book-appointment', { state: { doctor: selectedDoctor } }); }}>
              Book Appointment
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Doctors;
