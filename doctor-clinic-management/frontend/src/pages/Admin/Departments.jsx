import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import './Departments.css';
import { useTranslation } from '../../i18n/LanguageContext';

const EMPTY_FORM = { name: '', description: '', icon: '🏥', color: '#38BDF8', status: 'active' };

const DepartmentsPage = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dept, docs] = await Promise.all([clinicalApi.getDepartments(), clinicalApi.getDoctors()]);
      setDepartments(dept);
      setDoctors(docs);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load departments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = departments.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const doctorCounts = doctors.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});

  const handleDelete = async (dept) => {
    try {
      await clinicalApi.deleteDepartment(dept.id);
      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete department'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, description: editModal.description,
        icon: editModal.icon, color: editModal.color, status: editModal.status,
      };
      if (isAdd) {
        const created = await clinicalApi.createDepartment(payload);
        setDepartments((prev) => [...prev, created]);
      } else {
        const updated = await clinicalApi.updateDepartment(editModal.id, payload);
        setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      }
      setEditModal(null);
      setIsAdd(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save department'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: t('departments.colDepartment') },
    { key: 'icon', label: t('departments.colIcon'), render: (v) => <span style={{ fontSize: 20 }}>{v}</span> },
    { key: 'description', label: t('departments.colDescription') },
    { key: 'doctorCount', label: t('departments.colDoctors'), render: (_, row) => doctorCounts[row.name] || 0 },
    {
      key: 'status',
      label: t('departments.colStatus'),
      render: (v) => <span className={`status-badge ${v === 'active' ? 'status-active' : 'status-inactive'}`}>{v === 'active' ? t('common.active') : t('common.inactive')}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page admin-depts-page">
      <div className="page-header">
        <h1>{t('departments.title')}</h1>
        <div className="dept-header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>{t('departments.viewGrid')}</button>
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>{t('departments.viewTable')}</button>
          </div>
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('departments.searchPlaceholder')} />
          <Button icon="➕" onClick={() => { setEditModal({ ...EMPTY_FORM }); setIsAdd(true); }}>{t('departments.addDepartment')}</Button>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}

      {loading ? <Loader /> : viewMode === 'grid' ? (
        <div className="admin-dept-grid">
          <div className="dept-add-card" onClick={() => { setEditModal({ ...EMPTY_FORM }); setIsAdd(true); }}>
            <div className="dept-add-icon">+</div>
            <p>{t('departments.addNewDepartment')}</p>
          </div>
          {filtered.map((dept) => (
            <div key={dept.id} className="admin-dept-card" style={{ '--dept-color': dept.color }}>
              <div className="admin-dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p className="admin-dept-desc">{dept.description}</p>
              <div className="admin-dept-footer">
                <span>{doctorCounts[dept.name] || 0} {t('departments.doctors')}</span>
                <span className={`status-badge ${dept.status === 'active' ? 'status-active' : 'status-inactive'}`}>{dept.status === 'active' ? t('common.active') : t('common.inactive')}</span>
              </div>
              <div className="admin-dept-actions">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditModal(dept); setIsAdd(false); }}>{t('common.edit')}</Button>
                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(dept); }}>{t('common.delete')}</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <DataTable columns={columns} data={filtered} emptyMessage={t('departments.emptyDepartments')} />
        </Card>
      )}

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('departments.addDepartment') : t('departments.editDepartment')}>
        {editModal && (
          <div className="dept-form">
            <Input label={t('departments.departmentName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Input label={t('departments.description')} name="description" value={editModal.description} onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))} />
            <Input label={t('departments.icon')} name="icon" value={editModal.icon} onChange={(e) => setEditModal((p) => ({ ...p, icon: e.target.value }))} />
            <Input label={t('departments.color')} name="color" type="color" value={editModal.color} onChange={(e) => setEditModal((p) => ({ ...p, color: e.target.value }))} />
            <Select label={t('departments.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
            <div className="dept-form-actions">
              <Button onClick={handleSave} disabled={saving}>{saving ? '...' : (isAdd ? t('departments.addDepartment') : t('departments.saveChanges'))}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }} disabled={saving}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
