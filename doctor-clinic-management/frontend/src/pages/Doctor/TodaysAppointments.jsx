import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { appointments, currentDoctor, patients } from '../../utils/mockData';
import { getStatusBadgeClass, getInitials, calculateAge } from '../../utils/helpers';
import './TodaysAppointments.css';

const TodaysAppointments = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);

  const todayAppts = appointments.filter((a) => a.date === '2024-12-26' && a.doctorId === currentDoctor.id);

  const filtered = todayAppts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.patientName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getPatient = (patientId) => patients.find((p) => p.id === patientId);

  return (
    <div className="page todays-appointments">
      <div className="page-header">
        <h1>Today's Appointments</h1>
        <div className="ta-filters">
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..." />
          <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
            { value: 'All', label: 'All' },
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'Arrived', label: 'Arrived' },
            { value: 'Completed', label: 'Completed' },
          ]} />
        </div>
      </div>

      <div className="today-list">
        {filtered.map((appt) => {
          const patient = getPatient(appt.patientId);
          return (
            <div key={appt.id} className="today-card" onClick={() => setSelectedAppt(appt)}>
              <div className="today-time">{appt.time}</div>
              <div className="today-avatar">{getInitials(appt.patientName)}</div>
              <div className="today-info">
                <h4>{appt.patientName}</h4>
                <p className="text-muted">{patient ? `${calculateAge(patient.dob)} yrs, ${patient.gender}` : ''} | {appt.reason}</p>
              </div>
              <div className="today-status">
                <span className={`status-badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
              </div>
              <div className="today-actions">
                {appt.status === 'Arrived' && <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/doctor/consultation/${appt.id}`); }}>Start Consultation</Button>}
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}>View Details</Button>
                {appt.status !== 'Completed' && appt.status !== 'Cancelled' && <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); }}>No-Show</Button>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No appointments found.</p>}
      </div>

      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Appointment Details">
        {selectedAppt && (
          <div className="appt-detail-modal">
            <div className="appt-detail-row"><label>Patient</label><span>{selectedAppt.patientName}</span></div>
            <div className="appt-detail-row"><label>Time</label><span>{selectedAppt.time}</span></div>
            <div className="appt-detail-row"><label>Reason</label><span>{selectedAppt.reason}</span></div>
            <div className="appt-detail-row"><label>Status</label><span className={`status-badge ${getStatusBadgeClass(selectedAppt.status)}`}>{selectedAppt.status}</span></div>
            <div className="appt-detail-row"><label>Room</label><span>{selectedAppt.roomNo}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TodaysAppointments;
