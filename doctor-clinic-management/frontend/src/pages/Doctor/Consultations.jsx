import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getStatusBadgeClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import './Consultations.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Consultations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = resolveProfile(user) || {};

  const [doctorAppts, setDoctorAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [appts, doctorPatients] = await Promise.all([
        clinicalApi.getAppointments({ doctorId: user.id }),
        clinicalApi.getDoctorPatients(user.id),
      ]);
      const patientNameById = new Map(doctorPatients.map((p) => [p.id, p.name]));
      const withNames = appts
        .map((a) => ({ ...a, patientName: patientNameById.get(a.patientId) || 'Unknown' }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      setDoctorAppts(withNames);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load consultations'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'date', label: t('pg.doctor.consultations.colDate') },
    { key: 'time', label: t('pg.doctor.consultations.colTime') },
    { key: 'patientName', label: t('pg.doctor.consultations.colPatient') },
    { key: 'department', label: t('pg.doctor.consultations.colDepartment') },
    { key: 'type', label: t('pg.doctor.consultations.colType') },
    {
      key: 'status',
      label: t('pg.doctor.consultations.colStatus'),
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/doctor/consultation/${row.id}`);
          }}
        >
          {t('pg.doctor.consultations.startConsultation')}
        </Button>
      ),
    },
  ];

  return (
    <div className="page doctor-consultations-page">
      <div className="page-header">
        <h1>{t('pg.doctor.consultations.title')}</h1>
        <p className="text-muted">{t('pg.doctor.consultations.assignedTo')} {profile.name}</p>
      </div>

      {error && <p className="text-error">{error}</p>}

      <Card title={t('pg.doctor.consultations.history')} subtitle={`${doctorAppts.length} ${t('pg.doctor.consultations.total')}`}>
        <DataTable
          columns={columns}
          data={doctorAppts}
          loading={loading}
          onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)}
          emptyMessage={t('pg.doctor.consultations.noConsultations')}
        />
      </Card>
    </div>
  );
};

export default Consultations;
