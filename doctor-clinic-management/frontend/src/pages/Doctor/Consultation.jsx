import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Textarea } from '../../components/Forms';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { calculateAge } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import './Consultation.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Consultation = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [vitals, setVitals] = useState({ bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', weight: '', height: '', spo2: '' });
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [tests, setTests] = useState(['']);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const appt = await clinicalApi.getAppointment(id);
        if (cancelled) return;
        setAppointment(appt);
        const pat = await clinicalApi.getPatient(appt.patientId);
        if (cancelled) return;
        setPatient(pat);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Failed to load appointment'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleVitalChange = (field) => (e) => setVitals((prev) => ({ ...prev, [field]: e.target.value }));

  const addTest = () => setTests([...tests, '']);
  const removeTest = (idx) => setTests(tests.filter((_, i) => i !== idx));
  const handleTestChange = (idx, value) => {
    const updated = [...tests];
    updated[idx] = value;
    setTests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointment || !patient || !user?.id) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const numericVitals = Object.entries(vitals).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          const num = Number(value);
          acc[key] = Number.isNaN(num) ? value : num;
        }
        return acc;
      }, {});
      const cleanTests = tests.map((tst) => tst.trim()).filter(Boolean);

      const consultation = await clinicalApi.createConsultation({
        appointmentId: appointment.id,
        doctorId: user.id,
        patientId: patient.id,
        vitals: numericVitals,
        symptoms,
        diagnosis,
        tests: cleanTests,
        notes,
      });

      navigate('/doctor/prescription', {
        state: {
          consultationId: consultation.id,
          appointmentId: appointment.id,
          patientId: patient.id,
          doctorId: user.id,
          patient,
          vitals: numericVitals,
          symptoms,
          diagnosis,
          tests: cleanTests,
          notes,
        },
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save consultation'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page consultation-page">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (loadError || !appointment || !patient) {
    return (
      <div className="page consultation-page">
        <p className="text-error">{loadError || 'Appointment not found'}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>{t('common.back')}</Button>
      </div>
    );
  }

  return (
    <div className="page consultation-page">
      <div className="consult-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← {t('common.back')}</button>
        <div className="consult-patient-info">
          <h1>{t('pg.doctor.consultation.title')}</h1>
          <p className="text-muted">{patient.name} | {calculateAge(patient.dob)} yrs | {patient.gender} | {patient.patientId || patient.id}</p>
        </div>
      </div>

      {submitError && <p className="text-error">{submitError}</p>}

      <form onSubmit={handleSubmit}>
        <Card title={t('pg.doctor.consultation.vitals')}>
          <div className="vitals-grid">
            <div className="vital-group">
              <Input label={t('pg.doctor.consultation.bpSystolic')} name="bpSystolic" value={vitals.bpSystolic} onChange={handleVitalChange('bpSystolic')} placeholder="120" type="number" />
              <Input label={t('pg.doctor.consultation.bpDiastolic')} name="bpDiastolic" value={vitals.bpDiastolic} onChange={handleVitalChange('bpDiastolic')} placeholder="80" type="number" />
            </div>
            <Input label={t('pg.doctor.consultation.heartRate')} name="heartRate" value={vitals.heartRate} onChange={handleVitalChange('heartRate')} placeholder="bpm" type="number" />
            <Input label={t('pg.doctor.consultation.temperature')} name="temperature" value={vitals.temperature} onChange={handleVitalChange('temperature')} placeholder="°F" type="number" step="0.1" />
            <Input label={t('pg.doctor.consultation.weight')} name="weight" value={vitals.weight} onChange={handleVitalChange('weight')} placeholder="kg" type="number" step="0.1" />
            <Input label={t('pg.doctor.consultation.height')} name="height" value={vitals.height} onChange={handleVitalChange('height')} placeholder="cm" type="number" />
            <Input label={t('pg.doctor.consultation.spo2')} name="spo2" value={vitals.spo2} onChange={handleVitalChange('spo2')} placeholder="%" type="number" />
          </div>
        </Card>

        <Card title={t('pg.doctor.consultation.symptoms')}>
          <Textarea name="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t('pg.doctor.consultation.symptomsPlaceholder')} rows={4} />
        </Card>

        <Card title={t('pg.doctor.consultation.diagnosis')}>
          <Textarea name="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder={t('pg.doctor.consultation.diagnosisPlaceholder')} rows={3} />
          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{t('pg.doctor.consultation.icdTip')}</p>
        </Card>

        <Card title={t('pg.doctor.consultation.testsRecommended')} actions={<Button type="button" variant="outline" size="sm" onClick={addTest}>+ {t('pg.doctor.consultation.addTest')}</Button>}>
          {tests.map((test, idx) => (
            <div key={idx} className="test-row">
              <Input name={`test-${idx}`} value={test} onChange={(e) => handleTestChange(idx, e.target.value)} placeholder={t('pg.doctor.consultation.testNamePlaceholder')} />
              {tests.length > 1 && <button type="button" className="remove-test" onClick={() => removeTest(idx)}>✕</button>}
            </div>
          ))}
        </Card>

        <Card title={t('pg.doctor.consultation.notes')}>
          <Textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('pg.doctor.consultation.notesPlaceholder')} rows={3} />
        </Card>

        <div className="form-actions">
          <Button type="submit" size="lg" disabled={submitting}>{submitting ? t('common.loading') : t('pg.doctor.consultation.saveContinue')}</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={submitting}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
};

export default Consultation;
