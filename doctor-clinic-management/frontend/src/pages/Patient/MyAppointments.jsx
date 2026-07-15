import React, { useState } from 'react';
import { Button } from '../../components/Buttons';
import { Modal } from '../../components/Modal';
import { appointments, currentPatient, doctors } from '../../utils/mockData';
import { getStatusBadgeClass, formatDate, getInitials } from '../../utils/helpers';
import './MyAppointments.css';

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const [allPatientAppts, setAllPatientAppts] = useState(() =>
    appointments
      .filter((a) => a.patientId === currentPatient.id)
      .map((a) => ({ ...a, doctorName: doctors.find((d) => d.id === a.doctorId)?.name || 'Unknown' }))
  );

  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const cancelAppointment = (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setAllPatientAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  };

  const openReschedule = (appt) => {
    setRescheduleAppt(appt);
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time);
  };

  const confirmReschedule = () => {
    if (!rescheduleAppt) return;
    setAllPatientAppts((prev) =>
      prev.map((a) =>
        a.id === rescheduleAppt.id ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'rescheduled' } : a
      )
    );
    setRescheduleAppt(null);
  };

  const upcoming = allPatientAppts.filter((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));
  const past = allPatientAppts.filter((a) => a.status?.toLowerCase() === 'completed');
  const cancelled = allPatientAppts.filter((a) => a.status?.toLowerCase() === 'cancelled');

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
                <p className="text-muted">{appt.reason}</p>
              </div>
              <div className="appt-card-actions">
                {['scheduled', 'confirmed'].includes(appt.status?.toLowerCase()) && (
                  <>
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); cancelAppointment(appt.id); }}>Cancel</Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openReschedule(appt); }}>Reschedule</Button>
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
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        title="Reschedule Appointment"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRescheduleAppt(null)}>Cancel</Button>
            <Button size="sm" onClick={confirmReschedule}>Save</Button>
          </>
        }
      >
        {rescheduleAppt && (
          <div className="reschedule-form">
            <p className="text-muted">Doctor: {rescheduleAppt.doctorName}</p>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-input" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="form-input" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
