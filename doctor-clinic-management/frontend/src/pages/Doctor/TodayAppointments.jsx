import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function TodayAppointments() {
  const { t } = useTranslation();
  return <div><h1 style={{ fontSize: 28, marginBottom: 24 }}>{t('sidebar.todayAppointments')}</h1><p style={{ color: 'var(--color-gray-500)' }}>{t('pg.doctor.todayAppointments.subtitle')}</p></div>;
}
