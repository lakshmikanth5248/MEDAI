import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { prescriptions, currentPatient, doctors, medicalStores } from '../../utils/mockData';
import { formatDate, getCurrentDate } from '../../utils/helpers';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import './Prescriptions.css';

const Prescriptions = () => {
  const [search, setSearch] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);

  const buildPrescriptionHtml = (prx) => {
    const doctorName = doctors.find((d) => d.id === prx.doctorId)?.name || 'Unknown';
    const storeName = medicalStores.find((s) => s.id === prx.storeId)?.name;
    const rows = prx.medicines
      .map(
        (m, i) =>
          `<tr><td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.dosage)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)}</td><td>${esc(m.quantity)}</td><td>${esc(m.instructions || '—')}</td></tr>`
      )
      .join('');
    return `
      <div class="doc-header">
        <h2>ClinicManager</h2>
        <p>123 Healthcare Avenue, Medical District, Mumbai</p>
        <p>Phone: +91-22-12345678 | Email: info@clinicmanager.com</p>
      </div>
      <div class="divider"></div>
      <div class="title">PRESCRIPTION</div>
      <div class="meta">
        <div><strong>Prescription ID:</strong> ${esc(prx.id)}</div>
        <div><strong>Date:</strong> ${esc(formatDate(prx.date))}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <h4>Patient Information</h4>
        <div class="row"><span class="k">Name:</span><span>${esc(currentPatient.name)}</span></div>
        <div class="row"><span class="k">Patient ID:</span><span>${esc(currentPatient.id)}</span></div>
      </div>
      <div class="section">
        <h4>Doctor</h4>
        <div class="row"><span class="k">Name:</span><span>${esc(doctorName)}</span></div>
      </div>
      ${prx.notes ? `<div class="section"><h4>Notes</h4><p>${esc(prx.notes)}</p></div>` : ''}
      <div class="section">
        <h4>Prescribed Medicines</h4>
        <table>
          <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Qty</th><th>Instructions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${storeName ? `<div class="section"><h4>Medical Store</h4><p>${esc(storeName)}</p></div>` : ''}
      <div class="footer">
        <p class="note">This is a computer-generated prescription.</p>
        <div class="sig"><div class="sig-line"></div><p>Doctor's Signature</p></div>
      </div>`;
  };

  const patientPrx = prescriptions
    .filter((p) => p.patientId === currentPatient.id)
    .map((p) => ({
      ...p,
      doctorName: doctors.find((d) => d.id === p.doctorId)?.name || 'Unknown',
      storeName: medicalStores.find((s) => s.id === p.storeId)?.name,
    }));

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
                <span className={`status-badge ${prx.status?.toLowerCase() === 'dispensed' ? 'status-dispensed' : 'status-pending'}`}>{prx.status}</span>
              </div>
              <p className="prx-diagnosis-text"><strong>Notes:</strong> {prx.notes || 'N/A'}</p>
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
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); printDocument('Prescription', buildPrescriptionHtml(prx)); }}>🖨️ Print</Button>
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
            {selectedPrx.notes && (
              <div className="prx-detail-section">
                <label>Notes</label>
                <p>{selectedPrx.notes}</p>
              </div>
            )}
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
