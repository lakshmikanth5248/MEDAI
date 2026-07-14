import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Textarea } from '../../components/Forms';
import { appointments, patients } from '../../utils/mockData';
import { calculateAge } from '../../utils/helpers';
import './Consultation.css';

const Consultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment = appointments.find((a) => a.id === id) || appointments[0];
  const patient = patients.find((p) => p.id === appointment?.patientId) || patients[0];

  const [vitals, setVitals] = useState({ bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', weight: '', height: '', spo2: '' });
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [tests, setTests] = useState(['']);
  const [notes, setNotes] = useState('');

  const handleVitalChange = (field) => (e) => setVitals((prev) => ({ ...prev, [field]: e.target.value }));

  const addTest = () => setTests([...tests, '']);
  const removeTest = (idx) => setTests(tests.filter((_, i) => i !== idx));
  const handleTestChange = (idx, value) => {
    const updated = [...tests];
    updated[idx] = value;
    setTests(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/doctor/prescription', { state: { patient, vitals, symptoms, diagnosis, tests, notes } });
  };

  return (
    <div className="page consultation-page">
      <div className="consult-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="consult-patient-info">
          <h1>Consultation</h1>
          <p className="text-muted">{patient.name} | {calculateAge(patient.dob)} yrs | {patient.gender} | {patient.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Vitals">
          <div className="vitals-grid">
            <div className="vital-group">
              <Input label="BP Systolic" name="bpSystolic" value={vitals.bpSystolic} onChange={handleVitalChange('bpSystolic')} placeholder="120" type="number" />
              <Input label="BP Diastolic" name="bpDiastolic" value={vitals.bpDiastolic} onChange={handleVitalChange('bpDiastolic')} placeholder="80" type="number" />
            </div>
            <Input label="Heart Rate" name="heartRate" value={vitals.heartRate} onChange={handleVitalChange('heartRate')} placeholder="bpm" type="number" />
            <Input label="Temperature" name="temperature" value={vitals.temperature} onChange={handleVitalChange('temperature')} placeholder="°F" type="number" step="0.1" />
            <Input label="Weight" name="weight" value={vitals.weight} onChange={handleVitalChange('weight')} placeholder="kg" type="number" step="0.1" />
            <Input label="Height" name="height" value={vitals.height} onChange={handleVitalChange('height')} placeholder="cm" type="number" />
            <Input label="SpO2" name="spo2" value={vitals.spo2} onChange={handleVitalChange('spo2')} placeholder="%" type="number" />
          </div>
        </Card>

        <Card title="Symptoms / Chief Complaint">
          <Textarea name="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe the patient's symptoms and chief complaint..." rows={4} />
        </Card>

        <Card title="Diagnosis">
          <Textarea name="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Enter diagnosis (e.g. I10 - Essential Hypertension)" rows={3} />
          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Tip: Use ICD-10 codes for standardized diagnosis entries</p>
        </Card>

        <Card title="Tests Recommended" actions={<Button type="button" variant="outline" size="sm" onClick={addTest}>+ Add Test</Button>}>
          {tests.map((test, idx) => (
            <div key={idx} className="test-row">
              <Input name={`test-${idx}`} value={test} onChange={(e) => handleTestChange(idx, e.target.value)} placeholder="Enter test name" />
              {tests.length > 1 && <button type="button" className="remove-test" onClick={() => removeTest(idx)}>✕</button>}
            </div>
          ))}
        </Card>

        <Card title="Notes">
          <Textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} />
        </Card>

        <div className="form-actions">
          <Button type="submit" size="lg">Save & Continue to Prescription</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default Consultation;
