import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { prescriptions } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './PendingPrescriptions.css';

const PendingPrescriptions = () => {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);
  const [dispenseModal, setDispenseModal] = useState(null);

  const pending = prescriptions.filter((p) => p.status === 'Pending');

  const filtered = pending.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.patientName.toLowerCase().includes(q) || p.doctorName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchDoctor = !doctorFilter || p.doctorName === doctorFilter;
    const matchDate = !dateFilter || p.date === dateFilter;
    return matchSearch && matchDoctor && matchDate;
  });

  const columns = [
    { key: 'id', label: 'Prescription ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'medicines', label: 'Medicines', render: (v) => v.length },
    { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); setDispenseModal(row); }}>Dispense</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(row); }}>View Details</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page pending-prx-page">
      <div className="page-header">
        <h1>Pending Prescriptions</h1>
      </div>

      <div className="prx-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient, doctor or ID..." />
        <Select name="doctor" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} placeholder="All Doctors" options={[...new Set(prescriptions.map((p) => p.doctorName))].map((d) => ({ value: d, label: d }))} />
        <input type="date" className="form-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} onRowClick={setSelectedPrx} emptyMessage="No pending prescriptions" />
      </Card>

      <Modal isOpen={!!selectedPrx} onClose={() => setSelectedPrx(null)} title="Prescription Details" size="lg">
        {selectedPrx && (
          <div className="prx-detail-modal">
            <div className="prx-detail-section"><label>Patient</label><p>{selectedPrx.patientName}</p></div>
            <div className="prx-detail-section"><label>Doctor</label><p>{selectedPrx.doctorName}</p></div>
            <div className="prx-detail-section"><label>Diagnosis</label><p>{selectedPrx.diagnosis}</p></div>
            <div className="prx-detail-section">
              <label>Medicines</label>
              <table className="prx-med-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Qty</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrx.medicines.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>{m.quantity}</td>
                      <td>{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedPrx.notes && <div className="prx-detail-section"><label>Notes</label><p>{selectedPrx.notes}</p></div>}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!dispenseModal} onClose={() => setDispenseModal(null)} title="Dispense Prescription" size="md">
        {dispenseModal && (
          <div className="dispense-modal">
            <p>Dispensing prescription for <strong>{dispenseModal.patientName}</strong></p>
            <div className="dispense-meds">
              {dispenseModal.medicines.map((m, i) => (
                <div key={i} className="dispense-med-row">
                  <span>{m.name}</span>
                  <span>Qty: {m.quantity}</span>
                  <span className="stock-check">✅ In Stock</span>
                </div>
              ))}
            </div>
            <div className="dispense-actions">
              <Button onClick={() => { setDispenseModal(null); }}>Confirm Dispense</Button>
              <Button variant="secondary" onClick={() => setDispenseModal(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingPrescriptions;
