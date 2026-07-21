import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import './Reception.css';
import { useTranslation } from '../../i18n/LanguageContext';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterPatient = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dob: '',
    age: '',
    department: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  const [errors, setErrors] = useState({});
  const [generatedId, setGeneratedId] = useState(null);
  const [generatedPatient, setGeneratedPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    clinicalApi.getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = t('pg.reception.registerPatient.errFullName');
    if (!form.gender) err.gender = t('pg.reception.registerPatient.errGender');
    if (!form.dob) err.dob = t('pg.reception.registerPatient.errDob');
    if (!form.phone.trim()) err.phone = t('pg.reception.registerPatient.errPhone');
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) err.phone = t('pg.reception.registerPatient.errPhoneValid');
    if (!form.email.trim()) err.email = t('pg.reception.registerPatient.errEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = t('pg.reception.registerPatient.errEmailValid');
    if (!form.bloodGroup) err.bloodGroup = t('pg.reception.registerPatient.errBloodGroup');
    if (!form.department) err.department = t('pg.reception.registerPatient.errDepartment');
    if (!form.age.trim()) err.age = t('pg.reception.registerPatient.errAge');
    else if (!/^\d{1,3}$/.test(form.age.trim()) || Number(form.age) > 120) err.age = t('pg.reception.registerPatient.errAgeValid');
    if (!form.appointmentDate) err.appointmentDate = t('pg.reception.registerPatient.errAppointmentDate');
    if (!form.appointmentTime) err.appointmentTime = t('pg.reception.registerPatient.errAppointmentTime');
    if (!form.address.trim()) err.address = t('pg.reception.registerPatient.errAddress');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      // Only patient-record fields are persisted here - department/appointmentDate/
      // appointmentTime are collected for front-desk context but there's no doctor
      // selection on this form, so we can't create a real appointment from it
      // (clinical.appointments requires a doctorId). This mirrors the old mock's
      // behavior, where those fields were likewise validated but never used.
      const patient = await clinicalApi.createPatient({
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        bloodGroup: form.bloodGroup,
        address: form.address,
      });
      setGeneratedPatient(patient);
      setGeneratedId(patient.patientId || patient.id);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to register patient'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ name: '', gender: '', dob: '', age: '', department: '', bloodGroup: '', phone: '', email: '', address: '', appointmentDate: '', appointmentTime: '' });
    setErrors({});
    setGeneratedId(null);
    setGeneratedPatient(null);
    setSubmitError('');
  };

  if (generatedId) {
    return (
      <div className="reception-page">
        <div className="page-header">
          <h1>{t('pg.reception.registerPatient.title')}</h1>
        </div>
        <Card>
          <div className="rec-success">
            <div className="rec-success-icon">✓</div>
            <h2>{t('pg.reception.registerPatient.successTitle')}</h2>
            <p className="text-muted">{t('pg.reception.registerPatient.successMsg')}</p>
            <div className="rec-pid">{generatedId}</div>
            <div className="rec-quick">
              <Button onClick={reset}>{t('pg.reception.registerPatient.registerAnotherBtn')}</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>{t('pg.reception.registerPatient.title')}</h1>
        <p className="text-muted">{t('pg.reception.registerPatient.subtitle')}</p>
      </div>

      <Card title={t('pg.reception.registerPatient.infoTitle')}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="rec-form">
            <Input label={t('pg.reception.registerPatient.fullName')} name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder={t('pg.reception.registerPatient.fullNamePlaceholder')} required />
            <Select label={t('pg.reception.registerPatient.gender')} name="gender" value={form.gender} onChange={handleChange} error={errors.gender} placeholder={t('pg.reception.registerPatient.genderPlaceholder')} options={GENDERS.map((g) => ({ value: g, label: t(`pg.reception.registerPatient.gender.${g.toLowerCase()}`) }))} />
            <Input label={t('pg.reception.registerPatient.dob')} name="dob" type="date" value={form.dob} onChange={handleChange} error={errors.dob} required />
            <Input label={t('pg.reception.registerPatient.age')} name="age" type="number" value={form.age} onChange={handleChange} error={errors.age} placeholder={t('pg.reception.registerPatient.agePlaceholder')} required />
            <Select label={t('pg.reception.registerPatient.department')} name="department" value={form.department} onChange={handleChange} error={errors.department} placeholder={t('pg.reception.registerPatient.departmentPlaceholder')} options={departments.map((d) => ({ value: d.id, label: d.name }))} required />
            <Input label={t('pg.reception.registerPatient.appointmentDate')} name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} error={errors.appointmentDate} required />
            <Input label={t('pg.reception.registerPatient.appointmentTime')} name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} error={errors.appointmentTime} required />
            <Select label={t('pg.reception.registerPatient.bloodGroup')} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} error={errors.bloodGroup} placeholder={t('pg.reception.registerPatient.bloodGroupPlaceholder')} options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} />
            <Input label={t('pg.reception.registerPatient.phone')} name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder={t('pg.reception.registerPatient.phonePlaceholder')} required />
            <Input label={t('pg.reception.registerPatient.email')} name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder={t('pg.reception.registerPatient.emailPlaceholder')} required />
            <div className="rec-full">
              <Input label={t('pg.reception.registerPatient.address')} name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder={t('pg.reception.registerPatient.addressPlaceholder')} required />
            </div>
          </div>
          <div className="rec-quick" style={{ marginTop: 'var(--spacing-md)' }}>
            <Button type="submit">{t('pg.reception.registerPatient.submitBtn')}</Button>
            <Button type="button" variant="secondary" onClick={reset}>{t('pg.reception.registerPatient.clearBtn')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPatient;
