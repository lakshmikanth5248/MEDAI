import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, TextArea, DatePicker } from '../../components/Forms';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as authApi from '../../services/api/auth';
import { getErrorMessage } from '../../services/apiError';
import './Doctors.css';

const EMPTY_FORM = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', gender: '', dob: '', image: '',
  employeeNo: '', shift: '', departmentId: '', joiningDate: '', deskNo: '',
  address: '', city: '', state: '', pinCode: '', status: 'active',
};

const ReceptionStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [savedCreds, setSavedCreds] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [resetPwdModal, setResetPwdModal] = useState(null);
  const [resetPwdForm, setResetPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [receptionists, dept] = await Promise.all([
        clinicalApi.getReceptionists(),
        clinicalApi.getDepartments(),
      ]);
      setStaff(receptionists || []);
      setDepartments(dept || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reception staff'));
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
    return errors;
  };

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (searchBy === 'receptionId') return (s.receptionId || '').toLowerCase().includes(q);
    if (searchBy === 'email') return (s.email || '').toLowerCase().includes(q);
    if (searchBy === 'shift') return (s.shift || '').toLowerCase().includes(q);
    return (s.name || '').toLowerCase().includes(q);
  }).filter((s) => !shiftFilter || (s.shift || '') === shiftFilter)
    .filter((s) => !statusFilter || s.status === statusFilter);

  const columns = [
    { key: 'receptionId', label: 'Reception ID' },
    {
      key: 'image', label: 'Photo',
      render: (v) => v ? <img src={v} alt="" className="profile-thumb" /> : <div className="profile-thumb-placeholder">🧑‍💼</div>,
    },
    { key: 'name', label: 'Reception Name' },
    { key: 'employeeNo', label: 'Employee No.', render: (v) => v || '—' },
    { key: 'shift', label: 'Shift', render: (v) => v || '—' },
    { key: 'department', label: 'Department', render: (v) => v || '—' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'joiningDate', label: 'Joining Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
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
      await clinicalApi.updateReceptionist(row.id, { status: newStatus });
      if (row.userId) {
        try { await authApi.updateUserStatus(row.userId, newStatus); } catch { }
      }
      setStaff((prev) => prev.map((s) => s.id === row.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await clinicalApi.deleteReceptionist(deleteConfirm.id);
      if (deleteConfirm.userId) {
        try { await authApi.deleteUser(deleteConfirm.userId); } catch { }
      }
      setStaff((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete reception staff'));
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwdModal?.userId) { setError('No user associated with this staff'); return; }
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
      const payload = {
        role: 'reception',
        name: editModal.name,
        email: editModal.email,
        password: editModal.password,
        phone: editModal.phone,
        gender: editModal.gender,
        dob: editModal.dob,
        image: editModal.image,
        employeeNo: editModal.employeeNo,
        shift: editModal.shift,
        departmentId: editModal.departmentId ? Number(editModal.departmentId) : undefined,
        joiningDate: editModal.joiningDate,
        deskNo: editModal.deskNo,
        address: editModal.address,
        city: editModal.city,
        state: editModal.state,
        pinCode: editModal.pinCode,
      };
      const res = await authApi.createStaff(payload);
      setSavedCreds({ id: res.user?.uid, password: editModal.password || res.defaultPassword });
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save reception staff'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, email: editModal.email,
        phone: editModal.phone, gender: editModal.gender,
        dob: editModal.dob, image: editModal.image,
        employeeNo: editModal.employeeNo, shift: editModal.shift,
        departmentId: editModal.departmentId ? Number(editModal.departmentId) : undefined,
        joiningDate: editModal.joiningDate, deskNo: editModal.deskNo,
        address: editModal.address, city: editModal.city,
        state: editModal.state, pinCode: editModal.pinCode,
        status: editModal.status,
      };
      const updated = await clinicalApi.updateReceptionist(editModal.id, payload);
      setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditModal(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update reception staff'));
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

  const uniqueShifts = [...new Set(staff.map((s) => s.shift).filter(Boolean))];

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>Reception Staff Management</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctors-filters">
        <div className="filter-group">
          <Select name="searchBy" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}
            options={[
              { value: 'name', label: 'Reception Name' },
              { value: 'receptionId', label: 'Reception ID' },
              { value: 'email', label: 'Email' },
              { value: 'shift', label: 'Shift' },
            ]} />
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search by ${searchBy}...`} />
        </div>
        <Select name="shift" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} placeholder="All Shifts" options={uniqueShifts.map((s) => ({ value: s, label: s }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} emptyMessage="No reception staff found" />}
      </Card>

      <Modal isOpen={!!editModal} onClose={closeModal} title={isAdd ? 'Register Reception Staff' : 'Edit Reception Staff'} size="lg">
        {editModal && (
          <div className="doctor-form">
            {savedCreds ? (
              <div className="staff-creds">
                <div className="staff-saved-msg">Reception staff registered successfully</div>
                <div className="cred-row"><span>Reception ID</span><strong>{savedCreds.id}</strong></div>
                <div className="cred-row"><span>Email</span><strong>{editModal.email}</strong></div>
                <div className="cred-row"><span>Password</span><strong>{savedCreds.password}</strong></div>
                <p className="cred-note">Share these credentials with the staff.</p>
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
                  {isAdd && <Input label="Profile Photo URL" name="image" value={editModal.image || ''} onChange={(e) => setEditModal((p) => ({ ...p, image: e.target.value }))} />}
                </div>

                <h3 className="form-section-title">Work Details</h3>
                <div className="form-row">
                  <Input label="Employee Number" name="employeeNo" value={editModal.employeeNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, employeeNo: e.target.value }))} />
                  <Select label="Shift" name="shift" value={editModal.shift} onChange={(e) => setEditModal((p) => ({ ...p, shift: e.target.value }))}
                    options={[{ value: 'Morning', label: 'Morning' }, { value: 'Afternoon', label: 'Afternoon' }, { value: 'Evening', label: 'Evening' }, { value: 'Night', label: 'Night' }]} />
                </div>
                <div className="form-row">
                  <Select label="Assigned Department" name="departmentId" value={editModal.departmentId} onChange={(e) => setEditModal((p) => ({ ...p, departmentId: e.target.value }))} placeholder="Select Department" options={departments.map((d) => ({ value: d.id, label: d.name }))} />
                  <DatePicker label="Joining Date" name="joiningDate" value={editModal.joiningDate} onChange={(e) => setEditModal((p) => ({ ...p, joiningDate: e.target.value }))} />
                </div>
                <Input label="Reception Desk Number" name="deskNo" value={editModal.deskNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, deskNo: e.target.value }))} />

                <h3 className="form-section-title">Address</h3>
                <TextArea label="Address" name="address" value={editModal.address || ''} onChange={(e) => setEditModal((p) => ({ ...p, address: e.target.value }))} />
                <div className="form-row">
                  <Input label="City" name="city" value={editModal.city || ''} onChange={(e) => setEditModal((p) => ({ ...p, city: e.target.value }))} />
                  <Input label="State" name="state" value={editModal.state || ''} onChange={(e) => setEditModal((p) => ({ ...p, state: e.target.value }))} />
                  <Input label="PIN Code" name="pinCode" value={editModal.pinCode || ''} onChange={(e) => setEditModal((p) => ({ ...p, pinCode: e.target.value }))} />
                </div>

                {!isAdd && (
                  <>
                    <h3 className="form-section-title">Account</h3>
                    <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                  </>
                )}

                <div className="user-form-actions">
                  <Button onClick={isAdd ? handleSave : handleUpdate} disabled={saving}>{saving ? 'Saving...' : (isAdd ? 'Register Reception Staff' : 'Save Changes')}</Button>
                  <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Reception Staff Profile" size="lg">
        {viewModal && (
          <div className="view-profile">
            <div className="profile-header">
              {viewModal.image ? <img src={viewModal.image} alt="" className="profile-img" /> : <div className="profile-img-placeholder">🧑‍💼</div>}
              <div>
                <h2>{viewModal.name}</h2>
                <p className="text-muted">{viewModal.receptionId}</p>
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
                <h4>Work Details</h4>
                <div className="detail-row"><span>Employee No.</span><strong>{viewModal.employeeNo || '—'}</strong></div>
                <div className="detail-row"><span>Shift</span><strong>{viewModal.shift || '—'}</strong></div>
                <div className="detail-row"><span>Department</span><strong>{viewModal.department || '—'}</strong></div>
                <div className="detail-row"><span>Joining Date</span><strong>{viewModal.joiningDate ? new Date(viewModal.joiningDate).toLocaleDateString() : '—'}</strong></div>
                <div className="detail-row"><span>Desk No.</span><strong>{viewModal.deskNo || '—'}</strong></div>
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
        title="Delete Reception Staff?"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This will also remove their login access.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ReceptionStaffPage;
