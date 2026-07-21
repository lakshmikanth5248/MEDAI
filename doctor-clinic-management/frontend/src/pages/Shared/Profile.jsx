import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import './Profile.css';

const ROLE_LABELS = {
  admin: 'Administrator',
  reception: 'Receptionist',
  doctor: 'Doctor',
  patient: 'Patient',
  medical_store: 'Medical Store',
};

const Profile = () => {
  const { user, updateProfile, changePassword, error, clearError } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.storeName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    clearError();
    const ok = await updateProfile(form);
    setSaving(false);
    if (ok) setEditMode(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!passwordForm.newPass || passwordForm.newPass.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    setSaving(true);
    const ok = await changePassword(passwordForm.current, passwordForm.newPass);
    setSaving(false);
    if (ok) {
      setPassSection(false);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } else {
      setPasswordError(error || 'Failed to change password');
    }
  };

  if (!user) return null;

  return (
    <div className="page shared-profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-large">{getInitials(form.name)}</div>
        <div className="profile-header-info">
          <h1>{form.name}</h1>
          <p className="profile-unique-id">{user.uid}</p>
          <p className="text-muted">{ROLE_LABELS[user.role] || user.role}</p>
          <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
            {user.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="profile-header-actions">
          <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="profile-grid">
        <Card title="Personal Information">
          {editMode ? (
            <div className="profile-form">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit phone" />
              <div className="profile-form-actions">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-row"><label>Full Name</label><span>{form.name}</span></div>
              <div className="info-row"><label>Email</label><span>{form.email}</span></div>
              <div className="info-row"><label>Phone</label><span>{form.phone || 'Not provided'}</span></div>
              <div className="info-row"><label>Role</label><span>{ROLE_LABELS[user.role] || user.role}</span></div>
            </div>
          )}
        </Card>

        <Card title="Account Security">
          <div className="profile-info-display">
            <div className="info-row"><label>User ID</label><span>{user.uid}</span></div>
            <div className="info-row"><label>Status</label><span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>{user.status === 'active' ? 'Active' : 'Inactive'}</span></div>
          </div>
          {!passSection ? (
            <Button variant="outline" onClick={() => setPassSection(true)}>Change Password</Button>
          ) : (
            <div className="profile-form">
              {passwordError && <p className="text-error">{passwordError}</p>}
              <Input label="Current Password" name="current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} />
              <Input label="New Password" name="newPass" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} />
              <Input label="Confirm New Password" name="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
              <div className="profile-form-actions">
                <Button onClick={handlePasswordChange} disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
                <Button variant="secondary" onClick={() => { setPassSection(false); setPasswordError(''); }} disabled={saving}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
