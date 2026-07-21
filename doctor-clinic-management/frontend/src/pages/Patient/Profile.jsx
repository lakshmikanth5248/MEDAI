import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import { getInitials, calculateAge } from '../../utils/helpers';
import { useTranslation } from '../../i18n/LanguageContext';
import './Profile.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword } = useAuth();
  const profile = resolveProfile(user);
  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState(() => ({ ...profile, gender: capitalize(profile?.gender) }));
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setForm({ ...profile, gender: capitalize(profile?.gender) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const ok = await updateProfile({
        name: form.name,
        phone: form.phone,
        gender: form.gender ? form.gender.toLowerCase() : form.gender,
        bloodGroup: form.bloodGroup,
        dob: form.dob,
        address: form.address,
      });
      if (ok) {
        setEditMode(false);
      } else {
        setSaveError(t('pg.patient.profile.saveFailed') || 'Failed to save changes');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!passwordForm.current || !passwordForm.newPass) {
      setPasswordError('Current and new password are required');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      const ok = await changePassword(passwordForm.current, passwordForm.newPass);
      if (ok) {
        setPasswordSuccess(true);
        setPassSection(false);
        setPasswordForm({ current: '', newPass: '', confirm: '' });
      } else {
        setPasswordError('Failed to update password');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="page patient-profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-large">{getInitials(profile?.name)}</div>
        <div className="profile-header-info">
          <h1>{profile?.name}</h1>
          <p className="profile-unique-id">{profile?.patientId}</p>
          <p className="text-muted">{t('pg.patient.profile.memberSince')} {profile?.registeredDate}</p>
          <p><span className="blood-badge">{profile?.bloodGroup}</span></p>
        </div>
        <div className="profile-header-actions">
          <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>{editMode ? t('pg.patient.profile.cancel') : t('pg.patient.profile.editProfile')}</Button>
        </div>
      </div>

      <div className="profile-grid">
        <Card title={t('pg.patient.profile.personalInformation')}>
          {editMode ? (
            <div className="profile-form">
              {saveError && <p className="text-danger">{saveError}</p>}
              <Input label={t('pg.patient.profile.lblFullName')} name="name" value={form.name || ''} onChange={handleChange} />
              <Input label={t('pg.patient.profile.lblDateOfBirth')} name="dob" type="date" value={form.dob || ''} onChange={handleChange} />
              <Select label={t('pg.patient.profile.lblGender')} name="gender" value={form.gender || ''} onChange={handleChange} placeholder={t('pg.patient.profile.selectGender')} options={GENDERS.map((g) => ({ value: g, label: t('pg.patient.profile.gender' + g.toLowerCase()) }))} />
              <Select label={t('pg.patient.profile.lblBloodGroup')} name="bloodGroup" value={form.bloodGroup || ''} onChange={handleChange} placeholder={t('pg.patient.profile.selectBloodGroup')} options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} />
              <Input label={t('pg.patient.profile.lblPhone')} name="phone" value={form.phone || ''} onChange={handleChange} />
              <Input label={t('pg.patient.profile.lblEmail')} name="email" value={form.email || ''} onChange={handleChange} disabled />
              <Input label={t('pg.patient.profile.lblAddress')} name="address" value={form.address || ''} onChange={handleChange} />
              <div className="profile-form-actions">
                <Button onClick={handleSave} disabled={saving}>{saving ? '...' : t('pg.patient.profile.saveChanges')}</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>{t('pg.patient.profile.cancel')}</Button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-row"><label>{t('pg.patient.profile.lblFullName')}</label><span>{profile?.name}</span></div>
              <div className="info-row"><label>{t('pg.patient.profile.lblDateOfBirth')}</label><span>{profile?.dob} ({calculateAge(profile?.dob)} yrs)</span></div>
              <div className="info-row"><label>{t('pg.patient.profile.lblGender')}</label><span>{capitalize(profile?.gender)}</span></div>
              <div className="info-row"><label>{t('pg.patient.profile.lblPhone')}</label><span>{profile?.phone}</span></div>
              <div className="info-row"><label>{t('pg.patient.profile.lblEmail')}</label><span>{profile?.email}</span></div>
            </div>
          )}
        </Card>

        <Card title={t('pg.patient.profile.contactInformation')}>
          <div className="profile-info-display">
            <div className="info-row"><label>{t('pg.patient.profile.lblAddress')}</label><span>{profile?.address}</span></div>
            <div className="info-row"><label>{t('pg.patient.profile.lblPhone')}</label><span>{profile?.phone}</span></div>
            <div className="info-row"><label>{t('pg.patient.profile.lblEmail')}</label><span>{profile?.email}</span></div>
          </div>
        </Card>

        <Card title={t('pg.patient.profile.medicalInformation')}>
          <div className="profile-info-display">
            <div className="info-row"><label>{t('pg.patient.profile.lblBloodGroup')}</label><span className="blood-badge">{profile?.bloodGroup}</span></div>
            <div className="info-row"><label>{t('pg.patient.profile.lblGender')}</label><span>{capitalize(profile?.gender)}</span></div>
            <div className="info-row"><label>{t('pg.patient.profile.lblDateOfBirth')}</label><span>{profile?.dob}</span></div>
          </div>
        </Card>
      </div>

      <Card title={t('pg.patient.profile.password')}>
        {passwordSuccess && <p className="text-success">{t('pg.patient.profile.passwordUpdated') || 'Password updated successfully'}</p>}
        {!passSection ? (
          <Button variant="outline" onClick={() => { setPassSection(true); setPasswordSuccess(false); }}>{t('pg.patient.profile.changePassword')}</Button>
        ) : (
          <div className="profile-form">
            {passwordError && <p className="text-danger">{passwordError}</p>}
            <Input label={t('pg.patient.profile.lblCurrentPassword')} name="current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} />
            <Input label={t('pg.patient.profile.lblNewPassword')} name="newPass" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} />
            <Input label={t('pg.patient.profile.lblConfirmNewPassword')} name="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
            <div className="profile-form-actions">
              <Button onClick={handlePasswordChange} disabled={passwordSaving}>{passwordSaving ? '...' : t('pg.patient.profile.updatePassword')}</Button>
              <Button variant="secondary" onClick={() => setPassSection(false)} disabled={passwordSaving}>{t('pg.patient.profile.cancel')}</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
