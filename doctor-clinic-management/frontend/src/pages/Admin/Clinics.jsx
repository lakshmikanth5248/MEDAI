import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as coreApi from '../../services/api/core';
import { getErrorMessage } from '../../services/apiError';
import './Clinics.css';
import { useTranslation } from '../../i18n/LanguageContext';

const EMPTY_FORM = { name: '', address: '', phone: '', email: '', workingHours: '', status: 'active' };

const Clinics = () => {
  const { t } = useTranslation();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setClinics(await coreApi.getClinics());
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load clinics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, address: editModal.address, phone: editModal.phone,
        email: editModal.email, workingHours: editModal.workingHours, status: editModal.status,
      };
      if (isAdd) {
        const created = await coreApi.createClinic(payload);
        setClinics((prev) => [...prev, created]);
      } else {
        const updated = await coreApi.updateClinic(editModal.id, payload);
        setClinics((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
      setEditModal(null);
      setIsAdd(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save clinic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page clinics-page">
      <div className="page-header">
        <h1>{t('clinics.title')}</h1>
        <Button icon="➕" onClick={() => { setEditModal({ ...EMPTY_FORM }); setIsAdd(true); }}>{t('clinics.addClinic')}</Button>
      </div>

      {error && <p className="text-error">{error}</p>}

      {loading ? <Loader /> : (
        <div className="clinics-grid">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="clinic-card">
              <div className="clinic-card-header">
                <div className="clinic-icon">🏥</div>
                <div>
                  <h3>{clinic.name}</h3>
                  <span className={`status-badge ${clinic.status === 'active' ? 'status-active' : 'status-inactive'}`}>{clinic.status === 'active' ? t('common.active') : t('common.inactive')}</span>
                </div>
              </div>
              <div className="clinic-details">
                <div className="clinic-detail"><label>{t('clinics.address')}</label><span>{clinic.address}</span></div>
                <div className="clinic-detail"><label>{t('clinics.phone')}</label><span>{clinic.phone}</span></div>
                <div className="clinic-detail"><label>{t('clinics.email')}</label><span>{clinic.email}</span></div>
                <div className="clinic-detail"><label>{t('clinics.hours')}</label><span>{clinic.workingHours}</span></div>
              </div>
              <div className="clinic-actions">
                <Button size="sm" variant="outline" onClick={() => { setEditModal(clinic); setIsAdd(false); }}>{t('common.edit')}</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('clinics.addClinic') : t('clinics.editClinic')} size="lg">
        {editModal && (
          <div className="clinic-form">
            <Input label={t('clinics.clinicName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Textarea label={t('clinics.address')} name="address" value={editModal.address} onChange={(e) => setEditModal((p) => ({ ...p, address: e.target.value }))} rows={2} />
            <div className="form-row">
              <Input label={t('clinics.phone')} name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
              <Input label={t('clinics.email')} name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <Input label={t('clinics.workingHours')} name="workingHours" value={editModal.workingHours} onChange={(e) => setEditModal((p) => ({ ...p, workingHours: e.target.value }))} />
            <Select label={t('clinics.status')} name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
            <div className="clinic-form-actions">
              <Button onClick={handleSave} disabled={saving}>{saving ? '...' : (isAdd ? t('clinics.addClinic') : t('clinics.saveChanges'))}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }} disabled={saving}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clinics;
