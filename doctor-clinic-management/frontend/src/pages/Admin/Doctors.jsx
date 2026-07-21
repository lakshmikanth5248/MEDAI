import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import './Doctors.css';
import { useTranslation } from '../../i18n/LanguageContext';

const EMPTY_FORM = {
  name: '', specialization: '', departmentId: '', experience: 0, fee: 0,
  qualification: '', email: '', phone: '', status: 'active',
};

const DoctorsPage = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

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

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || (d.specialization || '').toLowerCase().includes(q);
    const matchDept = !deptFilter || d.department === deptFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const columns = [
    { key: 'doctorId', label: t('doctors.colDoctorId') },
    { key: 'name', label: t('doctors.colName') },
    { key: 'specialization', label: t('doctors.colSpecialization') },
    { key: 'department', label: t('doctors.colDepartment') },
    { key: 'experience', label: t('doctors.colExperience'), render: (v) => `${v ?? 0} yrs` },
    { key: 'fee', label: t('doctors.colFee'), render: (v) => `₹${v ?? 0}` },
    { key: 'email', label: t('doctors.colEmail'), render: (v) => v || '—' },
    {
      key: 'status',
      label: t('doctors.colStatus'),
      render: (v) => <span className={`status-badge ${v === 'active' ? 'status-active' : 'status-inactive'}`}>{v === 'active' ? t('common.active') : t('common.inactive')}</span>,
    },
    {
      key: 'actions',
      label: t('doctors.colActions'),
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title={t('common.edit')} onClick={(e) => { e.stopPropagation(); setEditModal({ ...row, departmentId: row.departmentId || '' }); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title={t('common.delete')} onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>🗑️</button>
        </div>
      ),
    },
  ];

  const handleDelete = async (row) => {
    try {
      await clinicalApi.deleteDoctor(row.id);
      setDoctors((prev) => prev.filter((d) => d.id !== row.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete doctor'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, specialization: editModal.specialization,
        departmentId: Number(editModal.departmentId) || editModal.departmentId,
        experience: Number(editModal.experience), fee: Number(editModal.fee),
        qualification: editModal.qualification, email: editModal.email,
        phone: editModal.phone, status: editModal.status,
      };
      if (isAdd) {
        const created = await clinicalApi.createDoctor(payload);
        setDoctors((prev) => [...prev, created]);
      } else {
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

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>{t('doctors.title')}</h1>
        <Button icon="➕" onClick={() => { setEditModal({ ...EMPTY_FORM }); setIsAdd(true); }}>{t('doctors.addDoctor')}</Button>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="doctors-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('doctors.searchPlaceholder')} />
        <Select name="dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} placeholder={t('doctors.allDepartments')} options={departments.map((d) => ({ value: d.name, label: d.name }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder={t('doctors.allStatus')} options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} emptyMessage={t('doctors.emptyDoctors')} />}
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('doctors.addDoctor') : t('doctors.editDoctor')} size="lg">
        {editModal && (
          <div className="doctor-form">
            <Input label={t('doctors.fullName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <div className="form-row">
              <Input label={t('doctors.specialization')} name="specialization" value={editModal.specialization} onChange={(e) => setEditModal((p) => ({ ...p, specialization: e.target.value }))} />
              <Select label={t('doctors.department')} name="departmentId" value={editModal.departmentId} onChange={(e) => setEditModal((p) => ({ ...p, departmentId: e.target.value }))} placeholder={t('doctors.select')} options={departments.map((d) => ({ value: d.id, label: d.name }))} />
            </div>
            <div className="form-row">
              <Input label={t('doctors.experience')} name="experience" type="number" value={editModal.experience} onChange={(e) => setEditModal((p) => ({ ...p, experience: Number(e.target.value) }))} />
              <Input label={t('doctors.fee')} name="fee" type="number" value={editModal.fee} onChange={(e) => setEditModal((p) => ({ ...p, fee: Number(e.target.value) }))} />
            </div>
            <Input label={t('doctors.qualification')} name="qualification" value={editModal.qualification} onChange={(e) => setEditModal((p) => ({ ...p, qualification: e.target.value }))} />
            <div className="form-row">
              <Input label={t('doctors.email')} name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
              <Input label={t('doctors.phone')} name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <Select label={t('doctors.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
            <div className="user-form-actions">
              <Button onClick={handleSave} disabled={saving}>{saving ? t('common.saving') || 'Saving...' : (isAdd ? t('doctors.addDoctor') : t('doctors.saveChanges'))}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }} disabled={saving}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorsPage;
