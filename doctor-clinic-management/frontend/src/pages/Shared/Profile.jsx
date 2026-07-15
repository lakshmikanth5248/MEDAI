import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
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
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => resolveProfile(user));

  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile({ ...profile, ...form });
    setEditMode(false);
  };
  const handlePasswordChange = () => {
    setPassSection(false);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="page shared-profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-large">{getInitials(form.name)}</div>
        <div className="profile-header-info">
          <h1>{form.name}</h1>
          <p className="profile-unique-id">{profile?.id}</p>
          <p className="text-muted">{ROLE_LABELS[user?.role] || user?.role}</p>
          <span className={`status-badge ${profile?.status === 'active' ? 'status-active' : 'status-inactive'}`}>
            {profile?.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="profile-header-actions">
          <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="profile-grid">
        <Card title="Personal Information">
          {editMode ? (
            <div className="profile-form">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit phone" />
              <div className="profile-form-actions">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-row"><label>Full Name</label><span>{form.name}</span></div>
              <div className="info-row"><label>Email</label><span>{form.email}</span></div>
              <div className="info-row"><label>Phone</label><span>{form.phone || 'Not provided'}</span></div>
              <div className="info-row"><label>Role</label><span>{ROLE_LABELS[user?.role] || user?.role}</span></div>
              <div className="info-row"><label>Last Login</label><span>{profile?.lastLogin || '—'}</span></div>
            </div>
          )}
        </Card>

        <Card title="Account Security">
          <div className="profile-info-display">
            <div className="info-row"><label>User ID</label><span>{profile?.id}</span></div>
            <div className="info-row"><label>Status</label><span className={`status-badge ${profile?.status === 'active' ? 'status-active' : 'status-inactive'}`}>{profile?.status === 'active' ? 'Active' : 'Inactive'}</span></div>
          </div>
          {!passSection ? (
            <Button variant="outline" onClick={() => setPassSection(true)}>Change Password</Button>
          ) : (
            <div className="profile-form">
              <Input label="Current Password" name="current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} />
              <Input label="New Password" name="newPass" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} />
              <Input label="Confirm New Password" name="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
              <div className="profile-form-actions">
                <Button onClick={handlePasswordChange}>Update Password</Button>
                <Button variant="secondary" onClick={() => setPassSection(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
