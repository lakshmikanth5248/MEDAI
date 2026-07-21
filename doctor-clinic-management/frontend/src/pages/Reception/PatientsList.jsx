import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Input } from '../../components/Forms';
import { DataTable } from '../../components/Tables';
import { Loader } from '../../components/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate } from '../../utils/helpers';
import './Reception.css';
import { useTranslation } from '../../i18n/LanguageContext';

const PatientsList = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPatients(await clinicalApi.getPatients());
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load patients'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.patientId || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'patientId', label: t('pg.reception.patientsList.colPatientId') },
    { key: 'name', label: t('pg.reception.patientsList.colName') },
    { key: 'gender', label: t('pg.reception.patientsList.colGender') },
    { key: 'phone', label: t('pg.reception.patientsList.colPhone') },
    { key: 'bloodGroup', label: t('pg.reception.patientsList.colBloodGroup') },
    { key: 'registeredDate', label: t('pg.reception.patientsList.colRegistered'), render: (v) => formatDate(v) },
  ];

  return (
    <div className="reception-page">
      <div className="page-header">
        <h1>{t('pg.reception.patientsList.title')}</h1>
        <p className="text-muted">{t('pg.reception.patientsList.subtitle')}</p>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="rec-list-header">
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('pg.reception.patientsList.searchPlaceholder')}
        />
        <span className="text-muted">{filtered.length} {t('pg.reception.patientsList.patient')}{filtered.length !== 1 ? 's' : ''} {t('pg.reception.patientsList.found')}</span>
      </div>

      <Card title={t('pg.reception.patientsList.recordsTitle')}>
        {loading ? <Loader /> : <DataTable columns={columns} data={filtered} emptyMessage={t('pg.reception.patientsList.empty')} />}
      </Card>
    </div>
  );
};

export default PatientsList;
