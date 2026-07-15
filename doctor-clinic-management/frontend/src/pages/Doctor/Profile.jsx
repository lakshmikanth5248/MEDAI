import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import { departments } from '../../utils/mockData';
import { getInitials } from '../../utils/helpers';
import './Profile.css';
import { useTranslation } from '../../i18n/LanguageContext';

const DoctorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => resolveProfile(user));
  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState(() => ({ ...profile }));
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setProfile({ ...profile, ...form });
    setEditMode(false);
  };

  const docStatus = profile?.status || 'Active';

  return (
    <div className="page doctor-profile-page">
      <div className="dp-header-banner">
        <div className="dp-avatar-large">{getInitials(profile?.name)}</div>
        <div className="dp-header-info">
          <h1>{profile?.name}</h1>
          <p className="profile-unique-id">{profile?.doctorId}</p>
          <p className="text-muted">{profile?.specialization} | {profile?.department}</p>
          <p className="text-muted">License: {profile?.licenseNo}</p>
        </div>
        <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>{editMode ? t('common.cancel') : t('pg.doctor.profile.editProfile')}</Button>
      </div>

      <div className="dp-grid">
        <Card title={t('pg.doctor.profile.personalInfo')}>
          {editMode ? (
            <div className="dp-form">
              <Input label={t('register.fullName')} name="name" value={form.name} onChange={handleChange} />
              <Input label={t('pg.doctor.profile.email')} name="email" value={form.email} onChange={handleChange} />
              <Input label={t('pg.doctor.profile.phone')} name="phone" value={form.phone} onChange={handleChange} />
              <Input label={t('register.address')} name="address" value={form.address || ''} onChange={handleChange} placeholder={t('register.address')} />
              <Input label={t('pg.doctor.profile.specialization')} name="specialization" value={form.specialization || ''} onChange={handleChange} />
              <Select label={t('pg.doctor.profile.department')} name="department" value={form.department || ''} onChange={handleChange} placeholder={t('pg.doctor.profile.select')} options={departments.map((d) => ({ value: d.name, label: d.name }))} />
              <Input label={t('pg.doctor.profile.experience')} name="experience" type="number" value={form.experience || 0} onChange={handleChange} />
              <Input label={t('pg.doctor.profile.consultationFee')} name="fee" type="number" value={form.fee || 0} onChange={handleChange} />
              <Input label={t('pg.doctor.profile.qualification')} name="qualification" value={form.qualification || ''} onChange={handleChange} />
              <Input label={t('pg.doctor.profile.availability')} name="availability" value={Array.isArray(form.availability) ? form.availability.join(', ') : (form.availability || '')} onChange={handleChange} />
              <div className="dp-form-actions">
                <Button onClick={handleSave}>{t('pg.doctor.profile.saveChanges')}</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          ) : (
            <div className="dp-info-display">
              <div className="info-row"><label>{t('register.fullName')}</label><span>{profile?.name}</span></div>
              <div className="info-row"><label>{t('pg.doctor.profile.email')}</label><span>{profile?.email}</span></div>
              <div className="info-row"><label>{t('pg.doctor.profile.phone')}</label><span>{profile?.phone}</span></div>
              <div className="info-row"><label>{t('register.address')}</label><span>{profile?.address || t('pg.doctor.profile.notProvided')}</span></div>
            </div>
          )}
        </Card>

        <Card title={t('pg.doctor.profile.professionalInfo')}>
          <div className="dp-info-display">
            <div className="info-row"><label>{t('pg.doctor.profile.specialization')}</label><span>{profile?.specialization}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.department')}</label><span>{profile?.department}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.experience')}</label><span>{profile?.experience} {t('pg.doctor.profile.years')}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.qualification')}</label><span>{profile?.qualification}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.licenseNo')}</label><span>{profile?.licenseNo}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.consultationFee')}</label><span>₹{profile?.fee}</span></div>
          </div>
        </Card>

        <Card title={t('pg.doctor.profile.schedule')}>
          <div className="dp-info-display">
            <div className="info-row"><label>{t('pg.doctor.profile.availableDays')}</label><span>{Array.isArray(profile?.availability) ? profile.availability.join(', ') : profile?.availability}</span></div>
            <div className="info-row"><label>{t('pg.doctor.profile.status')}</label><span className={`status-badge ${docStatus === 'Active' ? 'status-active' : 'status-inactive'}`}>{docStatus === 'Active' ? t('pg.doctor.profile.active') : docStatus}</span></div>
          </div>
        </Card>

        <Card title={t('pg.doctor.profile.password')}>
          {!passSection ? (
            <Button variant="outline" onClick={() => setPassSection(true)}>{t('pg.doctor.profile.changePassword')}</Button>
          ) : (
            <div className="dp-form">
              <Input label={t('pg.doctor.profile.currentPassword')} name="current" type="password" value={passForm.current} onChange={(e) => setPassForm((p) => ({ ...p, current: e.target.value }))} />
              <Input label={t('auth.newPassword')} name="newPass" type="password" value={passForm.newPass} onChange={(e) => setPassForm((p) => ({ ...p, newPass: e.target.value }))} />
              <Input label={t('auth.confirmNewPassword')} name="confirm" type="password" value={passForm.confirm} onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))} />
              <div className="dp-form-actions">
                <Button onClick={() => setPassSection(false)}>{t('pg.doctor.profile.updatePassword')}</Button>
                <Button variant="secondary" onClick={() => setPassSection(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile;
