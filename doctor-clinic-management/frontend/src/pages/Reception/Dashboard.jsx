import React from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { patients, appointments, bills, doctors } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Reception.css';

const TODAY = '2025-07-14';

const Dashboard = () => {
  const totalPatients = patients.length;
  const todaysAppts = appointments.filter((a) => a.date === TODAY);
  const pendingAppts = appointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status));
  const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);

  const patientName = (id) => patients.find((p) => p.id === id)?.name || 'Unknown';
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  const recentPatients = [...patients]
    .sort((a, b) => (a.registeredDate < b.registeredDate ? 1 : -1))
    .slice(0, 5);

  const apptColumns = [
    { key: 'time', label: 'Time' },
    { key: 'patient', label: 'Patient', render: (_, r) => patientName(r.patientId) },
    { key: 'doctor', label: 'Doctor', render: (_, r) => doctorName(r.doctorId) },
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
  ];

  const patientColumns = [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'registeredDate', label: 'Registered', render: (v) => formatDate(v) },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>Reception Dashboard</h1>
        <p className="text-muted">
          Overview of patient registrations, appointments and billing at a glance.
        </p>
      </div>

      <div className="rec-stats">
        <StatCard title="Total Patients" value={totalPatients} icon="👥" color="#38BDF8" />
        <StatCard title="Today's Appointments" value={todaysAppts.length} icon="📅" color="#22C55E" />
        <StatCard title="Pending Appointments" value={pendingAppts.length} icon="⏳" color="#F97316" />
        <StatCard title="Revenue (Total)" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#8B5CF6" />
      </div>

      <div className="rec-quick">
        <Link to="/reception/register-patient"><Button icon="📝">Register Patient</Button></Link>
        <Link to="/reception/patients"><Button variant="outline" icon="👥">View Patients</Button></Link>
        <Link to="/reception/appointments"><Button variant="outline" icon="📅">Manage Appointments</Button></Link>
        <Link to="/reception/billing"><Button variant="outline" icon="💰">Billing</Button></Link>
      </div>

      <div className="rec-grid">
        <Card title="Today's Appointments" subtitle={`${todaysAppts.length} scheduled for ${formatDate(TODAY)}`}>
          <DataTable columns={apptColumns} data={todaysAppts} emptyMessage="No appointments today" />
        </Card>

        <Card title="Recently Registered" subtitle={`${recentPatients.length} latest patients`}>
          <DataTable columns={patientColumns} data={recentPatients} emptyMessage="No patients registered" />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
