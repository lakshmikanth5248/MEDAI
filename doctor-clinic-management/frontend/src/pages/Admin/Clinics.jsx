import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { clinics } from '../../utils/mockData';
import './Clinics.css';

const Clinics = () => {
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  return (
    <div className="page clinics-page">
      <div className="page-header">
        <h1>Clinics</h1>
        <Button icon="➕" onClick={() => { setEditModal({ name: '', address: '', phone: '', email: '', workingHours: '', status: 'Active' }); setIsAdd(true); }}>Add Clinic</Button>
      </div>

      <div className="clinics-grid">
        {clinics.map((clinic) => (
          <div key={clinic.id} className="clinic-card">
            <div className="clinic-card-header">
              <div className="clinic-icon">🏥</div>
              <div>
                <h3>{clinic.name}</h3>
                <span className={`status-badge ${clinic.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{clinic.status}</span>
              </div>
            </div>
            <div className="clinic-details">
              <div className="clinic-detail"><label>Address</label><span>{clinic.address}</span></div>
              <div className="clinic-detail"><label>Phone</label><span>{clinic.phone}</span></div>
              <div className="clinic-detail"><label>Email</label><span>{clinic.email}</span></div>
              <div className="clinic-detail"><label>Doctors</label><span>{clinic.doctorsCount}</span></div>
              <div className="clinic-detail"><label>Hours</label><span>{clinic.workingHours}</span></div>
            </div>
            <div className="clinic-actions">
              <Button size="sm" variant="outline" onClick={() => { setEditModal(clinic); setIsAdd(false); }}>Edit</Button>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? 'Add Clinic' : 'Edit Clinic'} size="lg">
        {editModal && (
          <div className="clinic-form">
            <Input label="Clinic Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Textarea label="Address" name="address" value={editModal.address} onChange={(e) => setEditModal((p) => ({ ...p, address: e.target.value }))} rows={2} />
            <div className="form-row">
              <Input label="Phone" name="phone" value={editModal.phone} onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))} />
              <Input label="Email" name="email" type="email" value={editModal.email} onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <Input label="Working Hours" name="workingHours" value={editModal.workingHours} onChange={(e) => setEditModal((p) => ({ ...p, workingHours: e.target.value }))} />
            <Select label="Status" name="status" value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="clinic-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? 'Add Clinic' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clinics;
