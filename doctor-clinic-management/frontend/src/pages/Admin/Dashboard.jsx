import React from 'react';
import { StatCard, Card } from '../../components/Cards';
import { DataTable } from '../../components/Tables';
import { admin, patients, doctors, appointments, bills } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const totalRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const recentPatients = patients.slice(0, 5);
  const recentAppts = appointments.filter((a) => a.date === '2024-12-26');

  const patientColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'registeredDate', label: 'Registered', render: (v) => formatDate(v) },
  ];

  const health = [
    { label: 'Server Status', value: 'Online', color: '#22C55E' },
    { label: 'Database', value: 'Connected', color: '#22C55E' },
    { label: 'SMS Service', value: 'Active', color: '#22C55E' },
    { label: 'API Response', value: '120ms', color: '#38BDF8' },
  ];

  return (
    <div className="page admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">System overview as of {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="admin-stats-grid">
        <StatCard title="Total Patients" value={patients.length} icon="👥" color="#38BDF8" />
        <StatCard title="Total Doctors" value={doctors.length} icon="👨‍⚕️" color="#8B5CF6" />
        <StatCard title="Total Appointments" value={appointments.length} icon="📅" color="#22C55E" />
        <StatCard title="Revenue (Total)" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#F97316" />
        <StatCard title="Today's Appointments" value={recentAppts.length} icon="📋" color="#EC4899" />
        <StatCard title="Pending Bills" value={bills.filter((b) => b.status === 'Pending').length} icon="🧾" color="#F59E0B" />
        <StatCard title="Departments" value="10" icon="🏛️" color="#14B8A6" />
        <StatCard title="Active Users" value="6" icon="👤" color="#6366F1" />
      </div>

      <div className="admin-charts">
        <Card title="Monthly Appointments" className="chart-card"><div className="chart-placeholder"><div className="chart-line"></div></div></Card>
        <Card title="Revenue" className="chart-card"><div className="chart-placeholder"><div className="chart-bar"></div></div></Card>
        <Card title="Department Distribution" className="chart-card"><div className="chart-placeholder"><div className="chart-pie"></div></div></Card>
        <Card title="Patient Growth" className="chart-card"><div className="chart-placeholder"><div className="chart-area"></div></div></Card>
      </div>

      <div className="admin-grid">
        <Card title="Recent Registrations">
          <DataTable columns={patientColumns} data={recentPatients} />
        </Card>

        <Card title="System Health">
          <div className="health-list">
            {health.map((h, i) => (
              <div key={i} className="health-item">
                <div className="health-indicator" style={{ backgroundColor: h.color }} />
                <span className="health-label">{h.label}</span>
                <span className="health-value" style={{ color: h.color }}>{h.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <div className="activity-feed">
          {[
            { message: 'New patient registered: Divya Menon', time: '10 min ago', type: 'registration' },
            { message: 'Appointment completed: Meera Joshi', time: '45 min ago', type: 'appointment' },
            { message: 'Payment received: ₹4515 from Divya Menon', time: '1 hour ago', type: 'payment' },
            { message: 'Prescription dispensed: Rajesh Kumar', time: '2 hours ago', type: 'prescription' },
            { message: 'New doctor added: Dr. Alok Verma', time: '1 day ago', type: 'doctor' },
          ].map((act, i) => (
            <div key={i} className="activity-item">
              <div className={`activity-dot activity-${act.type}`} />
              <div className="activity-content">
                <p>{act.message}</p>
                <span className="activity-time">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
