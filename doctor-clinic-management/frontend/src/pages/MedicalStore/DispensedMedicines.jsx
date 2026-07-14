import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { DataTable } from '../../components/Tables';
import { Input } from '../../components/Forms';
import { prescriptions } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './DispensedMedicines.css';

const DispensedMedicines = () => {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const dispensed = prescriptions.filter((p) => p.status === 'Dispensed');

  const filtered = dispensed.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.patientName.toLowerCase().includes(q) || p.doctorName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const d = new Date(p.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from && d < from) return false;
    if (to && d > new Date(to.setHours(23, 59, 59))) return false;
    return matchSearch;
  });

  const columns = [
    { key: 'id', label: 'Prescription ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'date', label: 'Date Dispensed', render: (v) => formatDate(v) },
    { key: 'medicines', label: 'Items', render: (v) => v.length },
    {
      key: 'totalCost',
      label: 'Total Cost',
      render: () => '₹' + (Math.floor(Math.random() * 500) + 100).toFixed(2),
    },
    { key: 'storeName', label: 'Dispensed By' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="icon-btn" title="View">👁️</button>
      ),
    },
  ];

  return (
    <div className="page dispensed-page">
      <div className="page-header">
        <h1>Dispensed Medicines</h1>
      </div>

      <div className="dispensed-filters">
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 180 }} />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No dispensed records found" />
      </Card>
    </div>
  );
};

export default DispensedMedicines;
