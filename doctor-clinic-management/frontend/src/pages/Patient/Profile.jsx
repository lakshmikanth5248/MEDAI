import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import { getInitials, calculateAge } from '../../utils/helpers';
import './Profile.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => resolveProfile(user));
  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState(() => ({ ...profile }));
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
    <div className="page patient-profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-large">{getInitials(profile?.name)}</div>
        <div className="profile-header-info">
          <h1>{profile?.name}</h1>
          <p className="profile-unique-id">{profile?.patientId}</p>
          <p className="text-muted">Member since {profile?.registeredDate}</p>
          <p><span className="blood-badge">{profile?.bloodGroup}</span></p>
        </div>
        <div className="profile-header-actions">
          <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>{editMode ? 'Cancel' : 'Edit Profile'}</Button>
        </div>
      </div>

      <div className="profile-grid">
        <Card title="Personal Information">
          {editMode ? (
            <div className="profile-form">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
              <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} placeholder="Select gender" options={GENDERS.map((g) => ({ value: g, label: g }))} />
              <Select label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Select blood group" options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Email" name="email" value={form.email} onChange={handleChange} />
              <Input label="Address" name="address" value={form.address} onChange={handleChange} />
              <div className="profile-form-actions">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-row"><label>Full Name</label><span>{profile?.name}</span></div>
              <div className="info-row"><label>Date of Birth</label><span>{profile?.dob} ({calculateAge(profile?.dob)} yrs)</span></div>
              <div className="info-row"><label>Gender</label><span>{profile?.gender}</span></div>
              <div className="info-row"><label>Phone</label><span>{profile?.phone}</span></div>
              <div className="info-row"><label>Email</label><span>{profile?.email}</span></div>
            </div>
          )}
        </Card>

        <Card title="Contact Information">
          <div className="profile-info-display">
            <div className="info-row"><label>Address</label><span>{profile?.address}</span></div>
            <div className="info-row"><label>Phone</label><span>{profile?.phone}</span></div>
            <div className="info-row"><label>Email</label><span>{profile?.email}</span></div>
          </div>
        </Card>

        <Card title="Medical Information">
          <div className="profile-info-display">
            <div className="info-row"><label>Blood Group</label><span className="blood-badge">{profile?.bloodGroup}</span></div>
            <div className="info-row"><label>Gender</label><span>{profile?.gender}</span></div>
            <div className="info-row"><label>Date of Birth</label><span>{profile?.dob}</span></div>
          </div>
        </Card>
      </div>

      <Card title="Password">
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
  );
};

export default Profile;
