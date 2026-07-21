import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getStatusBadgeClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';

export default function TodayAppointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [todayAppts, doctorPatients] = await Promise.all([
        clinicalApi.getTodayAppointments({ doctorId: user.id }),
        clinicalApi.getDoctorPatients(user.id),
      ]);
      const patientNameById = new Map(doctorPatients.map((p) => [p.id, p.name]));
      setAppts(todayAppts.map((a) => ({ ...a, patientName: patientNameById.get(a.patientId) || 'Unknown' })));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load today\'s appointments'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, status) => {
    setActionId(id);
    setError('');
    try {
      await clinicalApi.updateAppointmentStatus(id, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update appointment'));
    } finally {
      setActionId(null);
    }
  };

  const columns = [
    { key: 'time', label: t('pg.doctor.dashboard.colTime') },
    { key: 'patientName', label: t('pg.doctor.dashboard.colPatient') },
    { key: 'department', label: t('pg.doctor.consultations.colDepartment') },
    { key: 'type', label: t('pg.doctor.consultations.colType') },
    {
      key: 'status',
      label: t('pg.doctor.dashboard.colStatus'),
      render: (v) => <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => {
        const status = row.status?.toLowerCase();
        const busy = actionId === row.id;
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {status === 'scheduled' && (
              <Button size="sm" variant="outline" disabled={busy} onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'confirmed'); }}>{t('common.confirm')}</Button>
            )}
            {status === 'confirmed' && (
              <Button size="sm" variant="outline" disabled={busy} onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'arrived'); }}>{t('pg.doctor.todayAppointments.arrived', 'Arrived')}</Button>
            )}
            {['scheduled', 'confirmed', 'arrived'].includes(status) && (
              <Button size="sm" disabled={busy} onClick={(e) => { e.stopPropagation(); navigate(`/doctor/consultation/${row.id}`); }}>{t('pg.doctor.dashboard.startConsultation')}</Button>
            )}
            {['scheduled', 'confirmed', 'arrived'].includes(status) && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'cancelled'); }}>{t('common.cancel')}</Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page doctor-today-appointments">
      <div className="page-header">
        <h1>{t('sidebar.todayAppointments')}</h1>
        <p className="text-muted">{t('pg.doctor.todayAppointments.subtitle')}</p>
      </div>

      {error && <p className="text-error">{error}</p>}

      <Card title={t('sidebar.todayAppointments')} subtitle={`${appts.length} ${t('pg.doctor.consultations.total')}`}>
        <DataTable
          columns={columns}
          data={appts}
          loading={loading}
          onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)}
          emptyMessage={t('pg.doctor.consultations.noConsultations')}
        />
      </Card>
    </div>
  );
}
