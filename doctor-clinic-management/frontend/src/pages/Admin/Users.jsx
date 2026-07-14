import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { users } from '../../utils/mockData';
import './Users.css';

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => <span className="role-badge">{v}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <label className="toggle-switch">
          <input type="checkbox" checked={v === 'Active'} readOnly />
          <span className="toggle-slider"></span>
          <span className="toggle-label">{v}</span>
        </label>
      ),
    },
    { key: 'lastLogin', label: 'Last Login' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); }}>🗑️</button>
          <button className="icon-btn" title="Suspend" onClick={(e) => { e.stopPropagation(); }}>🚫</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page users-page">
      <div className="page-header">
        <h1>Users</h1>
        <Button icon="➕" onClick={() => { setEditModal({ name: '', email: '', password: '', role: 'Staff', status: 'Active' }); setIsAdd(true); }}>Add User</Button>
      </div>

      <div className="users-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..." />
        <Select name="role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} placeholder="All Roles" options={[...new Set(users.map((u) => u.role))].map((r) => ({ value: r, label: r }))} />
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
            <Select label="Role" name="role" value={editModal.role} onChange={(e) => setEditModal((p) => ({ ...p, role: e.target.value }))} options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Doctor', label: 'Doctor' },
              { value: 'Receptionist', label: 'Receptionist' },
              { value: 'Store Manager', label: 'Store Manager' },
            ]} />
            <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="user-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? 'Add User' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;
