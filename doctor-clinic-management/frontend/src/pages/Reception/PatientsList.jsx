import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Input } from '../../components/Forms';
import { DataTable } from '../../components/Tables';
import { patients } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';
import './Reception.css';

const PatientsList = () => {
  const [search, setSearch] = useState('');

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'registeredDate', label: 'Registered', render: (v) => formatDate(v) },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>Patients</h1>
        <p className="text-muted">Search and manage all registered patient records.</p>
      </div>

      <div className="rec-list-header">
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, phone or email..."
        />
        <span className="text-muted">{filtered.length} patient{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      <Card title="Patient Records">
        <DataTable columns={columns} data={filtered} emptyMessage="No patients found" />
      </Card>
    </div>
  );
};

export default PatientsList;
