import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, Textarea } from '../../components/Forms';
import { Loader } from '../../components/Loader';
import * as billingApi from '../../services/api/billing';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getCurrentDate } from '../../utils/helpers';
import { printDocument, escapeHtmlValue as esc } from '../../utils/print';
import './Billing.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Billing = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [tax, setTax] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [billGenerated, setBillGenerated] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  const load = useCallback(async () => {
    setLoadingPatients(true);
    setError('');
    try {
      const [pts, bills] = await Promise.all([clinicalApi.getPatients(), billingApi.getBills()]);
      setPatients(pts);
      setRecentBills(bills.slice(0, 5));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load billing data'));
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    const patient = patients.find(
      (p) =>
        String(p.id).toLowerCase() === q ||
        (p.patientId || '').toLowerCase() === q ||
        p.name.toLowerCase().includes(q) ||
        (p.phone || '').includes(q)
    );
    setSelectedPatient(patient || null);
  };

  const addItem = () => {
    setBillItems([...billItems, { id: Date.now(), description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = (field === 'quantity' ? value : item.quantity) * (field === 'rate' ? value : item.rate);
        }
        return updated;
      })
    );
  };

  // Live preview only - the backend recomputes and freezes the authoritative
  // totals server-side when the bill is actually created.
  const subtotal = billItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountAmt = discountType === 'percent' ? (subtotal * discount) / 100 : Number(discount);
  const taxAmt = (subtotal - discountAmt) * (tax / 100);
  const grandTotal = subtotal - discountAmt + taxAmt;

  const generateBill = async () => {
    setGenerating(true);
    setError('');
    try {
      const bill = await billingApi.createBill({
        patientId: selectedPatient.id,
        items: billItems.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate })),
        discount: Number(discount), discountType, tax: Number(tax),
        paymentMethod, notes,
      });
      setGeneratedBill(bill);
      setBillGenerated(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate bill'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintBill = () => {
    const rows = billItems
      .map(
        (item, i) =>
          `<tr><td>${i + 1}</td><td>${esc(item.description || '—')}</td><td>${esc(item.quantity)}</td><td>₹${esc((item.rate || 0).toFixed(2))}</td><td>₹${esc((item.amount || 0).toFixed(2))}</td></tr>`
      )
      .join('');
    const body = `
      <div class="doc-header">
        <div class="doc-brand"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e90c8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M12 7v6"/><path d="M9 10h6"/><path d="M10 21v-4h4v4"/></svg><h2>ClinicManager</h2></div>
        <p>123 Healthcare Avenue, Medical District, Mumbai</p>
        <p>${t('pg.reception.billing.invoicePhone')}: +91-22-12345678 | ${t('pg.reception.billing.invoiceEmail')}: info@clinicmanager.com</p>
      </div>
      <div class="divider"></div>
      <div class="title">${t('pg.reception.billing.invoiceTitle')}</div>
      <div class="meta">
        <div><strong>${t('pg.reception.billing.invoiceBillId')}</strong> ${esc(generatedBill?.billId)}</div>
        <div><strong>${t('pg.reception.billing.invoiceDate')}</strong> ${esc(getCurrentDate())}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <h4>${t('pg.reception.billing.invoicePatient')}</h4>
        <div class="row"><span class="k">${t('pg.reception.billing.invoiceName')}</span><span>${esc(selectedPatient?.name || 'N/A')}</span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoicePatientId')}</span><span>${esc(selectedPatient?.patientId || selectedPatient?.id || 'N/A')}</span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoicePhone')}</span><span>${esc(selectedPatient?.phone || 'N/A')}</span></div>
      </div>
      <div class="section">
        <h4>${t('pg.reception.billing.invoiceItems')}</h4>
        <table>
          <thead><tr><th>#</th><th>${t('pg.reception.billing.invoiceColDescription')}</th><th>${t('pg.reception.billing.invoiceColQty')}</th><th>${t('pg.reception.billing.invoiceColRate')}</th><th>${t('pg.reception.billing.invoiceColAmount')}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="section">
        <h4>${t('pg.reception.billing.invoiceSummary')}</h4>
        <div class="row"><span class="k">${t('pg.reception.billing.invoiceSubtotal')}</span><span>₹${esc((generatedBill?.subtotal ?? subtotal).toFixed(2))}</span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoiceDiscount')}</span><span>-₹${esc((generatedBill?.discountAmt ?? discountAmt).toFixed(2))}</span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoiceTax')} (${esc(tax)}%):</span><span>₹${esc((generatedBill?.taxAmt ?? taxAmt).toFixed(2))}</span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoiceGrandTotal')}</span><span><strong>₹${esc((generatedBill?.grandTotal ?? grandTotal).toFixed(2))}</strong></span></div>
        <div class="row"><span class="k">${t('pg.reception.billing.invoicePaymentMethod')}</span><span>${esc(paymentMethod)}</span></div>
        ${notes ? `<div class="row"><span class="k">${t('pg.reception.billing.invoiceNotes')}</span><span>${esc(notes)}</span></div>` : ''}
      </div>
      <div class="footer">
        <p class="note">${t('pg.reception.billing.invoiceGeneratedNote')}</p>
        <div class="sig"><div class="sig-line"></div><p>${t('pg.reception.billing.invoiceSignature')}</p></div>
      </div>`;
    printDocument('Invoice', body);
  };

  const billColumns = [
    { key: 'description', label: t('pg.reception.billing.colDescription'), render: (v, row) => <Input name="desc" value={v} onChange={(e) => updateItem(row.id, 'description', e.target.value)} placeholder={t('pg.reception.billing.itemDescriptionPlaceholder')} /> },
    { key: 'quantity', label: t('pg.reception.billing.colQty'), render: (v, row) => <Input name="qty" type="number" value={v} onChange={(e) => updateItem(row.id, 'quantity', Number(e.target.value))} min="1" /> },
    { key: 'rate', label: t('pg.reception.billing.colRate'), render: (v, row) => <Input name="rate" type="number" value={v} onChange={(e) => updateItem(row.id, 'rate', Number(e.target.value))} /> },
    { key: 'amount', label: t('pg.reception.billing.colAmount'), render: (v) => <span>₹{(v || 0).toFixed(2)}</span> },
    {
      key: 'remove',
      label: '',
      render: (_, row) => <button className="remove-btn" onClick={() => removeItem(row.id)}>✕</button>,
    },
  ];

  const recentBillColumns = [
    { key: 'billId', label: t('pg.reception.billing.colBillId') },
    { key: 'patientId', label: t('pg.reception.billing.colPatient') },
    { key: 'date', label: t('pg.reception.billing.colDate') },
    { key: 'grandTotal', label: t('pg.reception.billing.colAmount'), render: (v) => `₹${(v ?? 0).toFixed(2)}` },
    { key: 'paymentMethod', label: t('pg.reception.billing.colPayment'), render: (v) => v || '—' },
    { key: 'status', label: t('pg.reception.billing.colStatus'), render: (v) => <span className={`status-badge status-${v}`}>{v}</span> },
  ];

  if (billGenerated) {
    return (
      <div className="page billing-page">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>{t('pg.reception.billing.generatedTitle')}</h2>
          <p className="patient-id-display">{t('pg.reception.billing.billIdLabel')} <strong>{generatedBill?.billId}</strong></p>
          <div className="bill-summary-card">
            <p>{t('pg.reception.billing.patientLabel')} {selectedPatient?.name}</p>
            <p>{t('pg.reception.billing.totalLabel')} ₹{(generatedBill?.grandTotal ?? 0).toFixed(2)}</p>
            <p>{t('pg.reception.billing.paymentMethodColon')} {paymentMethod}</p>
          </div>
          <div className="success-actions">
            <Button onClick={handlePrintBill}>🖨️ {t('pg.reception.billing.printBtn')}</Button>
            <Button variant="outline" onClick={() => { setBillGenerated(false); setGeneratedBill(null); setBillItems([]); setSelectedPatient(null); setSearchQuery(''); setDiscount(0); load(); }}>{t('pg.reception.billing.generateAnotherBtn')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page billing-page">
      <div className="page-header"><h1>{t('pg.reception.billing.title')}</h1></div>

      {error && <p className="text-error">{error}</p>}

      <div className="billing-search">
        <Select
          label={t('pg.reception.billing.selectPatient')}
          name="patientSelect"
          value={selectedPatient ? String(selectedPatient.id) : ''}
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedPatient(patients.find((p) => p.id === id) || null);
          }}
          placeholder={t('pg.reception.billing.selectPatientPlaceholder')}
          options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.patientId || p.id})` }))}
        />
        <div className="billing-search-alt">
          <Input name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('pg.reception.billing.searchPlaceholder')} />
          <Button onClick={handleSearch}>🔍 {t('pg.reception.billing.searchBtn')}</Button>
        </div>
      </div>

      {selectedPatient && (
        <Card title={t('pg.reception.billing.patientInfoTitle')}>
          <div className="billing-patient-info">
            <div><label>{t('pg.reception.billing.infoName')}</label><p>{selectedPatient.name}</p></div>
            <div><label>{t('pg.reception.billing.infoPatientId')}</label><p>{selectedPatient.patientId || selectedPatient.id}</p></div>
            <div><label>{t('pg.reception.billing.infoPhone')}</label><p>{selectedPatient.phone}</p></div>
            <div><label>{t('pg.reception.billing.infoBloodGroup')}</label><p>{selectedPatient.bloodGroup}</p></div>
          </div>
        </Card>
      )}

      <Card title={t('pg.reception.billing.billItemsTitle')} actions={<Button variant="outline" size="sm" icon="➕" onClick={addItem}>{t('pg.reception.billing.addItemBtn')}</Button>}>
        {billItems.length === 0 ? (
          <p className="text-muted">{t('pg.reception.billing.noItems')}</p>
        ) : (
          <div className="bill-items-table">
            <DataTable columns={billColumns} data={billItems} />
          </div>
        )}
      </Card>

      <div className="billing-bottom">
        <Card title={t('pg.reception.billing.paymentDetailsTitle')}>
          <div className="billing-form">
            <Input label={t('pg.reception.billing.discountLabel')} name="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} helperText={discountType === 'percent' ? t('pg.reception.billing.discountPercentHelper') : t('pg.reception.billing.discountFixedHelper')} />
            <Select label={t('pg.reception.billing.discountTypeLabel')} name="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value)} options={[{ value: 'fixed', label: t('pg.reception.billing.optFixed') }, { value: 'percent', label: t('pg.reception.billing.optPercent') }]} />
            <Input label={t('pg.reception.billing.taxLabel')} name="tax" type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
            <Select label={t('pg.reception.billing.paymentMethodLabel')} name="payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={[{ value: 'Cash', label: t('pg.reception.billing.optCash') }, { value: 'Card', label: t('pg.reception.billing.optCard') }, { value: 'UPI', label: t('pg.reception.billing.optUpi') }, { value: 'Insurance', label: t('pg.reception.billing.optInsurance') }]} />
            <Textarea label={t('pg.reception.billing.notesLabel')} name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('pg.reception.billing.notesPlaceholder')} />
          </div>
        </Card>

        <Card title={t('pg.reception.billing.summaryTitle')}>
          <div className="bill-summary">
            <div className="summary-row"><span>{t('pg.reception.billing.subtotal')}</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('pg.reception.billing.discount')}</span><span className="text-success">-₹{discountAmt.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('pg.reception.billing.tax')} ({tax}%)</span><span>₹{taxAmt.toFixed(2)}</span></div>
            <div className="summary-row total"><span>{t('pg.reception.billing.grandTotal')}</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </div>
          <Button size="lg" onClick={generateBill} disabled={!selectedPatient || billItems.length === 0 || generating}>
            {generating ? '...' : t('pg.reception.billing.generateBtn')}
          </Button>
          {(!selectedPatient || billItems.length === 0) && (
            <p className="text-muted" style={{ marginTop: 8 }}>
              {!selectedPatient ? t('pg.reception.billing.generateHintPatient') : t('pg.reception.billing.generateHintItems')}
            </p>
          )}
        </Card>
      </div>

      <Card title={t('pg.reception.billing.recentBillsTitle')}>
        {loadingPatients ? <Loader /> : <DataTable columns={recentBillColumns} data={recentBills} />}
      </Card>
    </div>
  );
};

export default Billing;
