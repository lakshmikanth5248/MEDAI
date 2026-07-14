import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { departments } from '../../utils/mockData';
import './Departments.css';

const DepartmentsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const filtered = departments.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'name', label: 'Department' },
    { key: 'icon', label: 'Icon', render: (v) => <span style={{ fontSize: 20 }}>{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'doctorCount', label: 'Doctors' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`status-badge ${v === 'Active' ? 'status-active' : 'status-inactive'}`}>{v}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page admin-depts-page">
      <div className="page-header">
        <h1>Departments</h1>
        <div className="dept-header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
          </div>
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
          <Button icon="➕" onClick={() => { setEditModal({ name: '', description: '', icon: '🏥', color: '#38BDF8', status: 'Active' }); setIsAdd(true); }}>Add Department</Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="admin-dept-grid">
          <div className="dept-add-card" onClick={() => { setEditModal({ name: '', description: '', icon: '🏥', color: '#38BDF8', status: 'Active' }); setIsAdd(true); }}>
            <div className="dept-add-icon">+</div>
            <p>Add New Department</p>
          </div>
          {filtered.map((dept) => (
            <div key={dept.id} className="admin-dept-card" style={{ '--dept-color': dept.color }}>
              <div className="admin-dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p className="admin-dept-desc">{dept.description}</p>
              <div className="admin-dept-footer">
                <span>{dept.doctorCount} Doctors</span>
                <span className={`status-badge ${dept.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{dept.status}</span>
              </div>
              <div className="admin-dept-actions">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditModal(dept); setIsAdd(false); }}>Edit</Button>
                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <DataTable columns={columns} data={filtered} emptyMessage="No departments found" />
        </Card>
      )}

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? 'Add Department' : 'Edit Department'}>
        {editModal && (
          <div className="dept-form">
            <Input label="Department Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Description" name="description" value={editModal.description} onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))} />
            <Input label="Icon (emoji)" name="icon" value={editModal.icon} onChange={(e) => setEditModal((p) => ({ ...p, icon: e.target.value }))} />
            <Input label="Color" name="color" type="color" value={editModal.color} onChange={(e) => setEditModal((p) => ({ ...p, color: e.target.value }))} />
            <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="dept-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? 'Add Department' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
