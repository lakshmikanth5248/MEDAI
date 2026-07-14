import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { currentPatient } from '../../utils/mockData';
import { getInitials, calculateAge } from '../../utils/helpers';
import './Profile.css';

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState({ ...currentPatient });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const handlePasswordChange = () => {
    setPassSection(false);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="page patient-profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-large">{getInitials(currentPatient.name)}</div>
        <div className="profile-header-info">
          <h1>{currentPatient.name}</h1>
          <p className="text-muted">{currentPatient.id} | Member since {currentPatient.registeredDate}</p>
          <p><span className="blood-badge">{currentPatient.bloodGroup}</span></p>
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
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Email" name="email" value={form.email} onChange={handleChange} />
              <div className="profile-form-actions">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-row"><label>Full Name</label><span>{currentPatient.name}</span></div>
              <div className="info-row"><label>Date of Birth</label><span>{currentPatient.dob} ({calculateAge(currentPatient.dob)} yrs)</span></div>
              <div className="info-row"><label>Gender</label><span>{currentPatient.gender}</span></div>
              <div className="info-row"><label>Phone</label><span>{currentPatient.phone}</span></div>
              <div className="info-row"><label>Email</label><span>{currentPatient.email}</span></div>
            </div>
          )}
        </Card>

        <Card title="Contact Information">
          <div className="profile-info-display">
            <div className="info-row"><label>Address</label><span>{currentPatient.address.street}, {currentPatient.address.city}</span></div>
            <div className="info-row"><label>City</label><span>{currentPatient.address.city}</span></div>
            <div className="info-row"><label>State</label><span>{currentPatient.address.state}</span></div>
            <div className="info-row"><label>Pincode</label><span>{currentPatient.address.pincode}</span></div>
            <div className="info-row"><label>Emergency Contact</label><span>{currentPatient.emergencyContact.name} ({currentPatient.emergencyContact.relation}) - {currentPatient.emergencyContact.phone}</span></div>
          </div>
        </Card>

        <Card title="Medical Information">
          <div className="profile-info-display">
            <div className="info-row"><label>Blood Group</label><span className="blood-badge">{currentPatient.bloodGroup}</span></div>
            <div className="info-row"><label>Allergies</label><span>{currentPatient.allergies?.length ? currentPatient.allergies.join(', ') : 'None'}</span></div>
            <div className="info-row"><label>Chronic Conditions</label><span>{currentPatient.chronicConditions?.length ? currentPatient.chronicConditions.join(', ') : 'None'}</span></div>
            <div className="info-row"><label>Insurance</label><span>{currentPatient.insurance.provider || 'N/A'} {currentPatient.insurance.policyNo ? `(${currentPatient.insurance.policyNo})` : ''}</span></div>
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
