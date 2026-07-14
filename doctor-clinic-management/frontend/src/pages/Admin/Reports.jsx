import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Select } from '../../components/Forms';
import { patients, doctors, appointments, prescriptions, bills } from '../../utils/mockData';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('patient');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const tabs = [
    { key: 'patient', label: 'Patient Reports' },
    { key: 'doctor', label: 'Doctor Reports' },
    { key: 'appointment', label: 'Appointment Reports' },
    { key: 'financial', label: 'Financial Reports' },
    { key: 'prescription', label: 'Prescription Reports' },
  ];

  const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalPending = bills.filter((b) => b.status === 'Pending').length;

  const renderSummary = () => {
    switch (activeTab) {
      case 'patient':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{patients.length}</span><span>Total Patients</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.gender === 'Male').length}</span><span>Male</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.gender === 'Female').length}</span><span>Female</span></div>
            <div className="report-summary-card"><span className="rsc-value">{patients.filter(p => p.insurance.provider).length}</span><span>Insured</span></div>
          </div>
        );
      case 'doctor':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{doctors.length}</span><span>Total Doctors</span></div>
            <div className="report-summary-card"><span className="rsc-value">{doctors.filter(d => d.status === 'Active').length}</span><span>Active</span></div>
            <div className="report-summary-card"><span className="rsc-value">{Math.round(doctors.reduce((s, d) => s + d.rating, 0) / doctors.length * 10) / 10}</span><span>Avg Rating</span></div>
            <div className="report-summary-card"><span className="rsc-value">{Math.round(doctors.reduce((s, d) => s + d.experience, 0) / doctors.length)}</span><span>Avg Experience</span></div>
          </div>
        );
      case 'appointment':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{appointments.length}</span><span>Total Appointments</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => a.status === 'Completed').length}</span><span>Completed</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => a.status === 'Cancelled').length}</span><span>Cancelled</span></div>
            <div className="report-summary-card"><span className="rsc-value">{appointments.filter(a => ['Scheduled', 'Confirmed'].includes(a.status)).length}</span><span>Upcoming</span></div>
          </div>
        );
      case 'financial':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">₹{totalRevenue.toLocaleString()}</span><span>Total Revenue</span></div>
            <div className="report-summary-card"><span className="rsc-value">₹{(totalRevenue / bills.length).toFixed(0)}</span><span>Avg per Bill</span></div>
            <div className="report-summary-card"><span className="rsc-value">{totalPending}</span><span>Pending Payments</span></div>
            <div className="report-summary-card"><span className="rsc-value">{bills.length}</span><span>Total Bills</span></div>
          </div>
        );
      case 'prescription':
        return (
          <div className="report-summary-grid">
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.length}</span><span>Total Prescriptions</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.filter(p => p.status === 'Dispensed').length}</span><span>Dispensed</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.filter(p => p.status === 'Pending').length}</span><span>Pending</span></div>
            <div className="report-summary-card"><span className="rsc-value">{prescriptions.reduce((s, p) => s + p.medicines.length, 0)}</span><span>Total Medicines</span></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page reports-page">
      <div className="page-header">
        <h1>Reports</h1>
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
          <label>From:</label>
          <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 180 }} />
          <label>To:</label>
          <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 180 }} />
        </div>
        <div className="report-actions">
          <Button icon="📊">Generate Report</Button>
          <Button variant="outline" icon="📄">PDF</Button>
          <Button variant="outline" icon="📗">Excel</Button>
        </div>
      </div>

      <Card title={`${tabs.find((t) => t.key === activeTab)?.label} Summary`}>
        {renderSummary()}
      </Card>

      <div className="report-charts">
        <Card title="Trend" className="chart-card"><div className="chart-placeholder"><div className="chart-line"></div></div></Card>
        <Card title="Distribution" className="chart-card"><div className="chart-placeholder"><div className="chart-pie"></div></div></Card>
      </div>
    </div>
  );
};

export default Reports;
