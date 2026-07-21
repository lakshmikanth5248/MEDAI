import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as billingApi from '../../services/api/billing';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import './Reception.css';
import { useTranslation } from '../../i18n/LanguageContext';

const getToday = () => new Date().toISOString().slice(0, 10);

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = resolveProfile(user) || {};

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      clinicalApi.getPatients(),
      clinicalApi.getAppointments(),
      billingApi.getBills(),
      clinicalApi.getDoctors(),
    ])
      .then(([p, a, b, d]) => {
        if (cancelled) return;
        setPatients(p || []);
        setAppointments(a || []);
        setBills(b || []);
        setDoctors(d || []);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load dashboard data'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const TODAY = getToday();
  const totalPatients = patients.length;
  const todaysAppts = appointments.filter((a) => a.date === TODAY);
  const pendingAppts = appointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status));
  const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);

  const patientName = (id) => patients.find((p) => p.id === id)?.name || t('pg.reception.dashboard.unknown');
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || t('pg.reception.dashboard.unknown');

  const recentPatients = [...patients]
    .sort((a, b) => (a.registeredDate < b.registeredDate ? 1 : -1))
    .slice(0, 5);

  if (loading) return <PageLoader />;

  const apptColumns = [
    { key: 'time', label: t('pg.reception.dashboard.colTime') },
    { key: 'patient', label: t('pg.reception.dashboard.colPatient'), render: (_, r) => patientName(r.patientId) },
    { key: 'doctor', label: t('pg.reception.dashboard.colDoctor'), render: (_, r) => doctorName(r.doctorId) },
    { key: 'department', label: t('pg.reception.dashboard.colDepartment') },
    {
      key: 'status',
      label: t('pg.reception.dashboard.colStatus'),
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
  ];

  const patientColumns = [
    { key: 'patientId', label: t('pg.reception.dashboard.colPatientId') },
    { key: 'name', label: t('pg.reception.dashboard.colName') },
    { key: 'gender', label: t('pg.reception.dashboard.colGender') },
    { key: 'phone', label: t('pg.reception.dashboard.colPhone') },
    { key: 'registeredDate', label: t('pg.reception.dashboard.colRegistered'), render: (v) => formatDate(v) },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>{t('pg.reception.dashboard.title')}, {profile.name}</h1>
        <p className="text-muted">
          {profile.receptionId || profile.id}{profile.email ? ` | ${profile.email}` : ''}{profile.floor ? ` | ${t('floor')}: ${profile.floor}` : ''}{profile.shift ? ` | ${profile.shift}` : ''}
        </p>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="rec-stats">
        <StatCard title={t('pg.reception.dashboard.statTotalPatients')} value={totalPatients} icon="👥" color="#38BDF8" />
        <StatCard title={t('pg.reception.dashboard.todaysAppointments')} value={todaysAppts.length} icon="📅" color="#22C55E" />
        <StatCard title={t('pg.reception.dashboard.statPendingAppointments')} value={pendingAppts.length} icon="⏳" color="#F97316" />
        <StatCard title={t('pg.reception.dashboard.statRevenue')} value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#8B5CF6" />
      </div>

      <div className="rec-quick">
        <Link to="/reception/register-patient"><Button icon="📝">{t('pg.reception.dashboard.registerBtn')}</Button></Link>
        <Link to="/reception/patients"><Button variant="outline" icon="👥">{t('pg.reception.dashboard.viewPatientsBtn')}</Button></Link>
        <Link to="/reception/appointments"><Button variant="outline" icon="📅">{t('pg.reception.dashboard.manageApptsBtn')}</Button></Link>
        <Link to="/reception/billing"><Button variant="outline" icon="💰">{t('pg.reception.dashboard.billingBtn')}</Button></Link>
      </div>

      <div className="rec-grid">
        <Card title={t('pg.reception.dashboard.todaysAppointments')} subtitle={`${todaysAppts.length} ${t('pg.reception.dashboard.scheduledFor')} ${formatDate(TODAY)}`}>
          <DataTable columns={apptColumns} data={todaysAppts} emptyMessage={t('pg.reception.dashboard.apptsEmpty')} />
        </Card>

        <Card title={t('pg.reception.dashboard.recentlyRegistered')} subtitle={`${recentPatients.length} ${t('pg.reception.dashboard.latestPatients')}`}>
          <DataTable columns={patientColumns} data={recentPatients} emptyMessage={t('pg.reception.dashboard.patientsEmpty')} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
