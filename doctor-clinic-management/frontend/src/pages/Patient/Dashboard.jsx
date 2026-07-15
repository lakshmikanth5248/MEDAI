import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Modal, ConfirmModal } from '../../components/Modal';
import { currentPatient, appointments, prescriptions, doctors } from '../../utils/mockData';
import { getStatusBadgeClass, formatDate } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptList, setApptList] = useState(() =>
    appointments
      .filter((a) => a.patientId === currentPatient.id)
      .map((a) => ({ ...a, doctorName: doctors.find((d) => d.id === a.doctorId)?.name || 'Unknown' }))
  );
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelApptId, setCancelApptId] = useState(null);

  const patientAppts = apptList;
  const upcomingAppt = patientAppts.find((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));
  const pastAppts = patientAppts.filter((a) => ['completed', 'cancelled'].includes(a.status?.toLowerCase()));
  const patientPrescriptions = prescriptions
    .filter((p) => p.patientId === currentPatient.id)
    .map((p) => ({ ...p, doctorName: doctors.find((d) => d.id === p.doctorId)?.name || 'Unknown' }));

  const openReschedule = (appt) => {
    setRescheduleAppt(appt);
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time);
  };

  const confirmReschedule = () => {
    if (!rescheduleAppt) return;
    setApptList((prev) =>
      prev.map((a) =>
        a.id === rescheduleAppt.id ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'rescheduled' } : a
      )
    );
    setRescheduleAppt(null);
  };

  const confirmCancel = () => {
    if (!cancelApptId) return;
    setApptList((prev) =>
      prev.map((a) => (a.id === cancelApptId ? { ...a, status: 'cancelled' } : a))
    );
    setCancelApptId(null);
  };

  const apptColumns = [
    { key: 'doctorName', label: 'Doctor' },
    { key: 'department', label: 'Department' },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
  ];

  return (
    <div className="page patient-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="patient-avatar-large">{currentPatient.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
          <div>
            <h1>Hello, {currentPatient.name}</h1>
            <p className="text-muted">{currentPatient.id}</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/patient/book-appointment"><Button icon="📅">Book Appointment</Button></Link>
          <Link to="/patient/doctors"><Button variant="outline" icon="👨‍⚕️">View Doctors</Button></Link>
          <Link to="/patient/prescriptions"><Button variant="outline" icon="💊">My Prescriptions</Button></Link>
          <Link to="/patient/medical-history"><Button variant="outline" icon="📋">Medical History</Button></Link>
        </div>
      </div>

      <div className="stats-row">
        <StatCard title="Total Appointments" value={patientAppts.length} icon="📅" color="#38BDF8" />
        <StatCard title="Upcoming" value={patientAppts.filter(a => ['scheduled', 'confirmed'].includes(a.status?.toLowerCase())).length} icon="⏰" color="#8B5CF6" />
        <StatCard title="Prescriptions" value={patientPrescriptions.length} icon="💊" color="#22C55E" />
        <StatCard title="Total Visits" value={patientAppts.filter(a => a.status?.toLowerCase() === 'completed').length} icon="🏥" color="#F97316" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {upcomingAppt && (
            <Card title="Upcoming Appointment" className="upcoming-appt-card">
              <div className="upcoming-appt">
                <div className="upcoming-details">
                  <h3>{upcomingAppt.doctorName}</h3>
                  <p className="text-muted">{upcomingAppt.department}</p>
                  <div className="upcoming-datetime">
                    <span>📅 {formatDate(upcomingAppt.date)}</span>
                    <span>⏰ {upcomingAppt.time}</span>
                    <span className={`status-badge ${getStatusBadgeClass(upcomingAppt.status)}`}>{upcomingAppt.status}</span>
                  </div>
                  <p className="text-muted">{upcomingAppt.reason}</p>
                </div>
                <div className="upcoming-actions">
                  <Button variant="outline" size="sm" onClick={() => openReschedule(upcomingAppt)}>Reschedule</Button>
                  <Button variant="danger" size="sm" onClick={() => setCancelApptId(upcomingAppt.id)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          <Card title="Appointment History">
            <DataTable columns={apptColumns} data={pastAppts.slice(0, 5)} onRowClick={setSelectedAppt} />
          </Card>

          <Card title="Recent Prescriptions">
            {patientPrescriptions.slice(0, 3).map((prx) => (
              <div key={prx.id} className="prescription-card" onClick={() => navigate('/patient/prescriptions')}>
                <div className="prx-header">
                  <span className="prx-doctor">{prx.doctorName}</span>
                  <span className="prx-date">{formatDate(prx.date)}</span>
                </div>
                <p className="prx-diagnosis">{prx.notes || prx.medicines?.map((m) => m.name).join(', ')}</p>
              </div>
            ))}
            {patientPrescriptions.length === 0 && <p className="text-muted">No prescriptions yet.</p>}
          </Card>
        </div>

        <div className="dashboard-sidebar">
          <Card title="Profile Summary">
            <div className="profile-summary">
              <div className="profile-summary-item"><label>Name</label><span>{currentPatient.name}</span></div>
              <div className="profile-summary-item"><label>DOB</label><span>{currentPatient.dob}</span></div>
              <div className="profile-summary-item"><label>Blood Group</label><span className="blood-badge">{currentPatient.bloodGroup}</span></div>
              <div className="profile-summary-item"><label>Phone</label><span>{currentPatient.phone}</span></div>
              <div className="profile-summary-item"><label>Email</label><span>{currentPatient.email}</span></div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/patient/profile')}>Edit Profile</Button>
          </Card>
        </div>
      </div>

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

      <ConfirmModal
        isOpen={!!cancelApptId}
        onClose={() => setCancelApptId(null)}
        onConfirm={confirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Cancel Appointment"
        variant="danger"
      />
    </div>
  );
};

export default Dashboard;
