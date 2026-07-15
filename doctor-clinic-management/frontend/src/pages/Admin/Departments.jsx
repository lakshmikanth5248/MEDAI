import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { departments, doctors } from '../../utils/mockData';
import './Departments.css';
import { useTranslation } from '../../i18n/LanguageContext';

const DepartmentsPage = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const filtered = departments.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const doctorCounts = doctors.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    { key: 'name', label: t('pg.admin.departments.colDepartment') },
    { key: 'icon', label: t('pg.admin.departments.colIcon'), render: (v) => <span style={{ fontSize: 20 }}>{v}</span> },
    { key: 'description', label: t('pg.admin.departments.colDescription') },
    { key: 'doctorCount', label: t('pg.admin.departments.colDoctors'), render: (_, row) => doctorCounts[row.name] || 0 },
    {
      key: 'status',
      label: t('pg.admin.departments.colStatus'),
      render: (v) => <span className={`status-badge ${v === 'Active' ? 'status-active' : 'status-inactive'}`}>{v === 'Active' ? t('common.active') : t('common.inactive')}</span>,
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
        <h1>{t('pg.admin.departments.title')}</h1>
        <div className="dept-header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>{t('pg.admin.departments.viewGrid')}</button>
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>{t('pg.admin.departments.viewTable')}</button>
          </div>
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.admin.departments.searchPlaceholder')} />
          <Button icon="➕" onClick={() => { setEditModal({ name: '', description: '', icon: '🏥', color: '#38BDF8', status: 'Active' }); setIsAdd(true); }}>{t('pg.admin.departments.addDepartment')}</Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="admin-dept-grid">
          <div className="dept-add-card" onClick={() => { setEditModal({ name: '', description: '', icon: '🏥', color: '#38BDF8', status: 'Active' }); setIsAdd(true); }}>
            <div className="dept-add-icon">+</div>
            <p>{t('pg.admin.departments.addNewDepartment')}</p>
          </div>
          {filtered.map((dept) => (
            <div key={dept.id} className="admin-dept-card" style={{ '--dept-color': dept.color }}>
              <div className="admin-dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p className="admin-dept-desc">{dept.description}</p>
              <div className="admin-dept-footer">
                <span>{doctorCounts[dept.name] || 0} {t('pg.admin.departments.doctors')}</span>
                <span className={`status-badge ${dept.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{dept.status === 'Active' ? t('common.active') : t('common.inactive')}</span>
              </div>
              <div className="admin-dept-actions">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditModal(dept); setIsAdd(false); }}>{t('common.edit')}</Button>
                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); }}>{t('common.delete')}</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <DataTable columns={columns} data={filtered} emptyMessage={t('pg.admin.departments.emptyDepartments')} />
        </Card>
      )}

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('pg.admin.departments.addDepartment') : t('pg.admin.departments.editDepartment')}>
        {editModal && (
          <div className="dept-form">
            <Input label={t('pg.admin.departments.departmentName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Input label={t('pg.admin.departments.description')} name="description" value={editModal.description} onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))} />
            <Input label={t('pg.admin.departments.icon')} name="icon" value={editModal.icon} onChange={(e) => setEditModal((p) => ({ ...p, icon: e.target.value }))} />
            <Input label={t('pg.admin.departments.color')} name="color" type="color" value={editModal.color} onChange={(e) => setEditModal((p) => ({ ...p, color: e.target.value }))} />
            <Select label={t('pg.admin.departments.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: t('common.active') }, { value: 'Inactive', label: t('common.inactive') }]} />
            <div className="dept-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? t('pg.admin.departments.addDepartment') : t('pg.admin.departments.saveChanges')}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
