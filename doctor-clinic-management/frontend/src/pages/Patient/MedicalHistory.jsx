import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Select } from '../../components/Forms';
import { appointments, prescriptions, consultations, currentPatient } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './MedicalHistory.css';

const MedicalHistory = () => {
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const patientAppts = appointments.filter((a) => a.patientId === currentPatient.id);
  const patientConsultations = consultations.filter((c) => c.patientId === currentPatient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === currentPatient.id);

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

  const completedVisits = patientAppts.filter((a) => a.status === 'Completed').length;
  const lastVisit = patientAppts.filter((a) => a.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="page medical-history">
      <div className="page-header">
        <h1>Medical History</h1>
      </div>

      <div className="history-stats">
        <div className="history-stat-card">
          <span className="hsc-value">{completedVisits}</span>
          <span className="hsc-label">Total Visits</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{lastVisit ? formatDate(lastVisit.date) : 'N/A'}</span>
          <span className="hsc-label">Last Visit</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{patientConsultations.length}</span>
          <span className="hsc-label">Consultations</span>
        </div>
        <div className="history-stat-card">
          <span className="hsc-value">{patientPrescriptions.length}</span>
          <span className="hsc-label">Prescriptions</span>
        </div>
      </div>

      <Card>
        <div className="history-filters">
          <Select name="type" value={filterType} onChange={(e) => setFilterType(e.target.value)} options={[
            { value: 'all', label: 'All Events' },
            { value: 'appointment', label: 'Appointments' },
            { value: 'consultation', label: 'Consultations' },
            { value: 'prescription', label: 'Prescriptions' },
          ]} />
          <input type="date" className="form-input" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))} placeholder="From" style={{ maxWidth: 180 }} />
          <input type="date" className="form-input" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))} placeholder="To" style={{ maxWidth: 180 }} />
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
                <span className={`timeline-type-badge ${item.type}`}>{item.type}</span>
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
                  <p className="text-muted">Symptoms: {item.symptoms}</p>
                  <p><strong>Diagnosis:</strong> {item.diagnosis}</p>
                  {item.testsRecommended?.length > 0 && <p className="text-muted">Tests: {item.testsRecommended.join(', ')}</p>}
                </div>
              )}
              {item.type === 'prescription' && (
                <div>
                  <p><strong>{item.doctorName}</strong></p>
                  <p className="text-muted">{item.diagnosis}</p>
                  <p>{item.medicines.map((m) => m.name).join(', ')}</p>
                </div>
              )}
              <div className="timeline-attachments">
                <Button variant="link" size="sm">View Details →</Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No medical history found for the selected filters.</p>}
      </div>
    </div>
  );
};

export default MedicalHistory;
