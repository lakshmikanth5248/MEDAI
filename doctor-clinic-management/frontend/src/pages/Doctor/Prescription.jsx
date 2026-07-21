import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as pharmacyApi from '../../services/api/pharmacy';
import { getErrorMessage } from '../../services/apiError';
import { calculateAge } from '../../utils/helpers';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import { buildPrescriptionPrintHtml } from '../../services/prescriptionStore';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import './Prescription.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Prescription = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const consultData = location.state || {};
  const doctor = resolveProfile(user) || {};

  const [doctorPatients, setDoctorPatients] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [patients, storeList] = await Promise.all([
          clinicalApi.getDoctorPatients(user.id),
          pharmacyApi.getStores().catch(() => []),
        ]);
        if (cancelled) return;
        // The patient coming from a just-completed consultation may not yet
        // appear in the doctor's derived patient list on the very first
        // render - make sure they're selectable regardless.
        let list = patients;
        if (consultData.patient && !list.some((p) => String(p.id) === String(consultData.patient.id))) {
          list = [consultData.patient, ...list];
        }
        setDoctorPatients(list);
        setStores(storeList);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Failed to load patients'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const [selectedPatientId, setSelectedPatientId] = useState(String(consultData.patientId || consultData.patient?.id || ''));
  const patient = doctorPatients.find((p) => String(p.id) === String(selectedPatientId)) || consultData.patient || null;

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-0', frequency: 'Once daily', duration: 7, durationType: 'days', quantity: 7, instructions: '' },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState(consultData.diagnosis ? `Diagnosis: ${consultData.diagnosis}` : (consultData.notes || ''));
  const [selectedStore, setSelectedStore] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState(null);

  const handlePrint = () => {
    if (!createdPrescription) return;
    printDocument(t('pg.patient.prescriptions.htmlTitle'), buildPrescriptionPrintHtml(createdPrescription, t, esc));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient || !user?.id) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        patientId: patient.id,
        doctorId: user.id,
        appointmentId: consultData.appointmentId,
        consultationId: consultData.consultationId,
        notes: additionalNotes,
        medicines: medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: Number(m.duration) || 0,
          durationType: m.durationType,
          quantity: Number(m.quantity) || 1,
          instructions: m.instructions,
        })),
      };
      const created = await prescriptionsApi.createPrescription(payload);
      const storeLabel = stores.find((s) => String(s.id) === String(selectedStore))?.name || selectedStore || '';
      setCreatedPrescription({
        ...created,
        id: created.rxId || created.id,
        patientName: patient.name,
        patientId: patient.patientId || patient.id,
        doctorName: doctor.name,
        store: storeLabel,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to create prescription'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page prescription-page">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (success && createdPrescription) {
    return (
      <div className="page prescription-page">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>{t('pg.doctor.prescription.createdSuccess')}</h2>
          <p className="patient-id-display">{t('pg.doctor.prescription.printPrescriptionId')}: <strong>{createdPrescription.id}</strong></p>
          <div className="success-actions">
            <Button onClick={handlePrint}>🖨️ {t('pg.doctor.prescription.printPrescription')}</Button>
            <Button variant="outline" onClick={() => { setSuccess(false); setCreatedPrescription(null); }}>{t('pg.doctor.prescription.createAnother')}</Button>
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

      {(loadError || submitError) && <p className="text-error">{loadError || submitError}</p>}

      <Card title={t('pg.doctor.prescription.patient')}>
        <Select
          label={t('pg.doctor.prescription.patient')}
          name="patientSelect"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          placeholder={t('pg.doctor.prescription.patient')}
          options={doctorPatients.map((p) => ({ value: p.id, label: `${p.name} (${p.patientId || p.id})` }))}
          required
        />
      </Card>

      {patient && (
        <Card>
          <div className="prx-patient-header">
            <div><label>{t('pg.doctor.prescription.patient')}</label><span>{patient.name}</span></div>
            <div><label>{t('pg.doctor.prescription.ageGender')}</label><span>{calculateAge(patient.dob)} yrs / {patient.gender}</span></div>
            <div><label>{t('pg.doctor.prescription.patientId')}</label><span>{patient.patientId || patient.id}</span></div>
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
          <Select label={t('pg.doctor.prescription.selectMedicalStore')} name="store" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} placeholder={t('pg.doctor.prescription.choosePharmacy')} options={stores.map((s) => ({ value: s.id, label: `${s.name} - ${s.address || ''}` }))} />
        </Card>

        <div className="form-actions">
          <Button type="submit" size="lg" disabled={submitting || !patient}>{submitting ? t('common.loading') : t('pg.doctor.prescription.createPrescription')}</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={submitting}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
};

export default Prescription;
