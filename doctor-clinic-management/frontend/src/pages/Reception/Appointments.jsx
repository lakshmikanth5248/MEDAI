import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Select, Input } from '../../components/Forms';
import { DataTable } from '../../components/Tables';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Reception.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Appointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p, d] = await Promise.all([
        clinicalApi.getAppointments(), clinicalApi.getPatients(), clinicalApi.getDoctors(),
      ]);
      setAppointments(a);
      setPatients(p);
      setDoctors(d);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const STATUS_OPTIONS = [
    { value: '', label: t('pg.reception.appointments.statusAll') },
    { value: 'scheduled', label: t('pg.reception.appointments.statusScheduled') },
    { value: 'confirmed', label: t('pg.reception.appointments.statusConfirmed') },
    { value: 'completed', label: t('pg.reception.appointments.statusCompleted') },
    { value: 'cancelled', label: t('pg.reception.appointments.statusCancelled') },
  ];

  const patientName = (id) => patients.find((p) => p.id === id)?.name || t('pg.reception.appointments.unknown');
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || t('pg.reception.appointments.unknown');

  const filtered = appointments.filter((a) => {
    const matchStatus = !status || a.status === status;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      patientName(a.patientId).toLowerCase().includes(q) ||
      doctorName(a.doctorId).toLowerCase().includes(q) ||
      (a.department || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const columns = [
    { key: 'date', label: t('pg.reception.appointments.colDate'), render: (v) => formatDate(v) },
    { key: 'time', label: t('pg.reception.appointments.colTime') },
    { key: 'patient', label: t('pg.reception.appointments.colPatient'), render: (_, r) => patientName(r.patientId) },
    { key: 'doctor', label: t('pg.reception.appointments.colDoctor'), render: (_, r) => doctorName(r.doctorId) },
    { key: 'department', label: t('pg.reception.appointments.colDepartment') },
    { key: 'type', label: t('pg.reception.appointments.colType') },
    {
      key: 'status',
      label: t('pg.reception.appointments.colStatus'),
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>{t('pg.reception.appointments.title')}</h1>
        <p className="text-muted">{t('pg.reception.appointments.subtitle')}</p>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="rec-filters">
        <Select name="status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.reception.appointments.searchPlaceholder')} />
        <span className="text-muted">{sorted.length} {t('pg.reception.appointments.appointment')}{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <Card title={t('pg.reception.appointments.allTitle')}>
        {loading ? <Loader /> : <DataTable columns={columns} data={sorted} emptyMessage={t('pg.reception.appointments.empty')} />}
      </Card>
    </div>
  );
};

export default Appointments;
