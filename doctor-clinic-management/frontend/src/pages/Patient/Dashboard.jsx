import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Modal, ConfirmModal } from '../../components/Modal';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as notifApi from '../../services/api/notifications';
import { getErrorMessage } from '../../services/apiError';
import { resolveProfile } from '../../utils/profile';
import { getStatusBadgeClass, formatDate } from '../../utils/helpers';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = resolveProfile(user) || {};
  const patientId = user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apptList, setApptList] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelApptId, setCancelApptId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadData = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [appts, doctors, prescriptions, notifs] = await Promise.all([
        clinicalApi.getAppointments({ patientId }),
        clinicalApi.getDoctors(),
        prescriptionsApi.getPrescriptions({ patientId }),
        notifApi.getNotifications().catch(() => []),
      ]);
      const doctorName = (doctorId) => doctors.find((d) => d.id === doctorId)?.name || 'Unknown';
      setApptList(appts.map((a) => ({ ...a, doctorName: doctorName(a.doctorId) })));
      setPatientPrescriptions(prescriptions.map((p) => ({ ...p, doctorName: doctorName(p.doctorId) })));
      setNotifications((notifs || []).filter((n) => !n.targetUserId || n.targetUserId === user?.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [patientId, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const patientAppts = apptList;
  const upcomingAppt = patientAppts.find((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));
  const pastAppts = patientAppts.filter((a) => ['completed', 'cancelled'].includes(a.status?.toLowerCase()));

  const openReschedule = (appt) => {
    setActionError(null);
    setRescheduleAppt(appt);
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time);
  };

  const confirmReschedule = async () => {
    if (!rescheduleAppt) return;
    setActionError(null);
    try {
      const updated = await clinicalApi.updateAppointmentStatus(rescheduleAppt.id, {
        status: 'rescheduled',
        date: rescheduleDate,
        time: rescheduleTime,
      });
      setApptList((prev) =>
        prev.map((a) => (a.id === rescheduleAppt.id ? { ...a, ...updated, doctorName: a.doctorName } : a))
      );
      setRescheduleAppt(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to reschedule appointment'));
    }
  };

  const confirmCancel = async () => {
    if (!cancelApptId) return;
    setActionError(null);
    try {
      const updated = await clinicalApi.updateAppointmentStatus(cancelApptId, { status: 'cancelled' });
      setApptList((prev) =>
        prev.map((a) => (a.id === cancelApptId ? { ...a, ...updated, doctorName: a.doctorName } : a))
      );
      setCancelApptId(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to cancel appointment'));
      setCancelApptId(null);
    }
  };

  const apptColumns = [
    { key: 'doctorName', label: t('pg.patient.dashboard.colDoctor') },
    { key: 'department', label: t('pg.patient.dashboard.colDepartment') },
    { key: 'date', label: t('pg.patient.dashboard.colDate'), render: (v) => formatDate(v) },
    { key: 'time', label: t('pg.patient.dashboard.colTime') },
    { key: 'status', label: t('pg.patient.dashboard.colStatus'), render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="page patient-dashboard">
      {error && <p className="text-danger">{error}</p>}
      {actionError && <p className="text-danger">{actionError}</p>}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="patient-avatar-large">{(profile.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}</div>
           <div>
            <h1>{t('pg.patient.dashboard.hello')}{profile.name}</h1>
            <p className="text-muted">{profile.patientId || profile.id}{profile.email ? ` | ${profile.email}` : ''}</p>
            <p className="text-muted">{[profile.gender, profile.bloodGroup, profile.dob && formatDate(profile.dob)].filter(Boolean).join(' | ')}</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/patient/book-appointment"><Button icon="📅">{t('pg.patient.dashboard.bookAppointment')}</Button></Link>
          <Link to="/patient/doctors"><Button variant="outline" icon="👨‍⚕️">{t('pg.patient.dashboard.viewDoctors')}</Button></Link>
          <Link to="/patient/prescriptions"><Button variant="outline" icon="💊">{t('pg.patient.dashboard.myPrescriptions')}</Button></Link>
          <Link to="/patient/medical-history"><Button variant="outline" icon="📋">{t('pg.patient.dashboard.medicalHistory')}</Button></Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {upcomingAppt && (
            <Card title={t('pg.patient.dashboard.upcomingAppointment')} className="upcoming-appt-card">
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
                  <Button variant="outline" size="sm" onClick={() => openReschedule(upcomingAppt)}>{t('pg.patient.dashboard.reschedule')}</Button>
                  <Button variant="danger" size="sm" onClick={() => setCancelApptId(upcomingAppt.id)}>{t('pg.patient.dashboard.cancelBtn')}</Button>
                </div>
              </div>
            </Card>
          )}

          <Card title={t('pg.patient.dashboard.appointmentHistory')}>
            <DataTable columns={apptColumns} data={pastAppts.slice(0, 5)} onRowClick={setSelectedAppt} />
          </Card>

          <Card title={t('pg.patient.dashboard.recentPrescriptions')}>
            {patientPrescriptions.slice(0, 3).map((prx) => (
              <div key={prx.id} className="prescription-card" onClick={() => navigate('/patient/prescriptions')}>
                <div className="prx-header">
                  <span className="prx-doctor">{prx.doctorName}</span>
                  <span className="prx-date">{formatDate(prx.date)}</span>
                </div>
                <p className="prx-diagnosis">{prx.notes || prx.medicines?.map((m) => m.name).join(', ')}</p>
                {prx.pdfPath && (
                  <a
                    href={`${process.env.REACT_APP_API_URL || ''}/api/prescriptions/prescriptions/${prx.id}/download`}
                    className="btn btn-sm btn-outline-primary mt-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download PDF
                  </a>
                )}
              </div>
            ))}
            {patientPrescriptions.length === 0 && <p className="text-muted">{t('pg.patient.dashboard.noPrescriptions')}</p>}
          </Card>
        </div>

        <div className="dashboard-sidebar">
          <Card title={t('pg.patient.dashboard.profileSummary')}>
              <div className="profile-summary">
                <div className="profile-summary-item"><label>{t('pg.patient.dashboard.lblName')}</label><span>{profile.name}</span></div>
                <div className="profile-summary-item"><label>{t('pg.patient.dashboard.lblDob')}</label><span>{profile.dob}</span></div>
                <div className="profile-summary-item"><label>{t('pg.patient.dashboard.lblBloodGroup')}</label><span className="blood-badge">{profile.bloodGroup}</span></div>
                <div className="profile-summary-item"><label>{t('pg.patient.dashboard.lblPhone')}</label><span>{profile.phone}</span></div>
                <div className="profile-summary-item"><label>{t('pg.patient.dashboard.lblEmail')}</label><span>{profile.email}</span></div>
              </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/patient/profile')}>{t('pg.patient.dashboard.editProfile')}</Button>
          </Card>
          <Card title={t('pg.patient.dashboard.notifications')}>
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="notification-item">
                <p className="notification-message">{n.message}</p>
                <span className="notification-date text-muted">{formatDate(n.createdAt)}</span>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-muted">No notifications</p>}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        title={t('pg.patient.dashboard.rescheduleAppointment')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRescheduleAppt(null)}>{t('pg.patient.dashboard.rescheduleModalCancel')}</Button>
            <Button size="sm" onClick={confirmReschedule}>{t('pg.patient.dashboard.save')}</Button>
          </>
        }
      >
        {rescheduleAppt && (
          <div className="reschedule-form">
            <p className="text-muted">{t('pg.patient.dashboard.doctor')} {rescheduleAppt.doctorName}</p>
            <div className="form-group">
              <label>{t('pg.patient.dashboard.lblDate')}</label>
              <input type="date" className="form-input" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t('pg.patient.dashboard.lblTime')}</label>
              <input type="time" className="form-input" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!cancelApptId}
        onClose={() => setCancelApptId(null)}
        onConfirm={confirmCancel}
        title={t('pg.patient.dashboard.cancelAppointment')}
        message={t('pg.patient.dashboard.cancelConfirmMessage')}
        confirmText={t('pg.patient.dashboard.cancelAppointment')}
        variant="danger"
      />
    </div>
  );
};

export default Dashboard;
