import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, TextArea } from '../../components/Forms';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as pharmacyApi from '../../services/api/pharmacy';
import * as authApi from '../../services/api/auth';
import { getErrorMessage } from '../../services/apiError';
import './Doctors.css';

const EMPTY_FORM = {
  name: '', managerName: '', email: '', password: '', confirmPassword: '',
  phone: '', floorNo: '', storeNo: '', address: '', city: '', state: '', pinCode: '',
  licenseNo: '', gstNo: '', status: 'active',
};

const MedicalStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [floorFilter, setFloorFilter] = useState('');
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
      const data = await pharmacyApi.getStores();
      setStores(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load medical stores'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const validateForm = (data, isAddForm) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Store Name is required';
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

  const filtered = stores.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (searchBy === 'storeId') return (s.storeCode || '').toLowerCase().includes(q);
    if (searchBy === 'email') return (s.email || '').toLowerCase().includes(q);
    if (searchBy === 'managerName') return (s.managerName || '').toLowerCase().includes(q);
    return (s.name || '').toLowerCase().includes(q);
  }).filter((s) => !floorFilter || (s.floorNo || '') === floorFilter)
    .filter((s) => !statusFilter || s.status === statusFilter);

  const columns = [
    { key: 'storeCode', label: 'Store ID' },
    { key: 'name', label: 'Store Name' },
    { key: 'managerName', label: 'Manager Name', render: (v) => v || '—' },
    { key: 'floorNo', label: 'Floor', render: (v) => v || '—' },
    { key: 'storeNo', label: 'Store No.', render: (v) => v || '—' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'licenseNo', label: 'License No.', render: (v) => v || '—' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="View" onClick={(e) => { e.stopPropagation(); setViewModal(row); }}>👁️</button>
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditModal({ ...row }); setIsAdd(false); setSavedCreds(null); setFormErrors({}); }}>✏️</button>
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
      await pharmacyApi.updateStore(row.id, { status: newStatus });
      if (row.userId) {
        try { await authApi.updateUserStatus(row.userId, newStatus); } catch { }
      }
      setStores((prev) => prev.map((s) => s.id === row.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await pharmacyApi.deleteStore(deleteConfirm.id);
      if (deleteConfirm.userId) {
        try { await authApi.deleteUser(deleteConfirm.userId); } catch { }
      }
      setStores((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete store'));
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwdModal?.userId) { setError('No user associated with this store'); return; }
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
        role: 'medical_store',
        name: editModal.name,
        storeName: editModal.name,
        managerName: editModal.managerName,
        email: editModal.email,
        password: editModal.password,
        phone: editModal.phone,
        address: editModal.address,
        city: editModal.city,
        state: editModal.state,
        pinCode: editModal.pinCode,
        floorNo: editModal.floorNo,
        storeNo: editModal.storeNo,
        licenseNo: editModal.licenseNo,
        gstNo: editModal.gstNo,
      };
      const res = await authApi.createStaff(payload);
      setSavedCreds({ id: res.user?.uid, password: editModal.password || res.defaultPassword });
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save medical store'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, managerName: editModal.managerName,
        email: editModal.email, phone: editModal.phone,
        address: editModal.address, city: editModal.city,
        state: editModal.state, pinCode: editModal.pinCode,
        floorNo: editModal.floorNo, storeNo: editModal.storeNo,
        licenseNo: editModal.licenseNo, gstNo: editModal.gstNo,
        status: editModal.status,
      };
      const updated = await pharmacyApi.updateStore(editModal.id, payload);
      setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditModal(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update medical store'));
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

  const uniqueFloors = [...new Set(stores.map((s) => s.floorNo).filter(Boolean))];

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>Medical Store Management</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctors-filters">
        <div className="filter-group">
          <Select name="searchBy" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}
            options={[
              { value: 'name', label: 'Store Name' },
              { value: 'storeId', label: 'Store ID' },
              { value: 'managerName', label: 'Manager Name' },
              { value: 'email', label: 'Email' },
            ]} />
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search by ${searchBy}...`} />
        </div>
        <Select name="floor" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} placeholder="All Floors" options={uniqueFloors.map((f) => ({ value: f, label: `Floor ${f}` }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} emptyMessage="No medical stores found" />}
      </Card>

      <Modal isOpen={!!editModal} onClose={closeModal} title={isAdd ? 'Register Medical Store' : 'Edit Medical Store'} size="lg">
        {editModal && (
          <div className="doctor-form">
            {savedCreds ? (
              <div className="staff-creds">
                <div className="staff-saved-msg">Medical Store registered successfully</div>
                <div className="cred-row"><span>Store ID</span><strong>{savedCreds.id}</strong></div>
                <div className="cred-row"><span>Email</span><strong>{editModal.email}</strong></div>
                <div className="cred-row"><span>Password</span><strong>{savedCreds.password}</strong></div>
                <p className="cred-note">Share these credentials with the store staff.</p>
                <div className="staff-form-actions">
                  <Button onClick={closeModal}>Done</Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="form-section-title">Store Details</h3>
                <div className="form-row">
                  <Input label="Store Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} error={formErrors.name} required />
                  <Input label="Manager Name" name="managerName" value={editModal.managerName || ''} onChange={(e) => setEditModal((p) => ({ ...p, managerName: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} error={formErrors.email} required />
                  {isAdd && (
                    <Input label="Password" name="password" type="password" value={editModal.password || ''} onChange={(e) => setEditModal((p) => ({ ...p, password: e.target.value }))} error={formErrors.password} required />
                  )}
                </div>
                {isAdd && (
                  <Input label="Confirm Password" name="confirmPassword" type="password" value={editModal.confirmPassword || ''} onChange={(e) => setEditModal((p) => ({ ...p, confirmPassword: e.target.value }))} error={formErrors.confirmPassword} required />
                )}
                <Input label="Phone Number" name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} error={formErrors.phone} />

                <h3 className="form-section-title">Store Information</h3>
                <div className="form-row">
                  <Input label="Floor Number" name="floorNo" value={editModal.floorNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, floorNo: e.target.value }))} />
                  <Input label="Store Number" name="storeNo" value={editModal.storeNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, storeNo: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Input label="License Number" name="licenseNo" value={editModal.licenseNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, licenseNo: e.target.value }))} />
                  <Input label="GST Number (Optional)" name="gstNo" value={editModal.gstNo || ''} onChange={(e) => setEditModal((p) => ({ ...p, gstNo: e.target.value }))} />
                </div>

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
                  <Button onClick={isAdd ? handleSave : handleUpdate} disabled={saving}>{saving ? 'Saving...' : (isAdd ? 'Register Medical Store' : 'Save Changes')}</Button>
                  <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Medical Store Profile" size="lg">
        {viewModal && (
          <div className="view-profile">
            <div className="profile-header">
              <div className="profile-img-placeholder">💊</div>
              <div>
                <h2>{viewModal.name}</h2>
                <p className="text-muted">{viewModal.storeCode}</p>
              </div>
              <span className={`status-badge ${viewModal.status === 'active' ? 'status-success' : 'status-danger'}`}>{viewModal.status === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="profile-details-grid">
              <div className="detail-group">
                <h4>Store Details</h4>
                <div className="detail-row"><span>Manager Name</span><strong>{viewModal.managerName || '—'}</strong></div>
                <div className="detail-row"><span>Email</span><strong>{viewModal.email || '—'}</strong></div>
                <div className="detail-row"><span>Phone</span><strong>{viewModal.phone || '—'}</strong></div>
                <div className="detail-row"><span>License No.</span><strong>{viewModal.licenseNo || '—'}</strong></div>
                <div className="detail-row"><span>GST No.</span><strong>{viewModal.gstNo || '—'}</strong></div>
              </div>
              <div className="detail-group">
                <h4>Location</h4>
                <div className="detail-row"><span>Floor</span><strong>{viewModal.floorNo || '—'}</strong></div>
                <div className="detail-row"><span>Store No.</span><strong>{viewModal.storeNo || '—'}</strong></div>
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
        title="Delete Medical Store?"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This will also remove their login access.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default MedicalStoresPage;
