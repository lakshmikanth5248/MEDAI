import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { buildPrescriptionPrintHtml } from '../../services/prescriptionStore';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import './Prescriptions.css';
import { useTranslation } from '../../i18n/LanguageContext';

const ReceptionPrescriptions = () => {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rx, pts, docs] = await Promise.all([
        prescriptionsApi.getPrescriptions(), clinicalApi.getPatients(), clinicalApi.getDoctors(),
      ]);
      setPrescriptions(rx);
      setPatients(pts);
      setDoctors(docs);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load prescriptions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const all = prescriptions.map((p) => {
    const patient = patients.find((pt) => pt.id === p.patientId);
    const doctor = doctors.find((d) => d.id === p.doctorId);
    return {
      ...p,
      displayId: p.rxId || p.id,
      patientName: patient?.name || '—',
      patientCode: patient?.patientId || '—',
      doctorName: doctor?.name || '—',
    };
  });

  const filtered = all.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.patientName.toLowerCase().includes(q) || p.doctorName.toLowerCase().includes(q) || String(p.displayId).toLowerCase().includes(q);
    const matchPatient = !patientFilter || String(p.patientCode) === String(patientFilter);
    return matchSearch && matchPatient;
  });

  const handlePrint = (prx) => printDocument(t('pg.patient.prescriptions.htmlTitle'), buildPrescriptionPrintHtml(prx, t, esc));

  const columns = [
    { key: 'displayId', label: t('pg.medicalStore.pendingPrescriptions.colPrescriptionId') },
    { key: 'patientCode', label: t('pg.patient.prescriptions.htmlPatientId') },
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
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(row); }}>{t('pg.medicalStore.pendingPrescriptions.viewDetails')}</Button>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); handlePrint(row); }}>🖨️</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page reception-prx-page">
      <div className="page-header">
        <h1>{t('pg.reception.prescriptions.title')}</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="prx-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.medicalStore.pendingPrescriptions.searchPlaceholder')} />
        <Input name="patientId" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} placeholder={t('pg.patient.prescriptions.htmlPatientId')} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} onRowClick={setSelectedPrx} emptyMessage={t('pg.medicalStore.pendingPrescriptions.empty')} />}
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
    </div>
  );
};

export default ReceptionPrescriptions;
