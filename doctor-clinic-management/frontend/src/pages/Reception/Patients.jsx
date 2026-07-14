import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { patients } from '../../utils/mockData';
import { calculateAge, formatDate, paginate } from '../../utils/helpers';
import './Patients.css';

const Patients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading] = useState(false);
  const perPage = 10;

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
    const matchesGender = !genderFilter || p.gender === genderFilter;
    const matchesBlood = !bloodFilter || p.bloodGroup === bloodFilter;
    return matchesSearch && matchesGender && matchesBlood;
  });

  const { items, totalPages, currentPage } = paginate(filtered, page, perPage);

  const columns = [
    { key: 'id', label: 'Patient ID', render: (v) => <span className="patient-id">{v}</span> },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age', render: (_, row) => calculateAge(row.dob) },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'registeredDate', label: 'Registered', render: (v) => formatDate(v) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="View" onClick={(e) => { e.stopPropagation(); setSelectedPatient(row); }}>👁️</button>
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); }}>✏️</button>
          <button className="icon-btn" title="Book Appointment" onClick={(e) => { e.stopPropagation(); navigate('/reception/appointments', { state: { patientId: row.id, patientName: row.name } }); }}>📅</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page patients-page">
      <div className="page-header">
        <h1>Patients</h1>
        <Link to="/reception/register-patient"><Button icon="➕">Register New Patient</Button></Link>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <span>🔍</span>
          <Input name="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, ID or phone..." />
        </div>
        <Select name="gender" value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }} placeholder="All Genders" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
        <Select name="blood" value={bloodFilter} onChange={(e) => { setBloodFilter(e.target.value); setPage(1); }} placeholder="All Blood Groups" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))} />
      </div>

      <Card>
        <DataTable columns={columns} data={items} onRowClick={setSelectedPatient} loading={loading} emptyMessage="No patients found" />
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </Card>

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Details" size="lg">
        {selectedPatient && (
          <div className="patient-detail-modal">
            <div className="patient-detail-header">
              <div className="patient-detail-avatar">{selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
              <div>
                <h3>{selectedPatient.name}</h3>
                <p className="text-muted">{selectedPatient.id} | {selectedPatient.gender} | {calculateAge(selectedPatient.dob)} yrs</p>
                <p className="text-muted">Blood Group: {selectedPatient.bloodGroup}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div><label>Phone</label><p>{selectedPatient.phone}</p></div>
              <div><label>Email</label><p>{selectedPatient.email || '-'}</p></div>
              <div><label>Date of Birth</label><p>{selectedPatient.dob}</p></div>
              <div><label>Registered</label><p>{formatDate(selectedPatient.registeredDate)}</p></div>
              <div><label>Address</label><p>{selectedPatient.address.street}, {selectedPatient.address.city}, {selectedPatient.address.state} - {selectedPatient.address.pincode}</p></div>
              <div><label>Emergency Contact</label><p>{selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation}) - {selectedPatient.emergencyContact.phone}</p></div>
              <div><label>Insurance</label><p>{selectedPatient.insurance.provider || 'N/A'} {selectedPatient.insurance.policyNo ? `(${selectedPatient.insurance.policyNo})` : ''}</p></div>
              <div><label>Allergies</label><p>{selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'None'}</p></div>
            </div>
            <div className="detail-actions">
              <Button onClick={() => navigate('/reception/appointments', { state: { patientId: selectedPatient.id, patientName: selectedPatient.name } })}>Book Appointment</Button>
              <Button variant="outline">Edit Patient</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
