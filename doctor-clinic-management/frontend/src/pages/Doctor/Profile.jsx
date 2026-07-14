import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { currentDoctor } from '../../utils/mockData';
import { getInitials } from '../../utils/helpers';
import './Profile.css';

const DoctorProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [passSection, setPassSection] = useState(false);
  const [form, setForm] = useState({ name: currentDoctor.name, email: currentDoctor.email, phone: currentDoctor.phone });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => setEditMode(false);

  return (
    <div className="page doctor-profile-page">
      <div className="dp-header-banner">
        <div className="dp-avatar-large">{getInitials(currentDoctor.name)}</div>
        <div className="dp-header-info">
          <h1>{currentDoctor.name}</h1>
          <p className="text-muted">{currentDoctor.specialization} | {currentDoctor.department}</p>
          <p className="text-muted">{currentDoctor.id} | License: {currentDoctor.licenseNo}</p>
        </div>
        <Button onClick={() => setEditMode(!editMode)} icon={editMode ? '✕' : '✏️'}>{editMode ? 'Cancel' : 'Edit Profile'}</Button>
      </div>

      <div className="dp-grid">
        <Card title="Personal Information">
          {editMode ? (
            <div className="dp-form">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="Email" name="email" value={form.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Address" name="address" value={''} onChange={() => {}} placeholder="Address" />
              <div className="dp-form-actions">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="dp-info-display">
              <div className="info-row"><label>Name</label><span>{currentDoctor.name}</span></div>
              <div className="info-row"><label>Email</label><span>{currentDoctor.email}</span></div>
              <div className="info-row"><label>Phone</label><span>{currentDoctor.phone}</span></div>
              <div className="info-row"><label>Address</label><span>{currentDoctor.address || 'Not provided'}</span></div>
            </div>
          )}
        </Card>

        <Card title="Professional Information">
          <div className="dp-info-display">
            <div className="info-row"><label>Specialization</label><span>{currentDoctor.specialization}</span></div>
            <div className="info-row"><label>Department</label><span>{currentDoctor.department}</span></div>
            <div className="info-row"><label>Experience</label><span>{currentDoctor.experience} years</span></div>
            <div className="info-row"><label>Qualification</label><span>{currentDoctor.qualification}</span></div>
            <div className="info-row"><label>License No</label><span>{currentDoctor.licenseNo}</span></div>
            <div className="info-row"><label>Consultation Fee</label><span>₹{currentDoctor.fee}</span></div>
          </div>
        </Card>

        <Card title="Schedule">
          <div className="dp-info-display">
            <div className="info-row"><label>Available Days</label><span>{currentDoctor.availability.join(', ')}</span></div>
            <div className="info-row"><label>Status</label><span className={`status-badge ${currentDoctor.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{currentDoctor.status}</span></div>
          </div>
        </Card>

        <Card title="Password">
          {!passSection ? (
            <Button variant="outline" onClick={() => setPassSection(true)}>Change Password</Button>
          ) : (
            <div className="dp-form">
              <Input label="Current Password" name="current" type="password" value={passForm.current} onChange={(e) => setPassForm((p) => ({ ...p, current: e.target.value }))} />
              <Input label="New Password" name="newPass" type="password" value={passForm.newPass} onChange={(e) => setPassForm((p) => ({ ...p, newPass: e.target.value }))} />
              <Input label="Confirm New Password" name="confirm" type="password" value={passForm.confirm} onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))} />
              <div className="dp-form-actions">
                <Button onClick={() => setPassSection(false)}>Update Password</Button>
                <Button variant="secondary" onClick={() => setPassSection(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile;
