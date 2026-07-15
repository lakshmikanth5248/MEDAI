import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { generatePatientId } from '../../utils/helpers';
import './Reception.css';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterPatient = () => {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [generatedId, setGeneratedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Full name is required';
    if (!form.gender) err.gender = 'Select gender';
    if (!form.dob) err.dob = 'Date of birth is required';
    if (!form.phone.trim()) err.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) err.phone = 'Enter a valid 10-digit phone';
    if (!form.email.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email';
    if (!form.bloodGroup) err.bloodGroup = 'Select blood group';
    if (!form.address.trim()) err.address = 'Address is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setGeneratedId(generatePatientId());
  };

  const reset = () => {
    setForm({ name: '', gender: '', dob: '', bloodGroup: '', phone: '', email: '', address: '' });
    setErrors({});
    setGeneratedId(null);
  };

  if (generatedId) {
    return (
      <div className="reception-page">
        <div className="page-header">
          <h1>Register Patient</h1>
        </div>
        <Card>
          <div className="rec-success">
            <div className="rec-success-icon">✓</div>
            <h2>Patient Registered Successfully</h2>
            <p className="text-muted">A new patient record has been created with the ID below.</p>
            <div className="rec-pid">{generatedId}</div>
            <div className="rec-quick">
              <Button onClick={reset}>Register Another</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>Register Patient</h1>
        <p className="text-muted">Fill in the patient's personal and medical details to create a new record.</p>
      </div>

      <Card title="Patient Information">
        <form onSubmit={handleSubmit} noValidate>
          <div className="rec-form">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Enter full name" required />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} error={errors.gender} placeholder="Select gender" options={GENDERS.map((g) => ({ value: g, label: g }))} />
            <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} error={errors.dob} required />
            <Select label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} error={errors.bloodGroup} placeholder="Select blood group" options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} />
            <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="10-digit mobile number" required />
            <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="Enter email" required />
            <div className="rec-full">
              <Input label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="Full address" required />
            </div>
          </div>
          <div className="rec-quick" style={{ marginTop: 'var(--spacing-md)' }}>
            <Button type="submit">Register Patient</Button>
            <Button type="button" variant="secondary" onClick={reset}>Clear</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPatient;
