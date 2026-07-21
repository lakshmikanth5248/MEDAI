import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader/Loader';
import { Alert } from '../../components/Alerts/Alerts';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { buildPrescriptionPrintHtml } from '../../services/prescriptionStore';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import { useAuth } from '../../context/AuthContext';
import './PendingPrescriptions.css';
import { useTranslation } from '../../i18n/LanguageContext';

// Turns the backend's 409 "insufficient_stock" details array
// ({name, reason, available, requested} | {name, reason: 'not_found_in_store_inventory'})
// into a readable summary to show alongside the top-level error message.
function describeShortages(details) {
  if (!Array.isArray(details) || details.length === 0) return '';
  return details
    .map((d) => {
      if (d.reason === 'not_found_in_store_inventory') return `${d.name}: not carried by this store`;
      return `${d.name}: only ${d.available ?? 0} in stock, ${d.requested ?? '?'} needed`;
    })
    .join('; ');
}

const PendingPrescriptions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);
  const [dispenseModal, setDispenseModal] = useState(null);

  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [patientsById, setPatientsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [dispensing, setDispensing] = useState(false);
  const [dispenseError, setDispenseError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Not-yet-dispensed prescriptions don't have a storeId assigned yet
      // (that only happens at dispense time), so any store can see/dispense
      // any of them - fetch both statuses unscoped, same as the old mock.
      const [pending, active, doctors, patients] = await Promise.all([
        prescriptionsApi.getPrescriptions({ status: 'pending' }),
        prescriptionsApi.getPrescriptions({ status: 'active' }),
        clinicalApi.getDoctors(),
        clinicalApi.getPatients(),
      ]);
      setPrescriptions([...(pending || []), ...(active || [])]);

      const dMap = {};
      (doctors || []).forEach((d) => { dMap[d.id] = d.name; });
      setDoctorsById(dMap);

      const pMap = {};
      (patients || []).forEach((p) => { pMap[p.id] = p; });
      setPatientsById(pMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pending prescriptions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const all = prescriptions.map((p) => ({
    ...p,
    displayId: p.rxId || p.id,
    doctorName: doctorsById[p.doctorId] || 'Unknown Doctor',
    patientName: patientsById[p.patientId]?.name || 'Unknown Patient',
    patientCode: patientsById[p.patientId]?.patientId,
  }));

  const filtered = all.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.patientName.toLowerCase().includes(q) || p.doctorName.toLowerCase().includes(q) || String(p.displayId).toLowerCase().includes(q);
    const matchDoctor = !doctorFilter || p.doctorName === doctorFilter;
    const matchDate = !dateFilter || p.date === dateFilter;
    return matchSearch && matchDoctor && matchDate;
  });

  const handlePrint = (prx) => printDocument(t('pg.patient.prescriptions.htmlTitle'), buildPrescriptionPrintHtml(prx, t, esc));

  const openDispenseModal = (row) => {
    setDispenseError('');
    setDispenseModal(row);
  };

  const closeDispenseModal = () => {
    if (dispensing) return;
    setDispenseModal(null);
    setDispenseError('');
  };

  const handleConfirmDispense = async () => {
    if (!dispenseModal || !user?.id) return;
    setDispensing(true);
    setDispenseError('');
    try {
      const updated = await prescriptionsApi.dispensePrescription(dispenseModal.id, user.id);
      // The prescription is now dispensed - drop it from the pending list.
      setPrescriptions((prev) => prev.filter((p) => p.id !== dispenseModal.id));
      setDispenseModal(null);
      setSuccessMsg(
        `${updated.rxId || updated.id} dispensed successfully. Total: ₹${updated.totalCost != null ? updated.totalCost : '0'}`
      );
    } catch (err) {
      const details = err?.response?.data?.details;
      const shortageSummary = describeShortages(details);
      const baseMsg = getErrorMessage(err, 'Failed to dispense prescription');
      setDispenseError(shortageSummary ? `${baseMsg} (${shortageSummary})` : baseMsg);
    } finally {
      setDispensing(false);
    }
  };

  const columns = [
    { key: 'displayId', label: t('pg.medicalStore.pendingPrescriptions.colPrescriptionId') },
    { key: 'patientName', label: t('pg.medicalStore.pendingPrescriptions.colPatient') },
    { key: 'doctorName', label: t('pg.medicalStore.pendingPrescriptions.colDoctor') },
    { key: 'date', label: t('pg.medicalStore.pendingPrescriptions.colDate'), render: (v) => formatDate(v) },
    { key: 'medicines', label: t('pg.medicalStore.pendingPrescriptions.colMedicines'), render: (v) => v.length },
    { key: 'status', label: t('pg.medicalStore.pendingPrescriptions.colStatus'), render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span> },
    {
      key: 'actions',
      label: t('pg.medicalStore.pendingPrescriptions.colActions'),
      render: (_, row) => (
        <div className="action-icons">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); openDispenseModal(row); }}>{t('pg.medicalStore.pendingPrescriptions.dispense')}</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(row); }}>{t('pg.medicalStore.pendingPrescriptions.viewDetails')}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page pending-prx-page">
      <div className="page-header">
        <h1>{t('pg.medicalStore.pendingPrescriptions.title')}</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} autoClose={6} />}

      <div className="prx-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.medicalStore.pendingPrescriptions.searchPlaceholder')} />
        <Select name="doctor" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} placeholder={t('pg.medicalStore.pendingPrescriptions.allDoctors')} options={[...new Set(all.map((p) => p.doctorName))].map((d) => ({ value: d, label: d }))} />
        <input type="date" className="form-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <Card>
        {loading ? (
          <Loader size="md" text={t('common.loading') || 'Loading...'} />
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={setSelectedPrx} emptyMessage={t('pg.medicalStore.pendingPrescriptions.empty')} />
        )}
      </Card>

      <Modal isOpen={!!selectedPrx} onClose={() => setSelectedPrx(null)} title={t('pg.medicalStore.pendingPrescriptions.detailsTitle')} size="lg">
        {selectedPrx && (
          <div className="prx-detail-modal">
            <div className="prx-detail-section"><label>{t('pg.medicalStore.pendingPrescriptions.patient')}</label><p>{selectedPrx.patientName} {selectedPrx.patientCode ? `(${selectedPrx.patientCode})` : ''}</p></div>
            <div className="prx-detail-section"><label>{t('pg.medicalStore.pendingPrescriptions.doctor')}</label><p>{selectedPrx.doctorName}</p></div>
            <div className="prx-detail-section">
              <label>{t('pg.medicalStore.pendingPrescriptions.medicines')}</label>
              <table className="prx-med-table">
                <thead>
                  <tr>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colMedicine')}</th>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colDosage')}</th>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colFrequency')}</th>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colDuration')}</th>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colQty')}</th>
                    <th>{t('pg.medicalStore.pendingPrescriptions.colInstructions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrx.medicines.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration} {m.durationType || ''}</td>
                      <td>{m.quantity}</td>
                      <td>{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedPrx.notes && <div className="prx-detail-section"><label>{t('pg.medicalStore.pendingPrescriptions.notes')}</label><p>{selectedPrx.notes}</p></div>}
            <div className="dispense-actions">
              <Button onClick={() => handlePrint(selectedPrx)}>🖨️ {t('pg.patient.prescriptions.print')}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!dispenseModal} onClose={closeDispenseModal} title={t('pg.medicalStore.pendingPrescriptions.dispenseTitle')} size="md">
        {dispenseModal && (
          <div className="dispense-modal">
            <p>{t('pg.medicalStore.pendingPrescriptions.dispensingFor')} <strong>{dispenseModal.patientName}</strong></p>
            <div className="dispense-meds">
              {dispenseModal.medicines.map((m, i) => (
                <div key={i} className="dispense-med-row">
                  <span>{m.name}</span>
                  <span>{t('pg.medicalStore.pendingPrescriptions.qty')} {m.quantity}</span>
                </div>
              ))}
            </div>
            {dispenseError && <Alert type="error" message={dispenseError} onClose={() => setDispenseError('')} dismissible />}
            <div className="dispense-actions">
              <Button onClick={handleConfirmDispense} loading={dispensing} disabled={dispensing}>{t('pg.medicalStore.pendingPrescriptions.confirmDispense')}</Button>
              <Button variant="secondary" onClick={closeDispenseModal} disabled={dispensing}>{t('pg.medicalStore.pendingPrescriptions.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingPrescriptions;
