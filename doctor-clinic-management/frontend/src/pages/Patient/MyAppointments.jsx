import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/Buttons';
import { Modal } from '../../components/Modal';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getStatusBadgeClass, formatDate, getInitials } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import './MyAppointments.css';

const MyAppointments = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const patientId = user?.id;
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  const [allPatientAppts, setAllPatientAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const loadData = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [appts, doctors] = await Promise.all([
        clinicalApi.getAppointments({ patientId }),
        clinicalApi.getDoctors(),
      ]);
      setAllPatientAppts(
        appts.map((a) => ({ ...a, doctorName: doctors.find((d) => d.id === a.doctorId)?.name || 'Unknown' }))
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cancelAppointment = async (id) => {
    if (!window.confirm(t('pg.patient.myAppointments.cancelConfirm'))) return;
    setActionError(null);
    try {
      const updated = await clinicalApi.updateAppointmentStatus(id, { status: 'cancelled' });
      setAllPatientAppts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated, doctorName: a.doctorName } : a))
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to cancel appointment'));
    }
  };

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
      setAllPatientAppts((prev) =>
        prev.map((a) => (a.id === rescheduleAppt.id ? { ...a, ...updated, doctorName: a.doctorName } : a))
      );
      setRescheduleAppt(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to reschedule appointment'));
    }
  };

  const upcoming = allPatientAppts.filter((a) => ['scheduled', 'confirmed', 'arrived'].includes(a.status?.toLowerCase()));
  const past = allPatientAppts.filter((a) => a.status?.toLowerCase() === 'completed');
  const cancelled = allPatientAppts.filter((a) => a.status?.toLowerCase() === 'cancelled');

  const displayAppts = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  const filtered = dateFilter
    ? displayAppts.filter((a) => a.date === dateFilter)
    : displayAppts;

  const noAppointmentsTitle = activeTab === 'upcoming'
    ? t('pg.patient.myAppointments.noUpcomingAppointments')
    : activeTab === 'past'
      ? t('pg.patient.myAppointments.noPastAppointments')
      : t('pg.patient.myAppointments.noCancelledAppointments');

  const noAppointmentsText = activeTab === 'upcoming'
    ? t('pg.patient.myAppointments.noUpcomingText')
    : activeTab === 'past'
      ? t('pg.patient.myAppointments.noPastText')
      : t('pg.patient.myAppointments.noCancelledText');

  if (loading) return <PageLoader />;

  return (
    <div className="page my-appointments">
      <div className="page-header">
        <h1>{t('pg.patient.myAppointments.title')}</h1>
      </div>

      {error && <p className="text-danger">{error}</p>}
      {actionError && <p className="text-danger">{actionError}</p>}

      <div className="appt-tabs">
        <button className={`appt-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          {t('pg.patient.myAppointments.tabUpcoming')} {upcoming.length > 0 && <span className="tab-count">{upcoming.length}</span>}
        </button>
        <button className={`appt-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>{t('pg.patient.myAppointments.tabPast')}</button>
        <button className={`appt-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>{t('pg.patient.myAppointments.tabCancelled')}</button>
      </div>

      <div className="appt-filters">
        <input type="date" className="form-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>{noAppointmentsTitle}</h3>
          <p className="text-muted">{noAppointmentsText}</p>
          {activeTab === 'upcoming' && <Button onClick={() => window.location.href = '/patient/book-appointment'}>{t('pg.patient.myAppointments.bookAppointment')}</Button>}
        </div>
      ) : (
        <div className="appt-list">
          {filtered.map((appt) => (
            <div key={appt.id} className="appointment-card" onClick={() => setSelectedAppt(appt)}>
              <div className="appt-card-avatar">{getInitials(appt.doctorName)}</div>
              <div className="appt-card-info">
                <h4>{appt.doctorName}</h4>
                <p className="text-muted">{appt.department}</p>
                <div className="appt-card-meta">
                  <span>📅 {formatDate(appt.date)}</span>
                  <span>⏰ {appt.time}</span>
                  <span className={`status-badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
                </div>
                <p className="text-muted">{appt.reason}</p>
              </div>
              <div className="appt-card-actions">
                {['scheduled', 'confirmed'].includes(appt.status?.toLowerCase()) && (
                  <>
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); cancelAppointment(appt.id); }}>{t('pg.patient.myAppointments.cancel')}</Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openReschedule(appt); }}>{t('pg.patient.myAppointments.reschedule')}</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title={t('pg.patient.myAppointments.appointmentDetails')}>
        {selectedAppt && (
          <div className="appt-detail-modal">
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblDoctor')}</label><span>{selectedAppt.doctorName}</span></div>
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblDepartment')}</label><span>{selectedAppt.department}</span></div>
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblDate')}</label><span>{formatDate(selectedAppt.date)}</span></div>
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblTime')}</label><span>{selectedAppt.time}</span></div>
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblStatus')}</label><span className={`status-badge ${getStatusBadgeClass(selectedAppt.status)}`}>{selectedAppt.status}</span></div>
            <div className="appt-detail-row"><label>{t('pg.patient.myAppointments.lblReason')}</label><span>{selectedAppt.reason}</span></div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        title={t('pg.patient.myAppointments.rescheduleAppointment')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRescheduleAppt(null)}>{t('pg.patient.myAppointments.cancel')}</Button>
            <Button size="sm" onClick={confirmReschedule}>{t('pg.patient.myAppointments.save')}</Button>
          </>
        }
      >
        {rescheduleAppt && (
          <div className="reschedule-form">
            <p className="text-muted">{t('pg.patient.myAppointments.doctor')} {rescheduleAppt.doctorName}</p>
            <div className="form-group">
              <label>{t('pg.patient.myAppointments.lblDate')}</label>
              <input type="date" className="form-input" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t('pg.patient.myAppointments.lblTime')}</label>
              <input type="time" className="form-input" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
