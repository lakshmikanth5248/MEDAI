import React from 'react';
import { StatCard, Card } from '../../components/Cards';
import { DataTable } from '../../components/Tables';
import { admin, patients, doctors, appointments, bills, departments, statsData } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Dashboard.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const totalRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const recentPatients = patients.slice(0, 5);
  const recentAppts = appointments.filter((a) => a.date === '2024-12-26');

  const totalAppointments = appointments.length;
  const monthlyAppointments = appointments.filter((a) => a.date?.startsWith('2025-07')).length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const totalDepartments = departments.length;
  const doctorsPerDept = (doctors.length / departments.length).toFixed(1);
  const newPatientsThisMonth = patients.filter((p) => p.registeredDate?.startsWith('2025-0')).length;
  const patientGrowthPct = statsData.patientGrowth;
  const revenueGrowthPct = statsData.revenueGrowth;

  const chartTotals = [
    {
      title: t('pg.admin.dashboard.chartMonthlyAppointments'),
      total: monthlyAppointments,
      sub: `${totalAppointments} ${t('pg.admin.dashboard.total')} · ${completedAppointments} ${t('pg.admin.dashboard.completed')}`,
      icon: '📅',
      color: '#38BDF8',
      visual: 'line',
    },
    {
      title: t('pg.admin.dashboard.chartRevenue'),
      total: `₹${totalRevenue.toLocaleString()}`,
      sub: `${revenueGrowthPct}% ${t('pg.admin.dashboard.growth')} · ${bills.length} ${t('pg.admin.dashboard.bills')}`,
      icon: '💰',
      color: '#F97316',
      visual: 'bar',
    },
    {
      title: t('pg.admin.dashboard.chartDeptDistribution'),
      total: totalDepartments,
      sub: `${doctors.length} ${t('pg.admin.dashboard.doctors')} · ${doctorsPerDept} ${t('pg.admin.dashboard.avgPerDept')}`,
      icon: '🏛️',
      color: '#14B8A6',
      visual: 'pie',
    },
    {
      title: t('pg.admin.dashboard.chartPatientGrowth'),
      total: `+${newPatientsThisMonth}`,
      sub: `${patients.length} ${t('pg.admin.dashboard.total')} · ${patientGrowthPct}% ${t('pg.admin.dashboard.growth')}`,
      icon: '👥',
      color: '#22C55E',
      visual: 'area',
    },
  ];

  const patientColumns = [
    { key: 'id', label: t('pg.admin.dashboard.colId') },
    { key: 'name', label: t('pg.admin.dashboard.colName') },
    { key: 'gender', label: t('pg.admin.dashboard.colGender') },
    { key: 'phone', label: t('pg.admin.dashboard.colPhone') },
    { key: 'registeredDate', label: t('pg.admin.dashboard.colRegistered'), render: (v) => formatDate(v) },
  ];

  const health = [
    { label: t('pg.admin.dashboard.healthServerStatus'), value: t('pg.admin.dashboard.healthOnline'), color: '#22C55E' },
    { label: t('pg.admin.dashboard.healthDatabase'), value: t('pg.admin.dashboard.healthConnected'), color: '#22C55E' },
    { label: t('pg.admin.dashboard.healthSmsService'), value: t('common.active'), color: '#22C55E' },
    { label: t('pg.admin.dashboard.healthApiResponse'), value: '120ms', color: '#38BDF8' },
  ];

  return (
    <div className="page admin-dashboard">
      <div className="page-header">
        <h1>{t('pg.admin.dashboard.title')}</h1>
        <p className="text-muted">{t('pg.admin.dashboard.overview')} {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="admin-stats-grid">
        <StatCard title={t('pg.admin.dashboard.statTotalPatients')} value={patients.length} icon="👥" color="#38BDF8" />
        <StatCard title={t('pg.admin.dashboard.statTotalDoctors')} value={doctors.length} icon="👨‍⚕️" color="#8B5CF6" />
        <StatCard title={t('pg.admin.dashboard.statTotalAppointments')} value={appointments.length} icon="📅" color="#22C55E" />
        <StatCard title={t('pg.admin.dashboard.statRevenueTotal')} value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#F97316" />
        <StatCard title={t('pg.admin.dashboard.statTodaysAppointments')} value={recentAppts.length} icon="📋" color="#EC4899" />
        <StatCard title={t('pg.admin.dashboard.statPendingBills')} value={bills.filter((b) => b.status === 'Pending').length} icon="🧾" color="#F59E0B" />
        <StatCard title={t('sidebar.departments')} value="10" icon="🏛️" color="#14B8A6" />
        <StatCard title={t('pg.admin.dashboard.statActiveUsers')} value="6" icon="👤" color="#6366F1" />
      </div>

      <div className="admin-charts">
        {chartTotals.map((c) => (
          <Card title={c.title} className="chart-card" key={c.title}>
            <div className="chart-total" style={{ color: c.color }}>
              <span className="chart-total-icon">{c.icon}</span>
              <span className="chart-total-value">{c.total}</span>
            </div>
            <p className="chart-total-sub">{c.sub}</p>
            <div className="chart-placeholder">
              <div className={`chart-${c.visual}`}></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="admin-grid">
        <Card title={t('pg.admin.dashboard.recentRegistrations')}>
          <DataTable columns={patientColumns} data={recentPatients} />
        </Card>

        <Card title={t('pg.admin.dashboard.systemHealth')}>
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

      <Card title={t('pg.admin.dashboard.recentActivity')}>
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
