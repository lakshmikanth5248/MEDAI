import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { users as initialUsers } from '../../utils/mockData';
import './Users.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'reception', label: 'Receptionist' },
  { value: 'medical_store', label: 'Store Manager' },
];

const nextUserId = (list) => {
  const max = list
    .map((u) => parseInt(String(u.id).replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 1000);
  return `USR-${max + 1}`;
};

const UsersPage = () => {
  const [userList, setUserList] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const filtered = userList.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (u.status === 'active' ? 'Active' : 'Inactive') === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = (id) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleSave = () => {
    if (isAdd) {
      const newUser = {
        id: nextUserId(userList),
        name: editModal.name,
        email: editModal.email,
        role: editModal.role,
        status: editModal.status === 'Active' ? 'active' : 'inactive',
        lastLogin: 'Never',
      };
      setUserList((prev) => [newUser, ...prev]);
    } else {
      setUserList((prev) =>
        prev.map((u) =>
          u.id === editModal.id
            ? { ...u, name: editModal.name, email: editModal.email, role: editModal.role, status: editModal.status === 'Active' ? 'active' : 'inactive' }
            : u
        )
      );
    }
    setEditModal(null);
    setIsAdd(false);
  };

  const openAdd = () => {
    setEditModal({ name: '', email: '', password: '', role: 'reception', status: 'Active' });
    setIsAdd(true);
  };

  const openEdit = (row) => {
    setEditModal({ ...row, status: row.status === 'active' ? 'Active' : 'Inactive' });
    setIsAdd(false);
  };

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => <span className="role-badge">{v}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <label className="toggle-switch">
          <input type="checkbox" checked={v === 'active'} onChange={() => toggleStatus(row.id)} />
          <span className="toggle-slider"></span>
          <span className="toggle-label">{v === 'active' ? 'Active' : 'Inactive'}</span>
        </label>
      ),
    },
    { key: 'lastLogin', label: 'Last Login' },
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

  return (
    <div className="page users-page">
      <div className="page-header">
        <h1>Users</h1>
        <Button icon="➕" onClick={openAdd}>Add User</Button>
      </div>

      <div className="users-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..." />
        <Select name="role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} placeholder="All Roles" options={[...new Set(userList.map((u) => u.role))].map((r) => ({ value: r, label: r }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? 'Add User' : 'Edit User'}>
        {editModal && (
          <div className="user-form">
            <Input label="Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
            {isAdd && <Input label="Password" name="password" type="password" value={editModal.password} onChange={(e) => setEditModal((p) => ({ ...p, password: e.target.value }))} />}
            <Select label="Role" name="role" value={editModal.role} onChange={(e) => setEditModal((p) => ({ ...p, role: e.target.value }))} options={ROLE_OPTIONS} />
            <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="user-form-actions">
              <Button onClick={handleSave}>{isAdd ? 'Add User' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;
