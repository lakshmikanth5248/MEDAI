import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { clinics } from '../../utils/mockData';
import './Clinics.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Clinics = () => {
  const { t } = useTranslation();
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  return (
    <div className="page clinics-page">
      <div className="page-header">
        <h1>{t('pg.admin.clinics.title')}</h1>
        <Button icon="➕" onClick={() => { setEditModal({ name: '', address: '', phone: '', email: '', workingHours: '', status: 'Active' }); setIsAdd(true); }}>{t('pg.admin.clinics.addClinic')}</Button>
      </div>

      <div className="clinics-grid">
        {clinics.map((clinic) => (
          <div key={clinic.id} className="clinic-card">
            <div className="clinic-card-header">
              <div className="clinic-icon">🏥</div>
              <div>
                <h3>{clinic.name}</h3>
                <span className={`status-badge ${clinic.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{clinic.status === 'Active' ? t('common.active') : t('common.inactive')}</span>
              </div>
            </div>
            <div className="clinic-details">
              <div className="clinic-detail"><label>{t('pg.admin.clinics.address')}</label><span>{clinic.address}</span></div>
              <div className="clinic-detail"><label>{t('pg.admin.clinics.phone')}</label><span>{clinic.phone}</span></div>
              <div className="clinic-detail"><label>{t('pg.admin.clinics.email')}</label><span>{clinic.email}</span></div>
              <div className="clinic-detail"><label>{t('pg.admin.clinics.doctors')}</label><span>{clinic.doctorsCount}</span></div>
              <div className="clinic-detail"><label>{t('pg.admin.clinics.hours')}</label><span>{clinic.workingHours}</span></div>
            </div>
            <div className="clinic-actions">
              <Button size="sm" variant="outline" onClick={() => { setEditModal(clinic); setIsAdd(false); }}>{t('common.edit')}</Button>
              <Button size="sm" variant="outline">{t('pg.admin.clinics.manage')}</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('pg.admin.clinics.addClinic') : t('pg.admin.clinics.editClinic')} size="lg">
        {editModal && (
          <div className="clinic-form">
            <Input label={t('pg.admin.clinics.clinicName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Textarea label={t('pg.admin.clinics.address')} name="address" value={editModal.address} onChange={(e) => setEditModal((p) => ({ ...p, address: e.target.value }))} rows={2} />
            <div className="form-row">
              <Input label={t('pg.admin.clinics.phone')} name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
              <Input label={t('pg.admin.clinics.email')} name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <Input label={t('pg.admin.clinics.workingHours')} name="workingHours" value={editModal.workingHours} onChange={(e) => setEditModal((p) => ({ ...p, workingHours: e.target.value }))} />
            <Select label={t('pg.admin.clinics.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: t('common.active') }, { value: 'Inactive', label: t('common.inactive') }]} />
            <div className="clinic-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? t('pg.admin.clinics.addClinic') : t('pg.admin.clinics.saveChanges')}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clinics;
