import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, calculateAge, getInitials, getStatusBadgeClass } from '../../utils/helpers';
import './PatientDetails.css';
import { useTranslation } from '../../i18n/LanguageContext';

const PatientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');

  const [patient, setPatient] = useState(null);
  const [patientAppts, setPatientAppts] = useState([]);
  const [patientPrx, setPatientPrx] = useState([]);
  const [patientConsults, setPatientConsults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [timeline, doctors] = await Promise.all([
          clinicalApi.getPatientTimeline(id),
          clinicalApi.getDoctors(),
        ]);
        if (cancelled) return;
        const doctorNameById = new Map(doctors.map((d) => [d.id, d.name]));

        setPatient(timeline.patient);
        setPatientAppts((timeline.appointments || []).map((a) => ({ ...a, doctorName: doctorNameById.get(a.doctorId) || '' })));
        setPatientPrx((timeline.prescriptions || []).map((p) => ({ ...p, doctorName: doctorNameById.get(p.doctorId) || '' })));
        setPatientConsults(timeline.consultations || []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load patient details'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const tabs = [
    { key: 'history', label: t('sidebar.medicalHistory') },
    { key: 'prescriptions', label: t('sidebar.prescriptions') },
    { key: 'vitals', label: t('pg.doctor.patientDetails.currentVitals') },
  ];

  if (loading) {
    return (
      <div className="page patient-details-page">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="page patient-details-page">
        <p className="text-error">{error || 'Patient not found'}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>{t('common.back')}</Button>
      </div>
    );
  }

  const latestConsult = [...patientConsults].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const vitals = latestConsult?.vitals || {};

  return (
    <div className="page patient-details-page">
      <div className="pd-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← {t('common.back')}</button>
        <div className="pd-avatar">{getInitials(patient.name)}</div>
        <div className="pd-info">
          <h1>{patient.name}</h1>
          <p className="text-muted">{patient.patientId || patient.id} | {patient.gender} | {calculateAge(patient.dob)} yrs | {patient.bloodGroup}</p>
        </div>
        <div className="pd-actions">
          <Button onClick={() => navigate(`/doctor/consultation/${patientAppts[0]?.id || 'new'}`)}>{t('pg.doctor.patientDetails.startConsultation')}</Button>
          <Button variant="outline" onClick={() => navigate('/doctor/prescription')}>{t('pg.doctor.patientDetails.writePrescription')}</Button>
        </div>
      </div>

      <div className="pd-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`pd-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'history' && (
        <div className="pd-timeline">
          {[...patientConsults.map((c) => ({ ...c, type: 'consultation' })), ...patientAppts.map((a) => ({ ...a, type: 'appointment' }))]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((item, idx) => (
              <div key={idx} className={`pd-timeline-item pd-tl-${item.type}`}>
                <div className="pd-tl-dot">{item.type === 'consultation' ? '🩺' : '📅'}</div>
                <div className="pd-tl-content">
                  <span className="pd-tl-date">{formatDate(item.date)}</span>
                  {item.type === 'consultation' && (
                    <><p><strong>{t('pg.doctor.patientDetails.diagnosis')}:</strong> {item.diagnosis}</p><p className="text-muted">{item.symptoms}</p></>
                  )}
                  {item.type === 'appointment' && (
                    <><p><strong>{item.doctorName}</strong> - {item.department}</p><p className="text-muted">{item.reason} | <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span></p></>
                  )}
                </div>
              </div>
            ))}
          {patientConsults.length === 0 && patientAppts.length === 0 && <p className="text-muted">{t('pg.doctor.patientDetails.noHistory')}</p>}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="pd-prescriptions">
          {patientPrx.map((prx) => (
            <Card key={prx.id}>
              <div className="pd-prx-header">
                <span>{prx.doctorName}</span>
                <span className="text-muted">{formatDate(prx.date)}</span>
                <span className={`status-badge ${getStatusBadgeClass(prx.status)}`}>{prx.status}</span>
              </div>
              {prx.notes && <p className="text-muted">{prx.notes}</p>}
              <ul className="pd-prx-meds">
                {prx.medicines.map((m, i) => <li key={i}>{m.name} - {m.dosage}, {m.duration} {m.durationType}</li>)}
              </ul>
              <Button variant="link" size="sm">{t('pg.doctor.patientDetails.viewDetails')} →</Button>
            </Card>
          ))}
          {patientPrx.length === 0 && <p className="text-muted">{t('pg.doctor.patientDetails.noPrescriptions')}</p>}
        </div>
      )}

      {activeTab === 'vitals' && (
        <Card title={t('pg.doctor.patientDetails.currentVitals')}>
          <div className="pd-vitals">
            {[
              { label: t('pg.doctor.patientDetails.bloodPressure'), value: (vitals.bpSystolic && vitals.bpDiastolic) ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : '--/--', unit: 'mmHg', icon: '❤️' },
              { label: t('pg.doctor.patientDetails.heartRate'), value: vitals.heartRate ?? '--', unit: 'bpm', icon: '💓' },
              { label: t('pg.doctor.patientDetails.temperature'), value: vitals.temperature ?? '--', unit: '°F', icon: '🌡️' },
              { label: t('pg.doctor.patientDetails.weight'), value: vitals.weight ?? '--', unit: 'kg', icon: '⚖️' },
            ].map((v, i) => (
              <div key={i} className="vital-item">
                <span className="vital-icon">{v.icon}</span>
                <div>
                  <p className="vital-value">{v.value} <small>{v.unit}</small></p>
                  <p className="vital-label">{v.label}</p>
                </div>
                <button className="vital-edit">✏️</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientDetails;
