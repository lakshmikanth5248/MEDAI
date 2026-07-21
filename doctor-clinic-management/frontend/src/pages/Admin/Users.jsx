import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Alert } from '../../components/Alerts/Alerts';
import { PageLoader } from '../../components/Loader/Loader';
import * as authApi from '../../services/api/auth';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import './Users.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'reception', label: 'Receptionist' },
  { value: 'medical_store', label: 'Store Manager' },
];

const UsersPage = () => {
  const [userList, setUserList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCreds, setSavedCreds] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, depts] = await Promise.all([authApi.getUsers(), clinicalApi.getDepartments()]);
      setUserList(users || []);
      setDepartments(depts || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = userList.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).toLowerCase().includes(q) || String(u.uid || '').toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = async (row) => {
    setActionError(null);
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await authApi.updateUserStatus(row.id, newStatus);
      setUserList((prev) => prev.map((u) => (u.id === row.id ? { ...u, ...updated } : u)));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to update user status'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionError(null);
    try {
      await authApi.deleteUser(id);
      setUserList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete user'));
    }
  };

  const handleSave = async () => {
    setActionError(null);
    if (!editModal.name || !editModal.email || (isAdd && editModal.role === 'doctor' && !editModal.departmentId)) {
      setActionError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (isAdd) {
        const payload = {
          role: editModal.role,
          name: editModal.name,
          email: editModal.email,
          phone: editModal.phone,
        };
        if (editModal.role === 'doctor') payload.departmentId = Number(editModal.departmentId);
        const res = await authApi.createStaff(payload);
        setUserList((prev) => [res.user, ...prev]);
        setSavedCreds({ id: res.user?.uid, password: res.defaultPassword });
        return;
      } else {
        const updated = await authApi.updateUser(editModal.id, {
          name: editModal.name,
          email: editModal.email,
        });
        setUserList((prev) => prev.map((u) => (u.id === editModal.id ? { ...u, ...updated } : u)));
      }
      setEditModal(null);
      setIsAdd(false);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setEditModal(null);
    setIsAdd(false);
    setSavedCreds(null);
    setActionError(null);
  };

  const openAdd = () => {
    setEditModal({ name: '', email: '', password: '', phone: '', role: 'reception', departmentId: '' });
    setSavedCreds(null);
    setIsAdd(true);
  };

  const openEdit = (row) => {
    setEditModal({ ...row });
    setIsAdd(false);
  };

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'uid', label: 'Login ID', render: (v) => v || '—' },
    { key: 'role', label: 'Role', render: (v, row) => <span className="role-badge">{row.roleLabel || v}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <label className="toggle-switch">
          <input type="checkbox" checked={v === 'active'} onChange={() => toggleStatus(row)} />
          <span className="toggle-slider"></span>
          <span className="toggle-label">{v === 'active' ? 'Active' : 'Inactive'}</span>
        </label>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>✏️</button>
          <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>🗑️</button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="page users-page">
      <div className="page-header">
        <h1>Users</h1>
        <Button icon="➕" onClick={openAdd}>Add User</Button>
      </div>

      {error && <Alert type="error" message={error} dismissible={false} />}
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}

      <div className="users-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..." />
        <Select name="role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} placeholder="All Roles" options={[...new Set(userList.map((u) => u.role))].map((r) => ({ value: r, label: r }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />
      </Card>

      <Modal isOpen={!!editModal} onClose={closeModal} title={isAdd ? 'Add User' : 'Edit User'}>
        {editModal && (
          <div className="user-form">
            {savedCreds ? (
              <div className="staff-creds">
                <div className="staff-saved-msg">User created</div>
                <div className="cred-row"><span>Login ID</span><strong>{savedCreds.id}</strong></div>
                <div className="cred-row"><span>Password</span><strong>{savedCreds.password}</strong></div>
                <p className="cred-note">Share these credentials with the user.</p>
                <div className="user-form-actions">
                  <Button onClick={closeModal}>Done</Button>
                </div>
              </div>
            ) : (
              <>
                <Input label="Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
                <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
                <Input label="Phone" name="phone" value={editModal.phone || ''} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
                {isAdd && (
                  <>
                    <Input label="Password" name="password" type="password" value={editModal.password || ''} onChange={(e) => setEditModal((p) => ({ ...p, password: e.target.value }))} required />
                    <Select label="Role" name="role" value={editModal.role} onChange={(e) => setEditModal((p) => ({ ...p, role: e.target.value }))} options={ROLE_OPTIONS} />
                  </>
                )}
                {isAdd && editModal.role === 'doctor' && (
                  <Select
                    label="Department"
                    name="departmentId"
                    value={editModal.departmentId || ''}
                    onChange={(e) => setEditModal((p) => ({ ...p, departmentId: e.target.value }))}
                    placeholder="Select department"
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    required
                  />
                )}
                <div className="user-form-actions">
                  <Button onClick={handleSave} disabled={saving}>{saving ? '...' : (isAdd ? 'Add User' : 'Save Changes')}</Button>
                  <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;
