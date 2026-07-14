import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { currentPatient, appointments, prescriptions } from '../../utils/mockData';
import { getStatusBadgeClass, formatDate } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedAppt, setSelectedAppt] = useState(null);

  const patientAppts = appointments.filter((a) => a.patientId === currentPatient.id);
  const upcomingAppt = patientAppts.find((a) => ['Scheduled', 'Confirmed', 'Arrived'].includes(a.status));
  const pastAppts = patientAppts.filter((a) => ['Completed', 'Cancelled'].includes(a.status));
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === currentPatient.id);

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
        <StatCard title="Upcoming" value={patientAppts.filter(a => ['Scheduled', 'Confirmed'].includes(a.status)).length} icon="⏰" color="#8B5CF6" />
        <StatCard title="Prescriptions" value={patientPrescriptions.length} icon="💊" color="#22C55E" />
        <StatCard title="Total Visits" value={patientAppts.filter(a => a.status === 'Completed').length} icon="🏥" color="#F97316" />
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
                  <p className="text-muted">Room: {upcomingAppt.roomNo}</p>
                </div>
                <div className="upcoming-actions">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="danger" size="sm">Cancel</Button>
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
                <p className="prx-diagnosis">{prx.diagnosis}</p>
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
    </div>
  );
};

export default Dashboard;
