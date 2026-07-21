import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import * as clinicalApi from '../../services/api/clinical';
import * as prescriptionsApi from '../../services/api/prescriptions';
import { getErrorMessage } from '../../services/apiError';
import { getStatusBadgeClass, getCurrentTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import './Dashboard.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = resolveProfile(user);
  const doctorId = profile?.doctorId || user?.id;
  const doctorName = profile?.name || user?.name || '';
  const [time, setTime] = useState(getCurrentTime());

  const [todayAppts, setTodayAppts] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayPrescriptions, setTodayPrescriptions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(getCurrentTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [appts, doctorPatients] = await Promise.all([
          clinicalApi.getTodayAppointments({ doctorId: user.id }),
          clinicalApi.getDoctorPatients(user.id),
        ]);
        if (cancelled) return;

        const patientNameById = new Map(doctorPatients.map((p) => [p.id, p.name]));
        const apptsWithNames = appts.map((a) => ({
          ...a,
          patientName: patientNameById.get(a.patientId) || 'Unknown',
        }));
        setTodayAppts(apptsWithNames);
        setTotalPatients(doctorPatients.length);

        const todayISO = new Date().toLocaleDateString('en-CA');
        const allPrx = await prescriptionsApi.getPrescriptions({ doctorId: user.id });
        if (cancelled) return;
        setTodayPrescriptions(allPrx.filter((p) => p.date === todayISO).length);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const pendingConsultations = todayAppts.filter((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));

  const columns = [
    { key: 'time', label: t('pg.doctor.dashboard.colTime'), render: (v) => <span className="appt-time">{v}</span> },
    { key: 'patientName', label: t('pg.doctor.dashboard.colPatient') },
    { key: 'status', label: t('pg.doctor.dashboard.colStatus'), render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/doctor/consultation/${row.id}`); }}>{t('pg.doctor.dashboard.startConsultation')}</Button>
      ),
    },
  ];

  const greeting = new Date().getHours() < 12 ? t('pg.doctor.dashboard.greetingMorning') : new Date().getHours() < 17 ? t('pg.doctor.dashboard.greetingAfternoon') : t('pg.doctor.dashboard.greetingEvening');

  return (
    <div className="page doctor-dashboard">
      <div className="page-header">
        <div>
          <h1>{t('pg.doctor.dashboard.greeting')} {greeting}, {doctorName}</h1>
          <p className="text-muted">{(profile?.specialization && profile?.department) ? `${profile.specialization} | ${profile.department}` : (profile?.specialization || profile?.department || '')} | {profile?.doctorId || doctorId}</p>
          <p className="text-muted">{profile?.email}{profile?.phone ? ` | ${profile.phone}` : ''}</p>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="stats-row">
        <StatCard title={t('sidebar.todayAppointments')} value={todayAppts.length} icon="📅" color="#38BDF8" />
        <StatCard title={t('pg.doctor.dashboard.pendingConsultations')} value={pendingConsultations.length} icon="⏳" color="#F97316" />
        <StatCard title={t('pg.doctor.dashboard.prescriptionsToday')} value={todayPrescriptions} icon="💊" color="#8B5CF6" />
        <StatCard title={t('pg.doctor.dashboard.totalPatients')} value={totalPatients} icon="👥" color="#22C55E" />
      </div>

      <div className="quick-actions">
        <Link to="/doctor/appointments"><Button icon="📋">{t('pg.doctor.dashboard.viewSchedule')}</Button></Link>
        <Link to="/doctor/prescription"><Button variant="outline" icon="💊">{t('pg.doctor.dashboard.writePrescription')}</Button></Link>
        <Button variant="outline" icon="👥" onClick={() => navigate('/doctor/patient')}>{t('pg.doctor.dashboard.patientRecords')}</Button>
      </div>

      <Card title={t('pg.doctor.dashboard.todaySchedule')} subtitle={`${pendingConsultations.length} ${t('pg.doctor.dashboard.pending')}`}>
        <DataTable columns={columns} data={todayAppts} loading={loading} onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)} />
      </Card>
    </div>
  );
};

export default Dashboard;
