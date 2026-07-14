import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { currentDoctor, appointments } from '../../utils/mockData';
import { getStatusBadgeClass, getCurrentDate, getCurrentTime } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(getCurrentTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayAppts = appointments.filter((a) => a.date === '2024-12-26' && a.doctorId === currentDoctor.id);
  const pendingConsultations = todayAppts.filter((a) => ['Scheduled', 'Confirmed', 'Arrived'].includes(a.status));

  const columns = [
    { key: 'time', label: 'Time', render: (v) => <span className="appt-time">{v}</span> },
    { key: 'patientName', label: 'Patient' },
    { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/doctor/consultation/${row.id}`); }}>Start Consultation</Button>
      ),
    },
  ];

  return (
    <div className="page doctor-dashboard">
      <div className="page-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentDoctor.name}</h1>
          <p className="text-muted">{currentDoctor.specialization} | {getCurrentDate()} | {time}</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard title="Today's Appointments" value={todayAppts.length} icon="📅" color="#38BDF8" />
        <StatCard title="Pending Consultations" value={pendingConsultations.length} icon="⏳" color="#F97316" />
        <StatCard title="Prescriptions Today" value="5" icon="💊" color="#8B5CF6" />
        <StatCard title="Total Patients" value={currentDoctor.patientsCount} icon="👥" color="#22C55E" />
      </div>

      <div className="quick-actions">
        <Link to="/doctor/todays-appointments"><Button icon="📋">View Schedule</Button></Link>
        <Link to="/doctor/prescription"><Button variant="outline" icon="💊">Write Prescription</Button></Link>
        <Button variant="outline" icon="👥">Patient Records</Button>
      </div>

      <Card title="Today's Schedule" subtitle={`${pendingConsultations.length} pending`}>
        <DataTable columns={columns} data={todayAppts} onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)} />
      </Card>
    </div>
  );
};

export default Dashboard;
