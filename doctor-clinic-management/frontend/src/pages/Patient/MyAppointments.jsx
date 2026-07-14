import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { appointments, currentPatient } from '../../utils/mockData';
import { getStatusBadgeClass, formatDate, getInitials } from '../../utils/helpers';
import './MyAppointments.css';

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const allPatientAppts = appointments.filter((a) => a.patientId === currentPatient.id);

  const upcoming = allPatientAppts.filter((a) => ['Scheduled', 'Confirmed', 'Arrived'].includes(a.status));
  const past = allPatientAppts.filter((a) => a.status === 'Completed');
  const cancelled = allPatientAppts.filter((a) => a.status === 'Cancelled');

  const displayAppts = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  const filtered = dateFilter
    ? displayAppts.filter((a) => a.date === dateFilter)
    : displayAppts;

  return (
    <div className="page my-appointments">
      <div className="page-header">
        <h1>My Appointments</h1>
      </div>

      <div className="appt-tabs">
        <button className={`appt-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          Upcoming {upcoming.length > 0 && <span className="tab-count">{upcoming.length}</span>}
        </button>
        <button className={`appt-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past</button>
        <button className={`appt-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
      </div>

      <div className="appt-filters">
        <input type="date" className="form-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No {activeTab} appointments</h3>
          <p className="text-muted">You don't have any {activeTab} appointments at the moment.</p>
          {activeTab === 'upcoming' && <Button onClick={() => window.location.href = '/patient/book-appointment'}>Book Appointment</Button>}
        </div>
      ) : (
        <div className="appt-list">
          {filtered.map((appt) => (
            <div key={appt.id} className="appointment-card" onClick={() => setSelectedAppt(appt)}>
              <div className="appt-card-avatar">{getInitials(appt.doctorName)}</div>
              <div className="appt-card-info">
                <h4>{appt.doctorName}</h4>
                <p className="text-muted">{appt.department}</p>
                <div className="appt-card-meta">
                  <span>📅 {formatDate(appt.date)}</span>
                  <span>⏰ {appt.time}</span>
                  <span className={`status-badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
                </div>
                <p className="text-muted">Room: {appt.roomNo}</p>
              </div>
              <div className="appt-card-actions">
                {['Scheduled', 'Confirmed'].includes(appt.status) && (
                  <>
                    <Button variant="danger" size="sm">Cancel</Button>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Appointment Details">
        {selectedAppt && (
          <div className="appt-detail-modal">
            <div className="appt-detail-row"><label>Doctor</label><span>{selectedAppt.doctorName}</span></div>
            <div className="appt-detail-row"><label>Department</label><span>{selectedAppt.department}</span></div>
            <div className="appt-detail-row"><label>Date</label><span>{formatDate(selectedAppt.date)}</span></div>
            <div className="appt-detail-row"><label>Time</label><span>{selectedAppt.time}</span></div>
            <div className="appt-detail-row"><label>Status</label><span className={`status-badge ${getStatusBadgeClass(selectedAppt.status)}`}>{selectedAppt.status}</span></div>
            <div className="appt-detail-row"><label>Reason</label><span>{selectedAppt.reason}</span></div>
            <div className="appt-detail-row"><label>Room</label><span>{selectedAppt.roomNo}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
