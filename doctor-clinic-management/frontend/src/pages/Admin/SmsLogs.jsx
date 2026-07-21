import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, Textarea } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import * as notificationsApi from '../../services/api/notifications';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import './SMSLogs.css';

const TEMPLATES = {
  reminder: (name) => `Hi ${name}, this is a reminder about your upcoming appointment.`,
  prescription: (name) => `Hi ${name}, a new prescription has been issued for you.`,
  bill: (name) => `Hi ${name}, your bill is ready. Please check the reception desk.`,
  custom: () => '',
};

const SMSLogs = () => {
  const [smsLogs, setSmsLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sendModal, setSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendForm, setSendForm] = useState({ patientId: '', template: '', message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [logs, pts] = await Promise.all([notificationsApi.getSmsLogs(), clinicalApi.getPatients()]);
      setSmsLogs(logs);
      setPatients(pts);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load SMS logs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = smsLogs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.recipient.toLowerCase().includes(q) || s.phone.includes(q) || (s.type || '').toLowerCase().includes(q);
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
    { key: 'status', label: 'Status', render: (v) => <span className={`status-badge status-${v}`}>{v}</span> },
    { key: 'message', label: 'Message', render: (v) => <div className="sms-preview">{(v || '').slice(0, 60)}...</div> },
  ];

  const selectedPatient = patients.find((p) => String(p.id) === String(sendForm.patientId));

  const applyTemplate = (template) => {
    const message = selectedPatient ? TEMPLATES[template]?.(selectedPatient.name) || '' : '';
    setSendForm((prev) => ({ ...prev, template, message }));
  };

  const handleSend = async () => {
    if (!selectedPatient || !sendForm.message) return;
    setSending(true);
    setError('');
    try {
      const log = await notificationsApi.sendSms({
        recipient: selectedPatient.name, phone: selectedPatient.phone,
        patientId: selectedPatient.id, type: sendForm.template, message: sendForm.message,
      });
      setSmsLogs((prev) => [log, ...prev]);
      setSendModal(false);
      setSendForm({ patientId: '', template: '', message: '' });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send SMS'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page sms-logs-page">
      <div className="page-header">
        <h1>SMS Communication Logs</h1>
        <Button icon="✉️" onClick={() => setSendModal(true)}>Send SMS</Button>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="sms-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by recipient, phone or type..." />
        <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All Status" options={[{ value: 'sent', label: 'Sent' }, { value: 'failed', label: 'Failed' }, { value: 'pending', label: 'Pending' }]} />
        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 160 }} />
      </div>

      <Card>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} emptyMessage="No SMS logs found" />}
      </Card>

      <Modal isOpen={sendModal} onClose={() => setSendModal(false)} title="Send SMS" size="md">
        <div className="sms-send-form">
          <Select
            label="Recipient" name="recipient" value={sendForm.patientId}
            onChange={(e) => setSendForm((p) => ({ ...p, patientId: e.target.value }))}
            placeholder="Select patient"
            options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
          />
          <Select
            label="Message Template" name="template" value={sendForm.template}
            onChange={(e) => applyTemplate(e.target.value)}
            placeholder="Select template"
            options={[
              { value: 'reminder', label: 'Appointment Reminder' },
              { value: 'prescription', label: 'Prescription Alert' },
              { value: 'bill', label: 'Bill Notification' },
              { value: 'custom', label: 'Custom Message' },
            ]}
          />
          <Textarea
            label="Message" name="message" value={sendForm.message}
            onChange={(e) => setSendForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Type your message..." rows={4}
          />
          <div className="sms-send-actions">
            <Button onClick={handleSend} disabled={sending || !selectedPatient || !sendForm.message}>{sending ? 'Sending...' : 'Send SMS'}</Button>
            <Button variant="secondary" onClick={() => setSendModal(false)} disabled={sending}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SMSLogs;
