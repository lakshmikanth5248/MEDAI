import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Select, Input } from '../../components/Forms';
import { DataTable } from '../../components/Tables';
import { appointments, patients, doctors } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Reception.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Appointments = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const patientName = (id) => patients.find((p) => p.id === id)?.name || 'Unknown';
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  const filtered = appointments.filter((a) => {
    const matchStatus = !status || a.status === status;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      patientName(a.patientId).toLowerCase().includes(q) ||
      doctorName(a.doctorId).toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const columns = [
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'time', label: 'Time' },
    { key: 'patient', label: 'Patient', render: (_, r) => patientName(r.patientId) },
    { key: 'doctor', label: 'Doctor', render: (_, r) => doctorName(r.doctorId) },
    { key: 'department', label: 'Department' },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>Appointments</h1>
        <p className="text-muted">View and manage patient appointments across all departments.</p>
      </div>

      <div className="rec-filters">
        <Select name="status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, doctor or department..." />
        <span className="text-muted">{sorted.length} appointment{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <Card title="All Appointments">
        <DataTable columns={columns} data={sorted} emptyMessage="No appointments found" />
      </Card>
    </div>
  );
};

export default Appointments;
