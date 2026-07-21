import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as pharmacyApi from '../../services/api/pharmacy';
import { getErrorMessage } from '../../services/apiError';
import { formatDate } from '../../utils/helpers';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile, getRoleId } from '../../utils/profile';
import { useTranslation } from '../../i18n/LanguageContext';
import './Prescriptions.css';

const Prescriptions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const patient = resolveProfile(user) || {};
  const patientId = getRoleId(patient);
  const [search, setSearch] = useState('');
  const [selectedPrx, setSelectedPrx] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const [prx, doctors, stores] = await Promise.all([
          prescriptionsApi.getPrescriptions({ patientId: user.id }),
          clinicalApi.getDoctors(),
          pharmacyApi.getStores(),
        ]);
        if (cancelled) return;
        setPrescriptions(
          prx.map((p) => ({
            ...p,
            doctorName: doctors.find((d) => d.id === p.doctorId)?.name || 'Unknown',
            storeName: p.storeId ? stores.find((s) => s.id === p.storeId)?.name : '',
          }))
        );
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load prescriptions'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const buildPrescriptionHtml = (prx) => {
    const rows = (prx.medicines || [])
      .map(
        (m, i) =>
          `<tr><td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.dosage)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)} ${esc(m.durationType || '')}</td><td>${esc(m.quantity)}</td><td>${esc(m.instructions || '—')}</td></tr>`
      )
      .join('');
    return `
      <div class="doc-header">
        <div class="doc-brand"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e90c8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M12 7v6"/><path d="M9 10h6"/><path d="M10 21v-4h4v4"/></svg><h2>ClinicManager</h2></div>
        <p>123 Healthcare Avenue, Medical District, Mumbai</p>
        <p>Phone: +91-22-12345678 | Email: info@clinicmanager.com</p>
      </div>
      <div class="divider"></div>
      <div class="title">${t('pg.patient.prescriptions.htmlTitle')}</div>
      <div class="meta">
        <div><strong>${t('pg.patient.prescriptions.htmlPrescriptionId')}</strong> ${esc(prx.rxId || prx.id)}</div>
        <div><strong>${t('pg.patient.prescriptions.htmlDate')}</strong> ${esc(formatDate(prx.date))}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <h4>${t('pg.patient.prescriptions.htmlPatientInfo')}</h4>
        <div class="row"><span class="k">${t('pg.patient.prescriptions.htmlName')}</span><span>${esc(patient.name)}</span></div>
        <div class="row"><span class="k">${t('pg.patient.prescriptions.htmlPatientId')}</span><span>${esc(patientId)}</span></div>
      </div>
      <div class="section">
        <h4>${t('pg.patient.prescriptions.htmlDoctor')}</h4>
        <div class="row"><span class="k">${t('pg.patient.prescriptions.htmlName')}</span><span>${esc(prx.doctorName)}</span></div>
      </div>
      ${prx.notes ? `<div class="section"><h4>${t('pg.patient.prescriptions.htmlNotes')}</h4><p>${esc(prx.notes)}</p></div>` : ''}
      <div class="section">
        <h4>${t('pg.patient.prescriptions.htmlPrescribedMedicines')}</h4>
        <table>
          <thead><tr><th>#</th><th>${esc(t('pg.patient.prescriptions.colMedicine'))}</th><th>${esc(t('pg.patient.prescriptions.colDosage'))}</th><th>${esc(t('pg.patient.prescriptions.colFrequency'))}</th><th>${esc(t('pg.patient.prescriptions.colDuration'))}</th><th>${esc(t('pg.patient.prescriptions.colQty'))}</th><th>${esc(t('pg.patient.prescriptions.colInstructions'))}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${prx.storeName ? `<div class="section"><h4>${t('pg.patient.prescriptions.htmlMedicalStore')}</h4><p>${esc(prx.storeName)}</p></div>` : ''}
      <div class="footer">
        <p class="note">${t('pg.patient.prescriptions.htmlComputerGenerated')}</p>
        <div class="sig"><div class="sig-line"></div><p>${t('pg.patient.prescriptions.htmlDoctorsSignature')}</p></div>
      </div>`;
  };

  const filtered = prescriptions.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.doctorName.toLowerCase().includes(q) || (p.medicines || []).some((m) => m.name.toLowerCase().includes(q));
  });

  if (loading) return <PageLoader />;

  return (
    <div className="page prescriptions-page">
      <div className="page-header">
        <h1>{t('pg.patient.prescriptions.title')}</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.patient.prescriptions.searchPlaceholder')} />
      </div>

      {error && <p className="text-danger">{error}</p>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>{t('pg.patient.prescriptions.noPrescriptions')}</h3>
          <p className="text-muted">{t('pg.patient.prescriptions.noPrescriptionsText')}</p>
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
              <p className="prx-diagnosis-text"><strong>{t('pg.patient.prescriptions.notesColon')}</strong> {prx.notes || 'N/A'}</p>
              <div className="prx-medicines">
                {(prx.medicines || []).slice(0, 2).map((m, i) => (
                  <div key={i} className="prx-medicine-item">
                    <span>{m.name}</span>
                    <span className="text-muted">{m.dosage} | {m.duration}</span>
                  </div>
                ))}
                {(prx.medicines || []).length > 2 && <p className="text-muted">+{prx.medicines.length - 2} {t('pg.patient.prescriptions.moreMedicines')}</p>}
              </div>
              <div className="prx-card-footer">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedPrx(prx); }}>{t('pg.patient.prescriptions.viewDetails')}</Button>
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); printDocument('Prescription', buildPrescriptionHtml(prx)); }}>🖨️ {t('pg.patient.prescriptions.print')}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedPrx} onClose={() => setSelectedPrx(null)} title={t('pg.patient.prescriptions.details')} size="lg">
        {selectedPrx && (
          <div className="prx-detail-modal">
            <div className="prx-detail-header">
              <h3>{selectedPrx.doctorName}</h3>
              <p className="text-muted">{formatDate(selectedPrx.date)} | {selectedPrx.status}</p>
            </div>
            {selectedPrx.notes && (
              <div className="prx-detail-section">
                <label>{t('pg.patient.prescriptions.lblNotes')}</label>
                <p>{selectedPrx.notes}</p>
              </div>
            )}
            <div className="prx-detail-section">
              <label>{t('pg.patient.prescriptions.lblMedicines')}</label>
              <table className="prx-med-table">
                <thead>
                  <tr>
                    <th>{t('pg.patient.prescriptions.colMedicine')}</th>
                    <th>{t('pg.patient.prescriptions.colDosage')}</th>
                    <th>{t('pg.patient.prescriptions.colFrequency')}</th>
                    <th>{t('pg.patient.prescriptions.colDuration')}</th>
                    <th>{t('pg.patient.prescriptions.colQty')}</th>
                    <th>{t('pg.patient.prescriptions.colInstructions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPrx.medicines || []).map((m, i) => (
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
                <label>{t('pg.patient.prescriptions.lblNotes')}</label>
                <p>{selectedPrx.notes}</p>
              </div>
            )}
            {selectedPrx.storeName && (
              <div className="prx-detail-section">
                <label>{t('pg.patient.prescriptions.lblMedicalStore')}</label>
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
