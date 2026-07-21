const STORAGE_KEY = 'clinic_prescriptions';

export function getPrescriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  return [];
}

export function savePrescriptions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Append a newly written prescription and persist it.
export function addPrescription(prx) {
  const list = getPrescriptions();
  list.push(prx);
  savePrescriptions(list);
  return prx;
}

// Combine seed mock prescriptions with any written in this session.
export function getAllPrescriptions(seed = []) {
  return [...seed, ...getPrescriptions()];
}

// Build a printable HTML document for a prescription. `t` must provide the
// pg.patient.prescriptions.* print keys (htmlTitle, htmlName, htmlPatientId,
// htmlPatientInfo, htmlDoctor, htmlPrescriptionId, htmlDate, htmlMedicalStore,
// htmlPrescribedMedicines, colMedicine, colDosage, colFrequency, colDuration,
// colQty, colInstructions, htmlNotes, htmlDoctorsSignature, htmlComputerGenerated).
export function buildPrescriptionPrintHtml(prx, t, esc) {
  const medRows = (prx.medicines || [])
    .map(
      (m, i) =>
        `<tr><td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.dosage)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)} ${esc(m.durationType || '')}</td><td>${esc(m.quantity)}</td><td>${esc(m.instructions || '—')}</td></tr>`
    )
    .join('');
  return `
    <div class="doc-header">
      <h2>ClinicManager</h2>
      <p>123 Healthcare Avenue, Medical District, Mumbai</p>
      <p>Phone: +91-22-12345678 | Email: info@clinicmanager.com</p>
    </div>
    <div class="divider"></div>
    <div class="title">${esc(t('pg.patient.prescriptions.htmlTitle'))}</div>
    <div class="meta">
      <div><strong>${esc(t('pg.patient.prescriptions.htmlPrescriptionId'))}:</strong> ${esc(prx.id)}</div>
      <div><strong>${esc(t('pg.patient.prescriptions.htmlDate'))}:</strong> ${esc(prx.date)}</div>
    </div>
    <div class="divider"></div>
    <div class="section">
      <h4>${esc(t('pg.patient.prescriptions.htmlPatientInfo'))}</h4>
      <div class="row"><span class="k">${esc(t('pg.patient.prescriptions.htmlName'))}:</span><span>${esc(prx.patientName || '—')}</span></div>
      <div class="row"><span class="k">${esc(t('pg.patient.prescriptions.htmlPatientId'))}:</span><span>${esc(prx.patientId || '—')}</span></div>
    </div>
    <div class="section">
      <h4>${esc(t('pg.patient.prescriptions.htmlDoctor'))}</h4>
      <div class="row"><span class="k">${esc(t('pg.patient.prescriptions.htmlName'))}:</span><span>${esc(prx.doctorName || '—')}</span></div>
    </div>
    ${prx.store ? `<div class="section"><h4>${esc(t('pg.patient.prescriptions.htmlMedicalStore'))}</h4><p>${esc(prx.store)}</p></div>` : ''}
    ${prx.notes ? `<div class="section"><h4>${esc(t('pg.patient.prescriptions.htmlNotes'))}</h4><p>${esc(prx.notes)}</p></div>` : ''}
    <div class="section">
      <h4>${esc(t('pg.patient.prescriptions.htmlPrescribedMedicines'))}</h4>
      <table>
        <thead><tr><th>#</th><th>${esc(t('pg.patient.prescriptions.colMedicine'))}</th><th>${esc(t('pg.patient.prescriptions.colDosage'))}</th><th>${esc(t('pg.patient.prescriptions.colFrequency'))}</th><th>${esc(t('pg.patient.prescriptions.colDuration'))}</th><th>${esc(t('pg.patient.prescriptions.colQty'))}</th><th>${esc(t('pg.patient.prescriptions.colInstructions'))}</th></tr></thead>
        <tbody>${medRows}</tbody>
      </table>
    </div>
    <div class="footer">
      <p class="note">${esc(t('pg.patient.prescriptions.htmlComputerGenerated'))}</p>
      <div class="sig"><div class="sig-line"></div><p>${esc(t('pg.patient.prescriptions.htmlDoctorsSignature'))}</p></div>
    </div>`;
}
