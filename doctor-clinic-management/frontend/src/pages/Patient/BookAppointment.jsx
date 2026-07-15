import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Textarea } from '../../components/Forms';
import { departments, doctors, currentPatient } from '../../utils/mockData';
import { getInitials, generateAppointmentId } from '../../utils/helpers';
import './BookAppointment.css';

const steps = ['Department', 'Doctor', 'Date & Time', 'Confirm'];

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [apptId, setApptId] = useState('');

  const filteredDoctors = doctors.filter((d) => d.departmentId === selectedDept?.id);

  const handleConfirm = () => {
    const id = generateAppointmentId();
    setApptId(id);
    setSuccess(true);
  };

  const canNext = () => {
    if (step === 1) return !!selectedDept;
    if (step === 2) return !!selectedDoctor;
    if (step === 3) return !!selectedDate && !!selectedTime;
    return true;
  };

  if (success) {
    return (
      <div className="page book-appointment">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>Appointment Booked!</h2>
          <div className="appt-confirm-card">
            <p><strong>Appointment ID:</strong> {apptId}</p>
            <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
            <p><strong>Department:</strong> {selectedDept.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Patient:</strong> {currentPatient.name}</p>
          </div>
          <div className="success-actions">
            <Button onClick={() => navigate('/patient/my-appointments')}>Go to My Appointments</Button>
            <Button variant="outline" onClick={() => navigate('/patient/dashboard')}>Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page book-appointment">
      <div className="page-header">
        <h1>Book Appointment</h1>
      </div>

      <div className="stepper">
        {steps.map((s, i) => (
          <div key={i} className={`step-item ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="step-number">{step > i + 1 ? '✓' : i + 1}</div>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div className="step-content">
            <h2>Select Department</h2>
            <div className="dept-select-grid">
              {departments.map((dept) => (
                <div key={dept.id} className={`dept-select-card ${selectedDept?.id === dept.id ? 'selected' : ''}`} onClick={() => setSelectedDept(dept)} style={{ '--dept-color': dept.color }}>
                  <div className="dept-select-icon" style={{ backgroundColor: `${dept.color}20` }}>{dept.icon}</div>
                  <h4>{dept.name}</h4>
                  <p>{dept.doctorCount} doctors</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Select Doctor</h2>
            {filteredDoctors.length === 0 ? (
              <p className="text-muted">No doctors available in this department.</p>
            ) : (
              <div className="doctor-select-grid">
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} className={`doctor-select-card ${selectedDoctor?.id === doc.id ? 'selected' : ''}`} onClick={() => setSelectedDoctor(doc)}>
                    <div className="ds-avatar">{getInitials(doc.name)}</div>
                    <h4>{doc.name}</h4>
                    <p className="ds-spec">{doc.specialization}</p>
                    <p className="ds-exp">{doc.experience} yrs | ★ {doc.rating}</p>
                    <p className="ds-fee">₹{doc.fee}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>Select Date & Time</h2>
            <div className="datetime-section">
              <div className="date-picker">
                <label className="form-label">Select Date</label>
                <input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="time-slots">
                <label className="form-label">Available Time Slots</label>
                <div className="time-grid">
                  {timeSlots.map((t) => {
                    const isAvailable = !['09:30 AM', '12:00 PM', '03:30 PM'].includes(t);
                    return (
                      <div
                        key={t}
                        className={`time-slot ${!isAvailable ? 'unavailable' : ''} ${selectedTime === t ? 'selected' : ''}`}
                        onClick={() => isAvailable && setSelectedTime(t)}
                      >
                        {t}
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
            <h2>Confirm Appointment</h2>
            <div className="confirm-summary">
              <div className="confirm-row"><label>Department</label><span>{selectedDept?.name}</span></div>
              <div className="confirm-row"><label>Doctor</label><span>{selectedDoctor?.name} ({selectedDoctor?.specialization})</span></div>
              <div className="confirm-row"><label>Date</label><span>{selectedDate}</span></div>
              <div className="confirm-row"><label>Time</label><span>{selectedTime}</span></div>
              <div className="confirm-row"><label>Patient</label><span>{currentPatient.name} ({currentPatient.id})</span></div>
            </div>
            <Textarea label="Reason for Visit" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms or reason for visit" rows={3} />
          </div>
        )}

        <div className="step-actions">
          {step > 1 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>← Back</Button>}
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>Next →</Button>
          ) : (
            <Button onClick={handleConfirm}>Confirm Appointment</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookAppointment;
