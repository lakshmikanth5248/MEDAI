import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, TextArea, DatePicker, TimePicker } from '../../components/Forms';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as authApi from '../../services/api/auth';
import { getErrorMessage } from '../../services/apiError';
import './Doctors.css';
import { useTranslation } from '../../i18n/LanguageContext';

const EMPTY_FORM = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', gender: '', dob: '', image: '',
  departmentId: '', specialization: '', qualification: '', experience: 0,
  consultationFee: 0, licenseNo: '', availabilityDays: '', availabilityHours: '', roomNo: '',
  address: '', city: '', state: '', pinCode: '', status: 'active',
};

const DoctorsPage = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [savedCreds, setSavedCreds] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [resetPwdModal, setResetPwdModal] = useState(null);
  const [resetPwdForm, setResetPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [d, dept] = await Promise.all([clinicalApi.getDoctors(), clinicalApi.getDepartments()]);
      setDoctors(d);
      setDepartments(dept);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load doctors'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const validateForm = (data, isAddForm) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Full Name is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    if (isAddForm) {
      if (!data.password) errors.password = 'Password is required';
      else if (data.password.length < 8) errors.password = 'Min 8 characters';
      else if (!/(?=.*[a-z])/.test(data.password)) errors.password = 'Need one lowercase';
      else if (!/(?=.*[A-Z])/.test(data.password)) errors.password = 'Need one uppercase';
      else if (!/(?=.*\d)/.test(data.password)) errors.password = 'Need one number';
      else if (!/(?=.*[!@#$%^&*])/.test(data.password)) errors.password = 'Need one special character';
      if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    if (data.phone && !/^\d{10}$/.test(data.phone)) errors.phone = 'Must be 10 digits';
    if (!data.departmentId) errors.departmentId = 'Department is required';
    return errors;
  };

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (searchBy === 'doctorId') return (d.doctorId || '').toLowerCase().includes(q);
    if (searchBy === 'email') return (d.email || '').toLowerCase().includes(q);
    if (searchBy === 'department') return (d.department || '').toLowerCase().includes(q);
    if (searchBy === 'specialization') return (d.specialization || '').toLowerCase().includes(q);
    return (d.name || '').toLowerCase().includes(q);
  }).filter((d) => !deptFilter || d.department === deptFilter)
    .filter((d) => !statusFilter || d.status === statusFilter)
    .filter((d) => !specializationFilter || (d.specialization || '').toLowerCase() === specializationFilter.toLowerCase());

  const columns = [
    { key: 'doctorId', label: 'Doctor ID' },
    {
      key: 'image', label: 'Photo',
      render: (v) => v ? <img src={v} alt="" className="profile-thumb" /> : <div className="profile-thumb-placeholder">👨‍⚕️</div>,
    },
    { key: 'name', label: 'Doctor Name' },
    { key: 'department', label: 'Department' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'experience', label: 'Experience', render: (v) => `${v ?? 0} yrs` },
    { key: 'fee', label: 'Fee', render: (v) => `₹${v ?? 0}` },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'availabilityDays', label: 'Available Days', render: (v) => v || '—' },
    { key: 'availabilityHours', label: 'Time', render: (v) => v || '—' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="View" onClick={(e) => { e.stopPropagation(); setViewModal(row); }}>👁️</button>
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditModal({ ...row, departmentId: row.departmentId || '' }); setIsAdd(false); setSavedCreds(null); setFormErrors({}); }}>✏️</button>
          <button className="icon-btn" title="Reset Password" onClick={(e) => { e.stopPropagation(); setResetPwdModal(row); setResetPwdForm({ newPassword: '', confirmPassword: '' }); }}>🔑</button>
          {row.status === 'active' ? (
            <button className="icon-btn" title="Deactivate" onClick={(e) => { e.stopPropagation(); handleStatusToggle(row, 'inactive'); }}>⛔</button>
          ) : (
            <button className="icon-btn" title="Activate" onClick={(e) => { e.stopPropagation(); handleStatusToggle(row, 'active'); }}>✅</button>
          )}
          <button className="icon-btn icon-btn-danger" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row); }}>🗑️</button>
        </div>
      ),
    },
  ];

  const handleStatusToggle = async (row, newStatus) => {
    try {
      await clinicalApi.updateDoctor(row.id, { status: newStatus });
      if (row.userId) {
        try { await authApi.updateUserStatus(row.userId, newStatus); } catch { }
      }
      setDoctors((prev) => prev.map((d) => d.id === row.id ? { ...d, status: newStatus } : d));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await clinicalApi.deleteDoctor(deleteConfirm.id);
      if (deleteConfirm.userId) {
        try { await authApi.deleteUser(deleteConfirm.userId); } catch { }
      }
      setDoctors((prev) => prev.filter((d) => d.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete doctor'));
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwdModal?.userId) { setError('No user associated with this doctor'); return; }
    const { newPassword, confirmPassword } = resetPwdForm;
    if (newPassword && newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword && newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      await authApi.resetUserPassword(resetPwdModal.userId, { newPassword: newPassword || undefined });
      setResetPwdModal(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password'));
    }
  };

  const handleSave = async () => {
    const errors = validateForm(editModal, isAdd);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError('');
    try {
      if (isAdd) {
        const payload = {
          role: 'doctor',
          name: editModal.name,
          email: editModal.email,
          password: editModal.password,
          departmentId: Number(editModal.departmentId) || editModal.departmentId,
          specialization: editModal.specialization,
          qualification: editModal.qualification,
          experience: editModal.experience,
          consultationFee: editModal.consultationFee,
          licenseNo: editModal.licenseNo,
          phone: editModal.phone,
          gender: editModal.gender,
          dob: editModal.dob,
          address: editModal.address,
          city: editModal.city,
          state: editModal.state,
          pinCode: editModal.pinCode,
          roomNo: editModal.roomNo,
          availabilityDays: editModal.availabilityDays,
          availabilityHours: editModal.availabilityHours,
          image: editModal.image,
        };
        const res = await authApi.createStaff(payload);
        setSavedCreds({ id: res.user?.uid, password: editModal.password || res.defaultPassword });
        load();
        return;
      } else {
        const payload = {
          name: editModal.name, specialization: editModal.specialization,
          departmentId: Number(editModal.departmentId) || editModal.departmentId,
          experience: Number(editModal.experience), fee: Number(editModal.consultationFee),
          qualification: editModal.qualification,
          email: editModal.email, phone: editModal.phone,
          gender: editModal.gender, dob: editModal.dob,
          address: editModal.address, city: editModal.city,
          state: editModal.state, pinCode: editModal.pinCode,
          roomNo: editModal.roomNo, licenseNo: editModal.licenseNo,
          availabilityDays: editModal.availabilityDays,
          availabilityHours: editModal.availabilityHours,
          image: editModal.image,
          status: editModal.status,
        };
        const updated = await clinicalApi.updateDoctor(editModal.id, payload);
        setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      }
      setEditModal(null);
      setIsAdd(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save doctor'));
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditModal({ ...EMPTY_FORM });
    setIsAdd(true);
    setSavedCreds(null);
    setError('');
    setFormErrors({});
  };

  const closeModal = () => {
    setEditModal(null);
    setIsAdd(false);
    setSavedCreds(null);
    setError('');
    setFormErrors({});
  };

  const uniqueSpecializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>Doctor Management</h1>
      
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctors-filters">
        <div className="filter-group">
          <Select name="searchBy" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}
            options={[
              { value: 'name', label: 'Doctor Name' },
              { value: 'doctorId', label: 'Doctor ID' },
              { value: 'email', label: 'Email' },
              { value: 'department', label: 'Department' },
              { value: 'specialization', label: 'Specialization' },
            ]} />
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search by ${searchBy}...`} />
        </div>
        <Select name="dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} placeholder="All Departments" options={departments.map((d) => ({ value: d.name, label: d.name }))} />
        <Select name="specialization" value={specializationFilter} onChange={(e) => setSpecializationFilter(e.target.value)} placeholder="All Specializations" options={uniqueSpecializations.map((s) => ({ value: s, label: s }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        {loading ? <Loader /> : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No doctors found"
          />
        )}
      </Card>

      <Modal isOpen={!!editModal} onClose={closeModal} title={isAdd ? 'Register Doctor' : 'Edit Doctor'} size="lg">
        {editModal && (
          <div className="doctor-form">
            {savedCreds ? (
              <div className="staff-creds">
                <div className="staff-saved-msg">Doctor registered successfully</div>
                <div className="cred-row"><span>Doctor ID</span><strong>{savedCreds.id}</strong></div>
                <div className="cred-row"><span>Email</span><strong>{editModal.email}</strong></div>
                <div className="cred-row"><span>Password</span><strong>{savedCreds.password}</strong></div>
                <p className="cred-note">Share these credentials with the doctor.</p>
                <div className="staff-form-actions">
                  <Button onClick={closeModal}>Done</Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="form-section-title">Personal Details</h3>
                <div className="form-row">
                  <Input label="Full Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} error={formErrors.name} required />
                  <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} error={formErrors.email} required />
                </div>
                {isAdd && (
                  <div className="form-row">
                    <Input label="Password" name="password" type="password" value={editModal.password || ''} onChange={(e) => setEditModal((p) => ({ ...p, password: e.target.value }))} error={formErrors.password} required />
                    <Input label="Confirm Password" name="confirmPassword" type="password" value={editModal.confirmPassword || ''} onChange={(e) => setEditModal((p) => ({ ...p, confirmPassword: e.target.value }))} error={formErrors.confirmPassword} required />
                  </div>
                )}
                <div className="form-row">
                  <Input label="Mobile Number" name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} error={formErrors.phone} />
                  <Select label="Gender" name="gender" value={editModal.gender} onChange={(e) => setEditModal((p) => ({ ...p, gender: e.target.value }))} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                </div>
                <div className="form-row">
                  <DatePicker label="Date of Birth" name="dob" value={editModal.dob} onChange={(e) => setEditModal((p) => ({ ...p, dob: e.target.value }))} />
                  <Input label="Profile Photo URL" name="image" value={editModal.image} onChange={(e) => setEditModal((p) => ({ ...p, image: e.target.value }))} />
                </div>

                <h3 className="form-section-title">Professional Details</h3>
                <div className="form-row">
                  <Select label="Department" name="departmentId" value={editModal.departmentId} onChange={(e) => setEditModal((p) => ({ ...p, departmentId: e.target.value }))} error={formErrors.departmentId} required placeholder="Select Department" options={departments.map((d) => ({ value: d.id, label: d.name }))} />
                  <Input label="Specialization" name="specialization" value={editModal.specialization} onChange={(e) => setEditModal((p) => ({ ...p, specialization: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Input label="Qualification" name="qualification" value={editModal.qualification} onChange={(e) => setEditModal((p) => ({ ...p, qualification: e.target.value }))} />
                  <Input label="Experience (Years)" name="experience" type="number" value={editModal.experience} onChange={(e) => setEditModal((p) => ({ ...p, experience: Number(e.target.value) }))} />
                </div>
                <div className="form-row">
                  <Input label="Medical Registration No." name="licenseNo" value={editModal.licenseNo} onChange={(e) => setEditModal((p) => ({ ...p, licenseNo: e.target.value }))} />
                  <Input label="Consultation Fee" name="consultationFee" type="number" value={editModal.consultationFee} onChange={(e) => setEditModal((p) => ({ ...p, consultationFee: Number(e.target.value) }))} />
                </div>
                <div className="form-row">
                  <Input label="Available Days" name="availabilityDays" value={editModal.availabilityDays} onChange={(e) => setEditModal((p) => ({ ...p, availabilityDays: e.target.value }))} placeholder="e.g. Mon-Fri" />
                  <TimePicker label="Available Time" name="availabilityHours" value={editModal.availabilityHours} onChange={(e) => setEditModal((p) => ({ ...p, availabilityHours: e.target.value }))} />
                </div>
                <Input label="Room Number" name="roomNo" value={editModal.roomNo} onChange={(e) => setEditModal((p) => ({ ...p, roomNo: e.target.value }))} />

                <h3 className="form-section-title">Address</h3>
                <TextArea label="Address" name="address" value={editModal.address || ''} onChange={(e) => setEditModal((p) => ({ ...p, address: e.target.value }))} />
                <div className="form-row">
                  <Input label="City" name="city" value={editModal.city} onChange={(e) => setEditModal((p) => ({ ...p, city: e.target.value }))} />
                  <Input label="State" name="state" value={editModal.state} onChange={(e) => setEditModal((p) => ({ ...p, state: e.target.value }))} />
                  <Input label="PIN Code" name="pinCode" value={editModal.pinCode} onChange={(e) => setEditModal((p) => ({ ...p, pinCode: e.target.value }))} />
                </div>

                <h3 className="form-section-title">Account</h3>
                <div className="form-row">
                  <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                </div>

                <div className="user-form-actions">
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (isAdd ? 'Register Doctor' : 'Save Changes')}</Button>
                  <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Doctor Profile" size="lg">
        {viewModal && (
          <div className="view-profile">
            <div className="profile-header">
              {viewModal.image ? <img src={viewModal.image} alt="" className="profile-img" /> : <div className="profile-img-placeholder">👨‍⚕️</div>}
              <div>
                <h2>{viewModal.name}</h2>
                <p className="text-muted">{viewModal.doctorId} | {viewModal.department}</p>
              </div>
              <span className={`status-badge ${viewModal.status === 'active' ? 'status-success' : 'status-danger'}`}>{viewModal.status === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="profile-details-grid">
              <div className="detail-group">
                <h4>Personal Details</h4>
                <div className="detail-row"><span>Email</span><strong>{viewModal.email || '—'}</strong></div>
                <div className="detail-row"><span>Phone</span><strong>{viewModal.phone || '—'}</strong></div>
                <div className="detail-row"><span>Gender</span><strong>{viewModal.gender || '—'}</strong></div>
                <div className="detail-row"><span>Date of Birth</span><strong>{viewModal.dob ? new Date(viewModal.dob).toLocaleDateString() : '—'}</strong></div>
              </div>
              <div className="detail-group">
                <h4>Professional Details</h4>
                <div className="detail-row"><span>Specialization</span><strong>{viewModal.specialization || '—'}</strong></div>
                <div className="detail-row"><span>Qualification</span><strong>{viewModal.qualification || '—'}</strong></div>
                <div className="detail-row"><span>Experience</span><strong>{viewModal.experience ?? 0} yrs</strong></div>
                <div className="detail-row"><span>License No.</span><strong>{viewModal.licenseNo || '—'}</strong></div>
                <div className="detail-row"><span>Consultation Fee</span><strong>₹{viewModal.fee ?? 0}</strong></div>
                <div className="detail-row"><span>Room No.</span><strong>{viewModal.roomNo || '—'}</strong></div>
              </div>
              <div className="detail-group">
                <h4>Availability</h4>
                <div className="detail-row"><span>Days</span><strong>{viewModal.availabilityDays || '—'}</strong></div>
                <div className="detail-row"><span>Time</span><strong>{viewModal.availabilityHours || '—'}</strong></div>
              </div>
              <div className="detail-group">
                <h4>Address</h4>
                <div className="detail-row"><span>Address</span><strong>{viewModal.address || '—'}</strong></div>
                <div className="detail-row"><span>City</span><strong>{viewModal.city || '—'}</strong></div>
                <div className="detail-row"><span>State</span><strong>{viewModal.state || '—'}</strong></div>
                <div className="detail-row"><span>PIN Code</span><strong>{viewModal.pinCode || '—'}</strong></div>
              </div>
            </div>
            <div className="profile-footer">
              <Button onClick={() => setViewModal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!resetPwdModal} onClose={() => setResetPwdModal(null)} title={`Reset Password - ${resetPwdModal?.name || ''}`} size="sm">
        <div className="reset-pwd-form">
          <p className="text-muted">Generate a temporary password or enter a new one.</p>
          <Input label="New Password" name="newPassword" type="password" value={resetPwdForm.newPassword} onChange={(e) => setResetPwdForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Leave empty for temporary password" />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={resetPwdForm.confirmPassword} onChange={(e) => setResetPwdForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
          <div className="user-form-actions">
            <Button onClick={handleResetPassword}>Reset Password</Button>
            <Button variant="secondary" onClick={() => setResetPwdModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Doctor?"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This will also remove their login access.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default DoctorsPage;
