import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { appointments, currentDoctor, patients } from '../../utils/mockData';
import { getStatusBadgeClass, getInitials, calculateAge } from '../../utils/helpers';
import './TodaysAppointments.css';
import { useTranslation } from '../../i18n/LanguageContext';

const TodaysAppointments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);

  const todayDate = '2025-07-14';

  const todayAppts = appointments
    .filter((a) => a.date === todayDate && a.doctorId === currentDoctor.id)
    .map((a) => ({
      ...a,
      patientName: patients.find((p) => p.id === a.patientId)?.name || 'Unknown',
    }));

  const filtered = todayAppts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.patientName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getPatient = (patientId) => patients.find((p) => p.id === patientId);

  return (
    <div className="page todays-appointments">
      <div className="page-header">
        <h1>{t('sidebar.todayAppointments')}</h1>
        <div className="ta-filters">
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('pg.doctor.todaysAppointments.searchPlaceholder')} />
          <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
            { value: 'All', label: t('pg.doctor.todaysAppointments.all') },
            { value: 'Scheduled', label: t('pg.doctor.todaysAppointments.scheduled') },
            { value: 'Confirmed', label: t('pg.doctor.todaysAppointments.confirmed') },
            { value: 'Arrived', label: t('pg.doctor.todaysAppointments.arrived') },
            { value: 'Completed', label: t('pg.doctor.todaysAppointments.completed') },
          ]} />
        </div>
      </div>

      <div className="today-list">
        {filtered.map((appt) => {
          const patient = getPatient(appt.patientId);
          return (
            <div key={appt.id} className="today-card" onClick={() => setSelectedAppt(appt)}>
              <div className="today-time">{appt.time}</div>
              <div className="today-avatar">{getInitials(appt.patientName)}</div>
              <div className="today-info">
                <h4>{appt.patientName}</h4>
                <p className="text-muted">{patient ? `${calculateAge(patient.dob)} yrs, ${patient.gender}` : ''} | {appt.reason}</p>
              </div>
              <div className="today-status">
                <span className={`status-badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
              </div>
              <div className="today-actions">
                {appt.status === 'Arrived' && <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/doctor/consultation/${appt.id}`); }}>{t('pg.doctor.todaysAppointments.startConsultation')}</Button>}
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}>{t('pg.doctor.todaysAppointments.viewDetails')}</Button>
                {appt.status !== 'Completed' && appt.status !== 'Cancelled' && <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); }}>{t('pg.doctor.todaysAppointments.noShow')}</Button>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>{t('pg.doctor.todaysAppointments.noAppointments')}</p>}
      </div>

      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title={t('pg.doctor.todaysAppointments.appointmentDetails')}>
        {selectedAppt && (
          <div className="appt-detail-modal">
            <div className="appt-detail-row"><label>{t('pg.doctor.todaysAppointments.patient')}</label><span>{selectedAppt.patientName}</span></div>
            <div className="appt-detail-row"><label>{t('pg.doctor.todaysAppointments.time')}</label><span>{selectedAppt.time}</span></div>
            <div className="appt-detail-row"><label>{t('pg.doctor.todaysAppointments.reason')}</label><span>{selectedAppt.reason}</span></div>
            <div className="appt-detail-row"><label>{t('pg.doctor.todaysAppointments.status')}</label><span className={`status-badge ${getStatusBadgeClass(selectedAppt.status)}`}>{selectedAppt.status}</span></div>
            <div className="appt-detail-row"><label>{t('pg.doctor.todaysAppointments.room')}</label><span>{selectedAppt.roomNo}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TodaysAppointments;
