import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { prescriptions, currentPatient } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';
import './Prescriptions.css';

const Prescriptions = () => {
  const [search, setSearch] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);

  const patientPrx = prescriptions.filter((p) => p.patientId === currentPatient.id);

  const filtered = patientPrx.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.doctorName.toLowerCase().includes(q) || p.medicines.some((m) => m.name.toLowerCase().includes(q));
  });

  return (
    <div className="page prescriptions-page">
      <div className="page-header">
        <h1>My Prescriptions</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by doctor or medicine..." />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>No Prescriptions</h3>
          <p className="text-muted">You don't have any prescriptions yet.</p>
        </div>
      ) : (
        <div className="prx-list">
          {filtered.map((prx) => (
            <Card key={prx.id} className="prx-card" onClick={() => setSelectedPrx(prx)}>
              <div className="prx-card-header">
                <div>
                  <h3 className="prx-doctor-name">{prx.doctorName}</h3>
                  <p className="prx-date-text">{formatDate(prx.date)}</p>
                </div>
                <span className={`status-badge ${prx.status === 'Dispensed' ? 'status-dispensed' : 'status-pending'}`}>{prx.status}</span>
              </div>
              <p className="prx-diagnosis-text"><strong>Diagnosis:</strong> {prx.diagnosis}</p>
              <div className="prx-medicines">
                {prx.medicines.slice(0, 2).map((m, i) => (
                  <div key={i} className="prx-medicine-item">
                    <span>{m.name}</span>
                    <span className="text-muted">{m.dosage} | {m.duration}</span>
                  </div>
                ))}
                {prx.medicines.length > 2 && <p className="text-muted">+{prx.medicines.length - 2} more medicines</p>}
              </div>
              <div className="prx-card-footer">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(prx); }}>View Details</Button>
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.print(); }}>🖨️ Print</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedPrx} onClose={() => setSelectedPrx(null)} title="Prescription Details" size="lg">
        {selectedPrx && (
          <div className="prx-detail-modal">
            <div className="prx-detail-header">
              <h3>{selectedPrx.doctorName}</h3>
              <p className="text-muted">{formatDate(selectedPrx.date)} | {selectedPrx.status}</p>
            </div>
            <div className="prx-detail-section">
              <label>Diagnosis</label>
              <p>{selectedPrx.diagnosis}</p>
            </div>
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
            {selectedPrx.notes && (
              <div className="prx-detail-section">
                <label>Notes</label>
                <p>{selectedPrx.notes}</p>
              </div>
            )}
            {selectedPrx.storeName && (
              <div className="prx-detail-section">
                <label>Medical Store</label>
                <p>{selectedPrx.storeName}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
