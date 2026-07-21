import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { DataTable } from '../../components/Tables';
import { Input } from '../../components/Forms';
import { Button } from '../../components/Buttons';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import * as pharmacyApi from '../../services/api/pharmacy';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate } from '../../utils/helpers';
import { buildPrescriptionPrintHtml } from '../../services/prescriptionStore';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import './DispensedMedicines.css';
import { useTranslation } from '../../i18n/LanguageContext';

const DispensedMedicines = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dispensed, setDispensed] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [patientsById, setPatientsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [rx, doctors, patients] = await Promise.all([
        pharmacyApi.getDispensedForStore(user.id), clinicalApi.getDoctors(), clinicalApi.getPatients(),
      ]);
      setDispensed(rx || []);
      const dMap = {}; (doctors || []).forEach((d) => { dMap[d.id] = d.name; });
      setDoctorsById(dMap);
      const pMap = {}; (patients || []).forEach((p) => { pMap[p.id] = p.name; });
      setPatientsById(pMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dispensed medicines'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const all = dispensed.map((p) => ({
    ...p,
    displayId: p.rxId || p.id,
    doctorName: doctorsById[p.doctorId] || '—',
    patientName: patientsById[p.patientId] || '—',
  }));

  const filtered = all.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.patientName.toLowerCase().includes(q) || p.doctorName.toLowerCase().includes(q) || String(p.displayId).toLowerCase().includes(q);
    const d = new Date(p.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from && d < from) return false;
    if (to && d > new Date(to.setHours(23, 59, 59))) return false;
    return matchSearch;
  });

  const handlePrint = (prx) => printDocument(t('pg.patient.prescriptions.htmlTitle'), buildPrescriptionPrintHtml(prx, t, esc));

  const columns = [
    { key: 'displayId', label: t('pg.medicalStore.dispensedMedicines.colPrescriptionId') },
    { key: 'patientName', label: t('pg.medicalStore.dispensedMedicines.colPatient') },
    { key: 'doctorName', label: t('pg.medicalStore.dispensedMedicines.colDoctor') },
    { key: 'dispensedAt', label: t('pg.medicalStore.dispensedMedicines.colDateDispensed'), render: (v) => (v ? formatDate(v.slice(0, 10)) : '—') },
    { key: 'medicines', label: t('pg.medicalStore.dispensedMedicines.colItems'), render: (v) => v.length },
    { key: 'totalCost', label: t('pg.medicalStore.dispensedMedicines.colTotalCost'), render: (v) => `₹${(v ?? 0).toFixed(2)}` },
    {
      key: 'actions',
      label: t('pg.medicalStore.dispensedMedicines.colActions'),
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(row); }}>{t('pg.medicalStore.dispensedMedicines.view')}</Button>
      ),
    },
  ];

  return (
    <div className="page dispensed-page">
      <div className="page-header">
        <h1>{t('pg.medicalStore.dispensedMedicines.title')}</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="dispensed-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.medicalStore.dispensedMedicines.searchPlaceholder')} />
        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 180 }} />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} onRowClick={setSelectedPrx} emptyMessage={t('pg.medicalStore.dispensedMedicines.empty')} />}
      </Card>

      {selectedPrx && (
        <div className="print-only-anchor">
          <Button onClick={() => handlePrint(selectedPrx)}>🖨️ {t('pg.patient.prescriptions.print')}</Button>
        </div>
      )}
    </div>
  );
};

export default DispensedMedicines;
