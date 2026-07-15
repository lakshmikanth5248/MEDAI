import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/Forms';
import { currentDoctor, appointments, patients } from '../../utils/mockData';
import { getInitials, calculateAge } from '../../utils/helpers';
import './Patients.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Patients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const doctorPatientIds = [...new Set(
    appointments.filter((a) => a.doctorId === currentDoctor.id).map((a) => a.patientId)
  )];

  const doctorPatients = patients.filter((p) => doctorPatientIds.includes(p.id));

  const filtered = doctorPatients.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div className="page doctor-patients">
      <div className="page-header">
        <h1>{t('pg.doctor.patients.myPatients')}</h1>
        <div className="patients-search">
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.doctor.patients.searchPlaceholder')} />
        </div>
      </div>

      <div className="patients-grid">
        {filtered.map((patient) => (
          <div key={patient.id} className="patient-card" onClick={() => navigate(`/doctor/patient/${patient.id}`)}>
            <div className="patient-card-avatar">{getInitials(patient.name)}</div>
            <div className="patient-card-info">
              <h4>{patient.name}</h4>
              <p className="text-muted">{patient.patientId} | {calculateAge(patient.dob)} yrs | {patient.gender}</p>
              <p className="text-muted">{patient.bloodGroup} | {patient.phone}</p>
            </div>
            <div className="patient-card-actions">
              <button className="btn-action" onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient.id}`); }} title={t('pg.doctor.patients.viewDetails')}>👤</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>{t('pg.doctor.patients.noPatients')}</p>
        )}
      </div>
    </div>
  );
};

export default Patients;
