import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Loader } from '../../components/Loader';
import * as coreApi from '../../services/api/core';
import { getErrorMessage } from '../../services/apiError';
import './Reports.css';
import { useTranslation } from '../../i18n/LanguageContext';

const inRange = (dateStr, from, to) => {
  if (!dateStr) return true;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
};

const Reports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('patient');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, d, a, b, rx] = await Promise.all([
        coreApi.getReport('patient'),
        coreApi.getReport('doctor'),
        coreApi.getReport('appointment'),
        coreApi.getReport('financial'),
        coreApi.getReport('prescription'),
      ]);
      setPatients(p?.patients || []);
      setDoctors(d?.doctors || []);
      setAppointments(a?.appointments || []);
      setBills(b?.bills || []);
      setPrescriptions(rx?.prescriptions || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabs = [
    { key: 'patient', label: t('reports.tabPatient') },
    { key: 'doctor', label: t('reports.tabDoctor') },
    { key: 'appointment', label: t('reports.tabAppointment') },
    { key: 'financial', label: t('reports.tabFinancial') },
    { key: 'prescription', label: t('reports.tabPrescription') },
  ];

  const filteredAppointments = appointments.filter((a) => inRange(a.date, dateFrom, dateTo));
  const filteredBills = bills.filter((b) => inRange(b.date, dateFrom, dateTo));
  const filteredPrescriptions = prescriptions.filter((p) => inRange(p.date, dateFrom, dateTo));

  const paidBills = filteredBills.filter((b) => b.status === 'paid');
  const totalRevenue = paidBills.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalPending = filteredBills.filter((b) => b.status === 'pending').length;

  const renderSummary = () => {
    switch (activeTab) {
      case 'patient':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{patients.length}</span><span>{t('reports.totalPatients')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter((p) => p.gender === 'male').length}</span><span>Male</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter((p) => p.gender === 'female').length}</span><span>Female</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter((p) => p.insurance?.provider).length}</span><span>{t('reports.insured')}</span></div>
          </div>
        );
      case 'doctor':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{doctors.length}</span><span>{t('reports.totalDoctors')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{doctors.filter((d) => d.status === 'active').length}</span><span>{t('common.active')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{doctors.length ? Math.round((doctors.reduce((s, d) => s + (d.rating || 0), 0) / doctors.length) * 10) / 10 : 0}</span><span>{t('reports.avgRating')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{doctors.length ? Math.round(doctors.reduce((s, d) => s + (d.experience || 0), 0) / doctors.length) : 0}</span><span>{t('reports.avgExperience')}</span></div>
          </div>
        );
      case 'appointment':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{filteredAppointments.length}</span><span>{t('reports.totalAppointments')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredAppointments.filter((a) => a.status === 'completed').length}</span><span>{t('reports.completed')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredAppointments.filter((a) => a.status === 'cancelled').length}</span><span>{t('reports.cancelled')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredAppointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status)).length}</span><span>{t('reports.upcoming')}</span></div>
          </div>
        );
      case 'financial':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">₹{totalRevenue.toLocaleString()}</span><span>{t('reports.totalRevenue')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">₹{paidBills.length ? (totalRevenue / paidBills.length).toFixed(0) : 0}</span><span>{t('reports.avgPerBill')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{totalPending}</span><span>{t('reports.pendingPayments')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredBills.length}</span><span>{t('reports.totalBills')}</span></div>
          </div>
        );
      case 'prescription':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{filteredPrescriptions.length}</span><span>{t('reports.totalPrescriptions')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredPrescriptions.filter((p) => p.status === 'dispensed').length}</span><span>{t('sidebar.dispensed')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredPrescriptions.filter((p) => p.status === 'active' || p.status === 'pending').length}</span><span>{t('reports.pending')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{filteredPrescriptions.reduce((s, p) => s + (p.medicines?.length || 0), 0)}</span><span>{t('reports.totalMedicines')}</span></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page reports-page">
      <div className="page-header">
        <h1>{t('reports.title')}</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="report-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`report-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="report-controls">
        <div className="report-date-range">
          <label>{t('reports.from')}</label>
          <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 180 }} />
          <label>{t('reports.to')}</label>
          <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 180 }} />
        </div>
        <div className="report-actions">
          <Button icon="🔄" onClick={load}>{t('reports.generateReport')}</Button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <Card title={`${tabs.find((x) => x.key === activeTab)?.label} ${t('reports.summary')}`}>
          {renderSummary()}
        </Card>
      )}
    </div>
  );
};

export default Reports;
