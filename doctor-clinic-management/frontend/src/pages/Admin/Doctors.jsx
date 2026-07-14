import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { doctors, departments } from '../../utils/mockData';
import './Doctors.css';

const DoctorsPage = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q);
    const matchDept = !deptFilter || d.department === deptFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const columns = [
    { key: 'id', label: 'Doctor ID' },
    { key: 'name', label: 'Name' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'department', label: 'Department' },
    { key: 'experience', label: 'Experience', render: (v) => `${v} yrs` },
    { key: 'fee', label: 'Fee', render: (v) => `₹${v}` },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`status-badge ${v === 'Active' ? 'status-active' : 'status-inactive'}`}>{v}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title="Schedule">📅</button>
          <button className="icon-btn" title="Delete">🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>Doctors</h1>
        <Button icon="➕" onClick={() => { setEditModal({ name: '', specialization: '', department: '', experience: 0, fee: 0, qualification: '', email: '', phone: '', availability: [], status: 'Active' }); setIsAdd(true); }}>Add Doctor</Button>
      </div>

      <div className="doctors-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization..." />
        <Select name="dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} placeholder="All Departments" options={departments.map((d) => ({ value: d.name, label: d.name }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No doctors found" />
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? 'Add Doctor' : 'Edit Doctor'} size="lg">
        {editModal && (
          <div className="doctor-form">
            <Input label="Full Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <div className="form-row">
              <Input label="Specialization" name="specialization" value={editModal.specialization} onChange={(e) => setEditModal((p) => ({ ...p, specialization: e.target.value }))} />
              <Select label="Department" name="department" value={editModal.department} onChange={(e) => setEditModal((p) => ({ ...p, department: e.target.value }))} placeholder="Select" options={departments.map((d) => ({ value: d.name, label: d.name }))} />
            </div>
            <div className="form-row">
              <Input label="Experience (years)" name="experience" type="number" value={editModal.experience} onChange={(e) => setEditModal((p) => ({ ...p, experience: Number(e.target.value) }))} />
              <Input label="Consultation Fee (₹)" name="fee" type="number" value={editModal.fee} onChange={(e) => setEditModal((p) => ({ ...p, fee: Number(e.target.value) }))} />
            </div>
            <Input label="Qualification" name="qualification" value={editModal.qualification} onChange={(e) => setEditModal((p) => ({ ...p, qualification: e.target.value }))} />
            <div className="form-row">
              <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
              <Input label="Phone" name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="user-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? 'Add Doctor' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorsPage;
