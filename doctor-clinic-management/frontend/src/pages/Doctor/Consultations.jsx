import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { currentDoctor, appointments, patients } from '../../utils/mockData';
import { getStatusBadgeClass } from '../../utils/helpers';
import './Consultations.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Consultations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const doctorAppts = appointments
    .filter((a) => a.doctorId === currentDoctor.id)
    .map((a) => ({
      ...a,
      patientName: patients.find((p) => p.id === a.patientId)?.name || 'Unknown',
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

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
        <p className="text-muted">{t('pg.doctor.consultations.assignedTo')} {currentDoctor.name}</p>
      </div>

      <Card title={t('pg.doctor.consultations.history')} subtitle={`${doctorAppts.length} ${t('pg.doctor.consultations.total')}`}>
        <DataTable
          columns={columns}
          data={doctorAppts}
          onRowClick={(row) => navigate(`/doctor/consultation/${row.id}`)}
          emptyMessage={t('pg.doctor.consultations.noConsultations')}
        />
      </Card>
    </div>
  );
};

export default Consultations;
