import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { medicalStores } from '../../utils/mockData';
import { generatePrescriptionId, calculateAge } from '../../utils/helpers';
import './Prescription.css';

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const consultData = location.state || {};

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-0', frequency: 'Once daily', duration: 7, durationType: 'days', quantity: 7, instructions: '' },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [success, setSuccess] = useState(false);
  const [prxId, setPrxId] = useState('');

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-0', frequency: 'Once daily', duration: 7, durationType: 'days', quantity: 7, instructions: '' }]);
  };

  const removeMedicine = (idx) => {
    if (medicines.length > 1) setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const updateMedicine = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = generatePrescriptionId();
    setPrxId(id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="page prescription-page">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>Prescription Created Successfully!</h2>
          <p className="patient-id-display">Prescription ID: <strong>{prxId}</strong></p>
          <div className="success-actions">
            <Button onClick={() => window.print()}>🖨️ Print Prescription</Button>
            <Button variant="outline" onClick={() => setSuccess(false)}>View Prescription</Button>
            <Button variant="secondary" onClick={() => navigate('/doctor/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const { patient } = consultData;

  const medicineSuggestions = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Amlodipine 5mg', 'Metformin 500mg', 'Atorvastatin 10mg', 'Omeprazole 20mg', 'Cetirizine 10mg', 'Thyroxine 50mcg', 'Sumatriptan 50mg', 'Escitalopram 10mg', 'Cefixime 200mg', 'Azithromycin 500mg', 'Propranolol 40mg', 'Diclofenac Gel'];

  return (
    <div className="page prescription-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Create Prescription</h1>
      </div>

      {patient && (
        <Card>
          <div className="prx-patient-header">
            <div><label>Patient</label><span>{patient.name}</span></div>
            <div><label>Age/Gender</label><span>{calculateAge(patient.dob)} yrs / {patient.gender}</span></div>
            <div><label>Patient ID</label><span>{patient.id}</span></div>
          </div>
        </Card>
      )}

      {consultData.diagnosis && (
        <Card title="Diagnosis">
          <p>{consultData.diagnosis}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Medicines" actions={<Button type="button" variant="outline" size="sm" icon="➕" onClick={addMedicine}>Add Medicine</Button>}>
          {medicines.map((med, idx) => (
            <div key={idx} className="medicine-row">
              <div className="medicine-field">
                <Input label="Medicine Name" name={`med-name-${idx}`} value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} placeholder="Type medicine name..." list={`med-suggestions-${idx}`} />
                <datalist id={`med-suggestions-${idx}`}>
                  {medicineSuggestions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <Select label="Dosage" name={`med-dosage-${idx}`} value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} options={[
                { value: '1-0-0', label: '1-0-0' }, { value: '0-0-1', label: '0-0-1' }, { value: '1-0-1', label: '1-0-1' }, { value: '0-1-0', label: '0-1-0' }, { value: '1-1-1', label: '1-1-1' }, { value: '0-0-0-1', label: '0-0-0-1' }, { value: '1-0-0-0', label: '1-0-0-0' }, { value: 'As needed', label: 'As needed' },
              ]} />
              <Select label="Frequency" name={`med-freq-${idx}`} value={med.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} options={[
                { value: 'Once daily', label: 'Once daily' }, { value: 'Twice daily', label: 'Twice daily' }, { value: 'Three times daily', label: 'Three times daily' }, { value: 'Four times daily', label: 'Four times daily' }, { value: 'Once daily at night', label: 'Once daily at night' }, { value: 'On empty stomach', label: 'On empty stomach' }, { value: 'After meals', label: 'After meals' }, { value: 'As needed', label: 'As needed' },
              ]} />
              <div className="medicine-duration">
                <Input label="Duration" name={`med-dur-${idx}`} type="number" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', Number(e.target.value))} min="1" />
                <Select name={`med-dur-type-${idx}`} value={med.durationType} onChange={(e) => updateMedicine(idx, 'durationType', e.target.value)} options={[{ value: 'days', label: 'Days' }, { value: 'weeks', label: 'Weeks' }, { value: 'months', label: 'Months' }]} />
              </div>
              <Input label="Qty" name={`med-qty-${idx}`} type="number" value={med.quantity} onChange={(e) => updateMedicine(idx, 'quantity', Number(e.target.value))} min="1" />
              <Input label="Instructions" name={`med-inst-${idx}`} value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} placeholder="e.g. After food" />
              {medicines.length > 1 && <button type="button" className="remove-medicine" onClick={() => removeMedicine(idx)}>✕</button>}
            </div>
          ))}
        </Card>

        <Card>
          <Textarea label="Additional Notes" name="notes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Any additional instructions or notes..." rows={3} />
          <Select label="Select Medical Store" name="store" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} placeholder="Choose a pharmacy" options={medicalStores.map((s) => ({ value: s.name, label: `${s.name} - ${s.location}` }))} />
        </Card>

        <div className="form-actions">
          <Button type="submit" size="lg">Create Prescription</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default Prescription;
