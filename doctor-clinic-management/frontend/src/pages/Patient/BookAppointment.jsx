import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Textarea } from '../../components/Forms';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getInitials } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile, getRoleId } from '../../utils/profile';
import { useTranslation } from '../../i18n/LanguageContext';
import { recommendDoctor } from '../../components/ChatBot/knowledge';
import './BookAppointment.css';

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

// Slots above are collected/displayed in 12-hour format for the UI, but the
// backend expects 24-hour "HH:MM" - convert at the API-call boundary.
function to24Hour(slot) {
  const [time, period] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const BookAppointment = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const patient = resolveProfile(user) || {};
  const patientId = getRoleId(patient);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [takenTimes, setTakenTimes] = useState([]);
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [apptId, setApptId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [depts, docs] = await Promise.all([
          clinicalApi.getDepartments(),
          clinicalApi.getDoctors(),
        ]);
        if (cancelled) return;
        setDepartments(depts);
        setDoctors(docs);

        // When arriving from the chatbot ("Consult a doctor"), preselect the
        // most suitable department + doctor for the reported symptom and jump to step 2.
        const state = location.state;
        if (state && state.ailmentKey) {
          const rec = recommendDoctor(state.ailmentKey, state.ageGroup, docs, depts);
          if (rec && rec.departmentId) {
            const dept = depts.find((d) => d.id === rec.departmentId) || null;
            setSelectedDept(dept);
            setSelectedDoctor(rec.doctor || null);
            if (rec.doctor) setStep(2);
          }
        } else if (state && state.doctor) {
          const doc = state.doctor;
          setSelectedDoctor(doc);
          const dept = depts.find((d) => d.id === doc.departmentId) || null;
          setSelectedDept(dept);
          setStep(3);
        }
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Failed to load booking data'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort UX hint: fetch this doctor's existing appointments for the
  // selected date so we can visually grey out taken slots before submit.
  // The backend still enforces the real conflict check at booking time.
  useEffect(() => {
    let cancelled = false;
    if (!selectedDoctor || !selectedDate) {
      setTakenTimes([]);
      return;
    }
    (async () => {
      try {
        const appts = await clinicalApi.getAppointments({ doctorId: selectedDoctor.id, date: selectedDate });
        if (cancelled) return;
        setTakenTimes(
          appts.filter((a) => a.status !== 'cancelled').map((a) => a.time)
        );
      } catch {
        if (!cancelled) setTakenTimes([]);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDoctor, selectedDate]);

  const stepLabels = [
    t('pg.patient.bookAppointment.stepDepartment'),
    t('pg.patient.bookAppointment.stepDoctor'),
    t('pg.patient.bookAppointment.stepDateTime'),
    t('pg.patient.bookAppointment.stepConfirm'),
  ];

  const filteredDoctors = doctors.filter((d) => d.departmentId === selectedDept?.id);

  const handleConfirm = async () => {
    if (!user?.id || !selectedDoctor || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await clinicalApi.createAppointment({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: to24Hour(selectedTime),
        type: 'General Consultation',
        reason,
      });
      setApptId(created.appointmentId || created.id);
      setSuccess(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to book appointment. Please choose a different slot.'));
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!selectedDept;
    if (step === 2) return !!selectedDoctor;
    if (step === 3) return !!selectedDate && !!selectedTime;
    return true;
  };

  if (loading) return <PageLoader />;

  if (success) {
    return (
      <div className="page book-appointment">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>{t('pg.patient.bookAppointment.appointmentBooked')}</h2>
          <div className="appt-confirm-card">
            <p><strong>{t('pg.patient.bookAppointment.lblAppointmentId')}</strong> {apptId}</p>
            <p><strong>{t('pg.patient.bookAppointment.lblDoctor')}</strong> {selectedDoctor.name}</p>
            <p><strong>{t('pg.patient.bookAppointment.lblDepartment')}</strong> {selectedDept.name}</p>
            <p><strong>{t('pg.patient.bookAppointment.lblDate')}</strong> {selectedDate}</p>
            <p><strong>{t('pg.patient.bookAppointment.lblTime')}</strong> {selectedTime}</p>
            <p><strong>{t('pg.patient.bookAppointment.lblPatient')}</strong> {patient.name}</p>
          </div>
          <div className="success-actions">
            <Button onClick={() => navigate('/patient/my-appointments')}>{t('pg.patient.bookAppointment.goToMyAppointments')}</Button>
            <Button variant="outline" onClick={() => navigate('/patient/dashboard')}>{t('pg.patient.bookAppointment.dashboard')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page book-appointment">
      <div className="page-header">
        <h1>{t('pg.patient.bookAppointment.title')}</h1>
      </div>

      {loadError && <p className="text-danger">{loadError}</p>}

      <div className="stepper">
        {stepLabels.map((s, i) => (
          <div key={i} className={`step-item ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="step-number">{step > i + 1 ? '✓' : i + 1}</div>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div className="step-content">
            <h2>{t('pg.patient.bookAppointment.selectDepartment')}</h2>
            <div className="dept-select-grid">
              {departments.map((dept) => (
                <div key={dept.id} className={`dept-select-card ${selectedDept?.id === dept.id ? 'selected' : ''}`} onClick={() => setSelectedDept(dept)} style={{ '--dept-color': dept.color }}>
                  <div className="dept-select-icon" style={{ backgroundColor: `${dept.color}20` }}>{dept.icon}</div>
                  <h4>{dept.name}</h4>
                  <p>{doctors.filter((d) => d.departmentId === dept.id).length} {t('pg.patient.bookAppointment.doctors')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>{t('pg.patient.bookAppointment.selectDoctor')}</h2>
            {filteredDoctors.length === 0 ? (
              <p className="text-muted">{t('pg.patient.bookAppointment.noDoctors')}</p>
            ) : (
              <div className="doctor-select-grid">
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} className={`doctor-select-card ${selectedDoctor?.id === doc.id ? 'selected' : ''}`} onClick={() => setSelectedDoctor(doc)}>
                    <div className="ds-avatar">{getInitials(doc.name)}</div>
                    <h4>{doc.name}</h4>
                    <p className="ds-spec">{doc.specialization}</p>
                    <p className="ds-exp">{doc.experience} {t('pg.patient.bookAppointment.yrs')} | ★ {doc.rating}</p>
                    <p className="ds-fee">₹{doc.fee}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>{t('pg.patient.bookAppointment.selectDateTime')}</h2>
            <div className="datetime-section">
              <div className="date-picker">
                <label className="form-label">{t('pg.patient.bookAppointment.selectDateLabel')}</label>
                <input type="date" className="form-input" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="time-slots">
                <label className="form-label">{t('pg.patient.bookAppointment.availableTimeSlots')}</label>
                <div className="time-grid">
                  {timeSlots.map((slot) => {
                    const isAvailable = !takenTimes.includes(to24Hour(slot));
                    return (
                      <div
                        key={slot}
                        className={`time-slot ${!isAvailable ? 'unavailable' : ''} ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => isAvailable && setSelectedTime(slot)}
                      >
                        {slot}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>{t('pg.patient.bookAppointment.confirmAppointment')}</h2>
            {submitError && <p className="text-danger">{submitError}</p>}
            <div className="confirm-summary">
              <div className="confirm-row"><label>{t('pg.patient.bookAppointment.lblDepartment')}</label><span>{selectedDept?.name}</span></div>
              <div className="confirm-row"><label>{t('pg.patient.bookAppointment.lblDoctor')}</label><span>{selectedDoctor?.name} ({selectedDoctor?.specialization})</span></div>
              <div className="confirm-row"><label>{t('pg.patient.bookAppointment.lblDate')}</label><span>{selectedDate}</span></div>
              <div className="confirm-row"><label>{t('pg.patient.bookAppointment.lblTime')}</label><span>{selectedTime}</span></div>
              <div className="confirm-row"><label>{t('pg.patient.bookAppointment.lblPatient')}</label><span>{patient.name} ({patientId})</span></div>
            </div>
            <Textarea label={t('pg.patient.bookAppointment.reasonForVisit')} name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('pg.patient.bookAppointment.reasonPlaceholder')} rows={3} />
          </div>
        )}

        <div className="step-actions">
          {step > 1 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={submitting}>← {t('pg.patient.bookAppointment.back')}</Button>}
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>{t('pg.patient.bookAppointment.next')} →</Button>
          ) : (
            <Button onClick={handleConfirm} disabled={submitting}>{submitting ? '...' : t('pg.patient.bookAppointment.confirmAppointment')}</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookAppointment;
