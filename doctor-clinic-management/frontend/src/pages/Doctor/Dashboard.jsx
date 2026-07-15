import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { currentDoctor, appointments, patients, prescriptions } from '../../utils/mockData';
import { getStatusBadgeClass, getCurrentDate, getCurrentTime } from '../../utils/helpers';
import './Dashboard.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [time, setTime] = useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(getCurrentTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = '2025-07-14';

  const todayAppts = appointments
    .filter((a) => a.date === todayDate && a.doctorId === currentDoctor.id)
    .map((a) => ({
      ...a,
      patientName: patients.find((p) => p.id === a.patientId)?.name || 'Unknown',
    }));

  const pendingConsultations = todayAppts.filter((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));

  const totalPatients = [...new Set(appointments.filter((a) => a.doctorId === currentDoctor.id).map((a) => a.patientId))].length;

  const todayPrescriptions = prescriptions.filter((p) => p.doctorId === currentDoctor.id && p.date === todayDate).length;

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
          <h1>{t('pg.doctor.dashboard.greeting')} {greeting}, {currentDoctor.name}</h1>
          <p className="text-muted">{currentDoctor.specialization} | {getCurrentDate()} | {time}</p>
        </div>
      </div>

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
        <DataTable columns={columns} data={todayAppts} onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)} />
      </Card>
    </div>
  );
};

export default Dashboard;
