import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Select } from '../../components/Forms';
import { patients, doctors, appointments, prescriptions, bills } from '../../utils/mockData';
import './Reports.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Reports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('patient');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const tabs = [
    { key: 'patient', label: t('pg.admin.reports.tabPatient') },
    { key: 'doctor', label: t('pg.admin.reports.tabDoctor') },
    { key: 'appointment', label: t('pg.admin.reports.tabAppointment') },
    { key: 'financial', label: t('pg.admin.reports.tabFinancial') },
    { key: 'prescription', label: t('pg.admin.reports.tabPrescription') },
  ];

  const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalPending = bills.filter((b) => b.status === 'Pending').length;

  const renderSummary = () => {
    switch (activeTab) {
      case 'patient':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{patients.length}</span><span>{t('pg.admin.reports.totalPatients')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.gender === 'Male').length}</span><span>Male</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.gender === 'Female').length}</span><span>Female</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.insurance?.provider).length}</span><span>{t('pg.admin.reports.insured')}</span></div>
          </div>
        );
      case 'doctor':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{doctors.length}</span><span>{t('pg.admin.reports.totalDoctors')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{doctors.filter(d => d.availability).length}</span><span>{t('common.active')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{Math.round(doctors.reduce((s, d) => s + d.rating, 0) / doctors.length * 10) / 10}</span><span>{t('pg.admin.reports.avgRating')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{Math.round(doctors.reduce((s, d) => s + d.experience, 0) / doctors.length)}</span><span>{t('pg.admin.reports.avgExperience')}</span></div>
          </div>
        );
      case 'appointment':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{appointments.length}</span><span>{t('pg.admin.reports.totalAppointments')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => a.status === 'completed').length}</span><span>{t('pg.admin.reports.completed')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => a.status === 'cancelled').length}</span><span>{t('pg.admin.reports.cancelled')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}</span><span>{t('pg.admin.reports.upcoming')}</span></div>
          </div>
        );
      case 'financial':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">₹{totalRevenue.toLocaleString()}</span><span>{t('pg.admin.reports.totalRevenue')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">₹{(totalRevenue / bills.length).toFixed(0)}</span><span>{t('pg.admin.reports.avgPerBill')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{totalPending}</span><span>{t('pg.admin.reports.pendingPayments')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{bills.length}</span><span>{t('pg.admin.reports.totalBills')}</span></div>
          </div>
        );
      case 'prescription':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.length}</span><span>{t('pg.admin.reports.totalPrescriptions')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.filter(p => p.status === 'dispensed').length}</span><span>{t('sidebar.dispensed')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.filter(p => p.status === 'active').length}</span><span>{t('pg.admin.reports.pending')}</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.reduce((s, p) => s + p.medicines.length, 0)}</span><span>{t('pg.admin.reports.totalMedicines')}</span></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page reports-page">
      <div className="page-header">
        <h1>{t('pg.admin.reports.title')}</h1>
      </div>

      <div className="report-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`report-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="report-controls">
        <div className="report-date-range">
          <label>{t('pg.admin.reports.from')}</label>
          <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 180 }} />
          <label>{t('pg.admin.reports.to')}</label>
          <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 180 }} />
        </div>
        <div className="report-actions">
          <Button icon="📊">{t('pg.admin.reports.generateReport')}</Button>
          <Button variant="outline" icon="📄">{t('pg.admin.reports.pdf')}</Button>
          <Button variant="outline" icon="📗">{t('pg.admin.reports.excel')}</Button>
        </div>
      </div>

      <Card title={`${tabs.find((x) => x.key === activeTab)?.label} ${t('pg.admin.reports.summary')}`}>
        {renderSummary()}
      </Card>

      <div className="report-charts">
        <Card title={t('pg.admin.reports.chartTrend')} className="chart-card"><div className="chart-placeholder"><div className="chart-line"></div></div></Card>
        <Card title={t('pg.admin.reports.chartDistribution')} className="chart-card"><div className="chart-placeholder"><div className="chart-pie"></div></div></Card>
      </div>
    </div>
  );
};

export default Reports;
