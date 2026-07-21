import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Select } from '../../components/Forms';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import './MedicalHistory.css';

const MedicalHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const patientId = user?.id;
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientAppts, setPatientAppts] = useState([]);
  const [patientConsultations, setPatientConsultations] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        const [timeline, doctors] = await Promise.all([
          clinicalApi.getPatientTimeline(patientId),
          clinicalApi.getDoctors(),
        ]);
        if (cancelled) return;
        const doctorName = (doctorId) => doctors.find((d) => d.id === doctorId)?.name || 'Unknown';
        setPatientAppts((timeline.appointments || []).map((a) => ({ ...a, doctorName: doctorName(a.doctorId) })));
        setPatientConsultations((timeline.consultations || []).map((c) => ({ ...c, doctorName: doctorName(c.doctorId) })));
        setPatientPrescriptions((timeline.prescriptions || []).map((p) => ({ ...p, doctorName: doctorName(p.doctorId) })));
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load medical history'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patientId]);

  const timeline = [
    ...patientAppts.map((a) => ({ ...a, type: 'appointment', date: a.date })),
    ...patientConsultations.map((c) => ({ ...c, type: 'consultation', date: c.date })),
    ...patientPrescriptions.map((p) => ({ ...p, type: 'prescription', date: p.date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = timeline.filter((item) => {
    const matchType = filterType === 'all' || item.type === filterType;
    const d = new Date(item.date);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    if (from && d < from) return false;
    if (to && d > new Date(to.setHours(23, 59, 59))) return false;
    return matchType;
  });

  const completedVisits = patientAppts.filter((a) => a.status?.toLowerCase() === 'completed').length;
  const lastVisit = patientAppts.filter((a) => a.status?.toLowerCase() === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const getTypeLabel = (type) =>
    type === 'appointment'
      ? t('pg.patient.medicalHistory.typeAppointment')
      : type === 'consultation'
        ? t('pg.patient.medicalHistory.typeConsultation')
        : t('pg.patient.medicalHistory.typePrescription');

  if (loading) return <PageLoader />;

  return (
    <div className="page medical-history">
      <div className="page-header">
        <h1>{t('pg.patient.medicalHistory.title')}</h1>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="history-stats">
        <div className="history-stat-card">
          <span className="hsc-value">{completedVisits}</span>
          <span className="hsc-label">{t('pg.patient.medicalHistory.statTotalVisits')}</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{lastVisit ? formatDate(lastVisit.date) : t('pg.patient.medicalHistory.na')}</span>
          <span className="hsc-label">{t('pg.patient.medicalHistory.statLastVisit')}</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{patientConsultations.length}</span>
          <span className="hsc-label">{t('pg.patient.medicalHistory.statConsultations')}</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{patientPrescriptions.length}</span>
          <span className="hsc-label">{t('pg.patient.medicalHistory.statPrescriptions')}</span>
        </div>
      </div>

      <Card>
        <div className="history-filters">
          <Select name="type" value={filterType} onChange={(e) => setFilterType(e.target.value)} options={[
            { value: 'all', label: t('pg.patient.medicalHistory.optAllEvents') },
            { value: 'appointment', label: t('pg.patient.medicalHistory.optAppointments') },
            { value: 'consultation', label: t('pg.patient.medicalHistory.optConsultations') },
            { value: 'prescription', label: t('pg.patient.medicalHistory.optPrescriptions') },
          ]} />
          <input type="date" className="form-input" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))} placeholder={t('pg.patient.medicalHistory.from')} style={{ maxWidth: 180 }} />
          <input type="date" className="form-input" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))} placeholder={t('pg.patient.medicalHistory.to')} style={{ maxWidth: 180 }} />
        </div>
      </Card>

      <div className="timeline">
        {filtered.map((item, idx) => (
          <div key={`${item.type}-${item.id}`} className={`timeline-item timeline-${item.type}`}>
            <div className="timeline-dot">
              {item.type === 'appointment' ? '📅' : item.type === 'consultation' ? '🩺' : '💊'}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-date">{formatDate(item.date)}</span>
                <span className={`timeline-type-badge ${item.type}`}>{getTypeLabel(item.type)}</span>
              </div>
              {item.type === 'appointment' && (
                <div>
                  <p><strong>{item.doctorName}</strong> - {item.department}</p>
                  <p className="text-muted">{item.reason} | <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span></p>
                </div>
              )}
              {item.type === 'consultation' && (
                <div>
                  <p><strong>{item.doctorName}</strong></p>
                  <p className="text-muted">{item.notes}</p>
                </div>
              )}
              {item.type === 'prescription' && (
                <div>
                  <p><strong>{item.doctorName}</strong></p>
                  {item.notes && <p className="text-muted">{item.notes}</p>}
                  <p>{(item.medicines || []).map((m) => m.name).join(', ')}</p>
                </div>
              )}
              <div className="timeline-attachments">
                <Button variant="link" size="sm">{t('pg.patient.medicalHistory.viewDetails')} →</Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>{t('pg.patient.medicalHistory.empty')}</p>}
      </div>
    </div>
  );
};

export default MedicalHistory;
