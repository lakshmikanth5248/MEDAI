import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { medicalStores, currentDoctor } from '../../utils/mockData';
import { generatePrescriptionId, calculateAge, getCurrentDate } from '../../utils/helpers';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import './Prescription.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Prescription = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const consultData = location.state || {};
  const patient = consultData.patient;

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-0', frequency: 'Once daily', duration: 7, durationType: 'days', quantity: 7, instructions: '' },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [success, setSuccess] = useState(false);
  const [prxId, setPrxId] = useState('');

  const buildPrescriptionHtml = () => {
    const rows = medicines
      .map(
        (m, i) =>
          `<tr><td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.dosage)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)} ${esc(m.durationType)}</td><td>${esc(m.instructions || '—')}</td></tr>`
      )
      .join('');
    return `
      <div class="doc-header">
        <h2>ClinicManager</h2>
        <p>123 Healthcare Avenue, Medical District, Mumbai</p>
        <p>Phone: +91-22-12345678 | Email: info@clinicmanager.com</p>
      </div>
      <div class="divider"></div>
      <div class="title">${t('pg.doctor.prescription.printTitle')}</div>
      <div class="meta">
        <div><strong>${t('pg.doctor.prescription.printPrescriptionId')}:</strong> ${esc(prxId)}</div>
        <div><strong>${t('pg.doctor.prescription.printDate')}:</strong> ${esc(getCurrentDate())}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <h4>${t('pg.doctor.prescription.patientInfo')}</h4>
        <div class="row"><span class="k">${t('pg.doctor.prescription.name')}:</span><span>${esc(patient?.name || t('pg.doctor.prescription.notAvailable'))}</span></div>
        <div class="row"><span class="k">${t('pg.doctor.prescription.ageGender')}:</span><span>${esc(patient ? `${calculateAge(patient.dob)} yrs / ${patient.gender}` : t('pg.doctor.prescription.notAvailable'))}</span></div>
        <div class="row"><span class="k">${t('pg.doctor.prescription.patientId')}:</span><span>${esc(patient?.id || t('pg.doctor.prescription.notAvailable'))}</span></div>
      </div>
      <div class="section">
        <h4>${t('pg.doctor.prescription.doctor')}</h4>
        <div class="row"><span class="k">${t('pg.doctor.prescription.name')}:</span><span>${esc(currentDoctor.name)}</span></div>
        <div class="row"><span class="k">${t('pg.doctor.prescription.specialization')}:</span><span>${esc(currentDoctor.specialization)}</span></div>
      </div>
      ${consultData.diagnosis ? `<div class="section"><h4>${t('pg.doctor.prescription.diagnosis')}</h4><p>${esc(consultData.diagnosis)}</p></div>` : ''}
      <div class="section">
        <h4>${t('pg.doctor.prescription.prescribedMedicines')}</h4>
        <table>
          <thead><tr><th>#</th><th>${t('pg.doctor.prescription.colMedicine')}</th><th>${t('pg.doctor.prescription.colDosage')}</th><th>${t('pg.doctor.prescription.colFrequency')}</th><th>${t('pg.doctor.prescription.colDuration')}</th><th>${t('pg.doctor.prescription.colInstructions')}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${additionalNotes ? `<div class="section"><h4>${t('pg.doctor.prescription.additionalNotes')}</h4><p>${esc(additionalNotes)}</p></div>` : ''}
      ${selectedStore ? `<div class="section"><h4>${t('pg.doctor.prescription.medicalStore')}</h4><p>${esc(selectedStore)}</p></div>` : ''}
      <div class="footer">
        <p class="note">${t('pg.doctor.prescription.computerGenerated')}</p>
        <div class="sig"><div class="sig-line"></div><p>${t('pg.doctor.prescription.doctorSignature')}</p></div>
      </div>`;
  };

  const handlePrint = () => printDocument(t('pg.doctor.prescription.printTitle'), buildPrescriptionHtml());

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
          <h2>{t('pg.doctor.prescription.createdSuccess')}</h2>
          <p className="patient-id-display">{t('pg.doctor.prescription.printPrescriptionId')}: <strong>{prxId}</strong></p>
          <div className="success-actions">
            <Button onClick={handlePrint}>🖨️ {t('pg.doctor.prescription.printPrescription')}</Button>
            <Button variant="outline" onClick={() => setSuccess(false)}>{t('pg.doctor.prescription.createAnother')}</Button>
            <Button variant="secondary" onClick={() => navigate('/doctor/dashboard')}>{t('pg.doctor.prescription.goToDashboard')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const medicineSuggestions = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Amlodipine 5mg', 'Metformin 500mg', 'Atorvastatin 10mg', 'Omeprazole 20mg', 'Cetirizine 10mg', 'Thyroxine 50mcg', 'Sumatriptan 50mg', 'Escitalopram 10mg', 'Cefixime 200mg', 'Azithromycin 500mg', 'Propranolol 40mg', 'Diclofenac Gel'];

  return (
    <div className="page prescription-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← {t('common.back')}</button>
        <h1>{t('pg.doctor.prescription.createPrescription')}</h1>
      </div>

      {patient && (
        <Card>
          <div className="prx-patient-header">
            <div><label>{t('pg.doctor.prescription.patient')}</label><span>{patient.name}</span></div>
            <div><label>{t('pg.doctor.prescription.ageGender')}</label><span>{calculateAge(patient.dob)} yrs / {patient.gender}</span></div>
            <div><label>{t('pg.doctor.prescription.patientId')}</label><span>{patient.id}</span></div>
          </div>
        </Card>
      )}

      {consultData.diagnosis && (
        <Card title={t('pg.doctor.prescription.diagnosis')}>
          <p>{consultData.diagnosis}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card title={t('pg.doctor.prescription.medicines')} actions={<Button type="button" variant="outline" size="sm" icon="➕" onClick={addMedicine}>{t('pg.doctor.prescription.addMedicine')}</Button>}>
          {medicines.map((med, idx) => (
            <div key={idx} className="medicine-row">
              <div className="medicine-field">
                <Input label={t('pg.doctor.prescription.medicineName')} name={`med-name-${idx}`} value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} placeholder={t('pg.doctor.prescription.medicineNamePlaceholder')} list={`med-suggestions-${idx}`} />
                <datalist id={`med-suggestions-${idx}`}>
                  {medicineSuggestions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <Select label={t('pg.doctor.prescription.dosage')} name={`med-dosage-${idx}`} value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} options={[
                { value: '1-0-0', label: '1-0-0' }, { value: '0-0-1', label: '0-0-1' }, { value: '1-0-1', label: '1-0-1' }, { value: '0-1-0', label: '0-1-0' }, { value: '1-1-1', label: '1-1-1' }, { value: '0-0-0-1', label: '0-0-0-1' }, { value: '1-0-0-0', label: '1-0-0-0' }, { value: 'As needed', label: t('pg.doctor.prescription.freqAsNeeded') },
              ]} />
              <Select label={t('pg.doctor.prescription.frequency')} name={`med-freq-${idx}`} value={med.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} options={[
                { value: 'Once daily', label: t('pg.doctor.prescription.freqOnceDaily') }, { value: 'Twice daily', label: t('pg.doctor.prescription.freqTwiceDaily') }, { value: 'Three times daily', label: t('pg.doctor.prescription.freqThreeTimesDaily') }, { value: 'Four times daily', label: t('pg.doctor.prescription.freqFourTimesDaily') }, { value: 'Once daily at night', label: t('pg.doctor.prescription.freqOnceDailyNight') }, { value: 'On empty stomach', label: t('pg.doctor.prescription.freqEmptyStomach') }, { value: 'After meals', label: t('pg.doctor.prescription.freqAfterMeals') }, { value: 'As needed', label: t('pg.doctor.prescription.freqAsNeeded') },
              ]} />
              <div className="medicine-duration">
                <Input label={t('pg.doctor.prescription.duration')} name={`med-dur-${idx}`} type="number" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', Number(e.target.value))} min="1" />
                <Select name={`med-dur-type-${idx}`} value={med.durationType} onChange={(e) => updateMedicine(idx, 'durationType', e.target.value)} options={[{ value: 'days', label: t('pg.doctor.prescription.days') }, { value: 'weeks', label: t('pg.doctor.prescription.weeks') }, { value: 'months', label: t('pg.doctor.prescription.months') }]} />
              </div>
              <Input label={t('pg.doctor.prescription.qty')} name={`med-qty-${idx}`} type="number" value={med.quantity} onChange={(e) => updateMedicine(idx, 'quantity', Number(e.target.value))} min="1" />
              <Input label={t('pg.doctor.prescription.instructions')} name={`med-inst-${idx}`} value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} placeholder={t('pg.doctor.prescription.instructionsPlaceholder')} />
              {medicines.length > 1 && <button type="button" className="remove-medicine" onClick={() => removeMedicine(idx)}>✕</button>}
            </div>
          ))}
        </Card>

        <Card>
          <Textarea label={t('pg.doctor.prescription.additionalNotes')} name="notes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder={t('pg.doctor.prescription.additionalNotesPlaceholder')} rows={3} />
          <Select label={t('pg.doctor.prescription.selectMedicalStore')} name="store" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} placeholder={t('pg.doctor.prescription.choosePharmacy')} options={medicalStores.map((s) => ({ value: s.name, label: `${s.name} - ${s.address}` }))} />
        </Card>

        <div className="form-actions">
          <Button type="submit" size="lg">{t('pg.doctor.prescription.createPrescription')}</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
};

export default Prescription;
