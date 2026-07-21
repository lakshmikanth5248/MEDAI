import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { useTranslation } from '../../i18n/LanguageContext';
import './Departments.css';

const Departments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [depts, doctors] = await Promise.all([
          clinicalApi.getDepartments(),
          clinicalApi.getDoctors(),
        ]);
        if (cancelled) return;
        const withCounts = depts.map((d) => ({
          ...d,
          doctorCount: doctors.filter((doc) => doc.departmentId === d.id).length,
        }));
        setDepartments(withCounts);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load departments'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || (d.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="page departments-page">
      <div className="page-header">
        <h1>{t('pg.patient.departments.title')}</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.patient.departments.searchPlaceholder')} />
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="dept-grid">
        {filtered.map((dept) => (
          <div key={dept.id} className="dept-card" style={{ '--dept-color': dept.color }}>
            <div className="dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
              {dept.icon}
            </div>
            <h3>{dept.name}</h3>
            <p className="dept-desc">{dept.description}</p>
            <p className="dept-doctors">{dept.doctorCount} {t('pg.patient.departments.doctors')}</p>
            <Button size="sm" onClick={() => navigate('/patient/doctors', { state: { department: dept.name } })}>{t('pg.patient.departments.viewDoctors')}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
