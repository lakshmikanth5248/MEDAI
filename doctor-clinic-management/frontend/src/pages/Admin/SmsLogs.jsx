import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, Textarea } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { smsLogs, patients } from '../../utils/mockData';
import './SMSLogs.css';

const SMSLogs = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sendModal, setSendModal] = useState(false);

  const filtered = smsLogs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.recipient.toLowerCase().includes(q) || s.phone.includes(q) || s.type.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    const d = new Date(s.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from && d < from) return false;
    if (to && d > new Date(to.setHours(23, 59, 59))) return false;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'date', label: 'Date/Time', render: (v) => <span style={{ fontSize: 'var(--font-size-xs)' }}>{v}</span> },
    { key: 'recipient', label: 'Recipient', render: (v, row) => <div><div>{v}</div><div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{row.phone}</div></div> },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`status-badge status-${v.toLowerCase()}`}>{v}</span>,
    },
    { key: 'message', label: 'Message', render: (v) => <div className="sms-preview">{v.slice(0, 60)}...</div> },
  ];

  return (
    <div className="page sms-logs-page">
      <div className="page-header">
        <h1>SMS Communication Logs</h1>
        <Button icon="✉️" onClick={() => setSendModal(true)}>Send SMS</Button>
      </div>

      <div className="sms-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by recipient, phone or type..." />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'Sent', label: 'Sent' }, { value: 'Failed', label: 'Failed' }, { value: 'Pending', label: 'Pending' }]} />
        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 160 }} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No SMS logs found" />
      </Card>

      <Modal isOpen={sendModal} onClose={() => setSendModal(false)} title="Send SMS" size="md">
        <div className="sms-send-form">
          <Select label="Recipient" name="recipient" value="" onChange={() => {}} placeholder="Select patient" options={patients.map((p) => ({ value: p.phone, label: `${p.name} (${p.phone})` }))} />
          <Select label="Message Template" name="template" value="" onChange={() => {}} placeholder="Select template" options={[
            { value: 'reminder', label: 'Appointment Reminder' },
            { value: 'prescription', label: 'Prescription Alert' },
            { value: 'bill', label: 'Bill Notification' },
            { value: 'custom', label: 'Custom Message' },
          ]} />
          <Textarea label="Message" name="message" value="" onChange={() => {}} placeholder="Type your message..." rows={4} />
          <div className="sms-send-actions">
            <Button onClick={() => setSendModal(false)}>Send SMS</Button>
            <Button variant="secondary" onClick={() => setSendModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SMSLogs;
