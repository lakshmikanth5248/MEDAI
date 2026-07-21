import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { PageLoader } from '../../components/Loader/Loader';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { getInitials } from '../../utils/helpers';
import { useTranslation } from '../../i18n/LanguageContext';
import './Doctors.css';

const Doctors = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const initialDept = location.state?.department || 'All';
  const [activeDept, setActiveDept] = useState(initialDept);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [docs, depts] = await Promise.all([
          clinicalApi.getDoctors(),
          clinicalApi.getDepartments(),
        ]);
        if (cancelled) return;
        setDoctors(docs);
        setDepartments(depts);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load doctors'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getDeptName = (deptId) => departments.find((d) => d.id === deptId)?.name || t('pg.patient.doctors.unknown');

  const deptNames = ['All', ...departments.map((d) => d.name)];

  const filtered = doctors.filter((d) => {
    const matchDept = activeDept === 'All' || (d.department || getDeptName(d.departmentId)) === activeDept;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.specialization || '').toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="page doctors-page">
      <div className="page-header">
        <h1>{t('pg.patient.doctors.title')}</h1>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.patient.doctors.searchPlaceholder')} />
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="dept-tabs">
        {deptNames.map((dept) => (
          <button key={dept} className={`dept-tab ${activeDept === dept ? 'active' : ''}`} onClick={() => setActiveDept(dept)}>
            {dept === 'All' ? t('pg.patient.doctors.all') : dept}
          </button>
        ))}
      </div>

      <div className="doctors-grid">
        {filtered.map((doc) => (
          <div key={doc.id} className="doctor-card-item" onClick={() => setSelectedDoctor(doc)}>
            <div className="doc-avatar" style={{ backgroundColor: '#38BDF8' }}>{getInitials(doc.name)}</div>
            <h4>{doc.name}</h4>
            <p className="doc-specialization">{doc.specialization}</p>
            <div className="doc-meta">
              <span>{doc.experience} {t('pg.patient.doctors.yrs')}</span>
              <span className="doc-rating">★ {doc.rating}</span>
            </div>
            <p className="doc-fee">₹{doc.fee}</p>
            <p className="doc-availability">{doc.availability}</p>
            <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/patient/book-appointment', { state: { doctor: doc } }); }}>
              {t('pg.patient.doctors.bookAppointment')}
            </Button>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} title={t('pg.patient.doctors.profile')} size="lg">
        {selectedDoctor && (
          <div className="doctor-profile-modal">
            <div className="dp-header">
              <div className="dp-avatar" style={{ backgroundColor: '#38BDF8' }}>{getInitials(selectedDoctor.name)}</div>
              <div>
                <h2>{selectedDoctor.name}</h2>
                <p className="text-muted">{selectedDoctor.specialization} | {selectedDoctor.department || getDeptName(selectedDoctor.departmentId)}</p>
                <div className="dp-rating">★ {selectedDoctor.rating} | {selectedDoctor.experience} {t('pg.patient.doctors.yearsExperience')}</div>
              </div>
            </div>
            <div className="dp-details">
              <div className="dp-detail-item"><label>{t('pg.patient.doctors.lblQualification')}</label><span>{selectedDoctor.education}</span></div>
              <div className="dp-detail-item"><label>{t('pg.patient.doctors.lblConsultationFee')}</label><span>₹{selectedDoctor.fee}</span></div>
              <div className="dp-detail-item"><label>{t('pg.patient.doctors.lblAvailability')}</label><span>{selectedDoctor.availability}</span></div>
            </div>
            <Button onClick={() => { setSelectedDoctor(null); navigate('/patient/book-appointment', { state: { doctor: selectedDoctor } }); }}>
              {t('pg.patient.doctors.bookAppointment')}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Doctors;
