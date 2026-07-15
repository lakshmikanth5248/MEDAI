import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { doctors, departments } from '../../utils/mockData';
import './Doctors.css';
import { useTranslation } from '../../i18n/LanguageContext';

const DoctorsPage = () => {
  const { t } = useTranslation();
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
    { key: 'doctorId', label: t('pg.admin.doctors.colDoctorId') },
    { key: 'name', label: t('pg.admin.doctors.colName') },
    { key: 'specialization', label: t('pg.admin.doctors.colSpecialization') },
    { key: 'department', label: t('pg.admin.doctors.colDepartment') },
    { key: 'experience', label: t('pg.admin.doctors.colExperience'), render: (v) => `${v} yrs` },
    { key: 'fee', label: t('pg.admin.doctors.colFee'), render: (v) => `₹${v}` },
    {
      key: 'status',
      label: t('pg.admin.doctors.colStatus'),
      render: (v) => <span className={`status-badge ${v === 'Active' ? 'status-active' : 'status-inactive'}`}>{v === 'Active' ? t('common.active') : t('common.inactive')}</span>,
    },
    {
      key: 'actions',
      label: t('pg.admin.doctors.colActions'),
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title={t('common.edit')} onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title={t('pg.admin.doctors.schedule')}>📅</button>
          <button className="icon-btn" title={t('common.delete')}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page admin-doctors-page">
      <div className="page-header">
        <h1>{t('pg.admin.doctors.title')}</h1>
        <Button icon="➕" onClick={() => { setEditModal({ name: '', specialization: '', department: '', experience: 0, fee: 0, qualification: '', email: '', phone: '', availability: [], status: 'Active' }); setIsAdd(true); }}>{t('pg.admin.doctors.addDoctor')}</Button>
      </div>

      <div className="doctors-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.admin.doctors.searchPlaceholder')} />
        <Select name="dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} placeholder={t('pg.admin.doctors.allDepartments')} options={departments.map((d) => ({ value: d.name, label: d.name }))} />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder={t('pg.admin.doctors.allStatus')} options={[{ value: 'Active', label: t('common.active') }, { value: 'Inactive', label: t('common.inactive') }]} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage={t('pg.admin.doctors.emptyDoctors')} />
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('pg.admin.doctors.addDoctor') : t('pg.admin.doctors.editDoctor')} size="lg">
        {editModal && (
          <div className="doctor-form">
            <Input label={t('pg.admin.doctors.fullName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <div className="form-row">
              <Input label={t('pg.admin.doctors.specialization')} name="specialization" value={editModal.specialization} onChange={(e) => setEditModal((p) => ({ ...p, specialization: e.target.value }))} />
              <Select label={t('pg.admin.doctors.department')} name="department" value={editModal.department} onChange={(e) => setEditModal((p) => ({ ...p, department: e.target.value }))} placeholder={t('pg.admin.doctors.select')} options={departments.map((d) => ({ value: d.name, label: d.name }))} />
            </div>
            <div className="form-row">
              <Input label={t('pg.admin.doctors.experience')} name="experience" type="number" value={editModal.experience} onChange={(e) => setEditModal((p) => ({ ...p, experience: Number(e.target.value) }))} />
              <Input label={t('pg.admin.doctors.fee')} name="fee" type="number" value={editModal.fee} onChange={(e) => setEditModal((p) => ({ ...p, fee: Number(e.target.value) }))} />
            </div>
            <Input label={t('pg.admin.doctors.qualification')} name="qualification" value={editModal.qualification} onChange={(e) => setEditModal((p) => ({ ...p, qualification: e.target.value }))} />
            <div className="form-row">
              <Input label={t('pg.admin.doctors.email')} name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
              <Input label={t('pg.admin.doctors.phone')} name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <Select label={t('pg.admin.doctors.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: t('common.active') }, { value: 'Inactive', label: t('common.inactive') }]} />
            <div className="user-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? t('pg.admin.doctors.addDoctor') : t('pg.admin.doctors.saveChanges')}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorsPage;
