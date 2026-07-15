import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import './Sidebar.css';

// labelKey maps each menu entry to a translation key under `sidebar.*`.
const MENU_CONFIG = {
  admin: [
    { path: '/admin/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
    { path: '/admin/users', labelKey: 'sidebar.users', icon: '👥' },
    { path: '/admin/doctors', labelKey: 'sidebar.doctors', icon: '👨‍⚕️' },
    { path: '/admin/departments', labelKey: 'sidebar.departments', icon: '🏥' },
    { path: '/admin/reports', labelKey: 'sidebar.reports', icon: '📈' },
    { path: '/admin/sms-logs', labelKey: 'sidebar.smsLogs', icon: '✉️' },
    { path: '/admin/clinics', labelKey: 'sidebar.clinics', icon: '🏛️' },
    { path: '/admin/settings', labelKey: 'sidebar.settings', icon: '⚙️' },
    { path: '/admin/notifications', labelKey: 'sidebar.notifications', icon: '🔔' },
  ],
  reception: [
    { path: '/reception/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
    { path: '/reception/register-patient', labelKey: 'sidebar.registerPatient', icon: '📝' },
    { path: '/reception/patients', labelKey: 'sidebar.patients', icon: '👥' },
    { path: '/reception/appointments', labelKey: 'sidebar.appointments', icon: '📅' },
    { path: '/reception/billing', labelKey: 'sidebar.billing', icon: '💰' },
    { path: '/reception/profile', labelKey: 'sidebar.profile', icon: '⚙️' },
    { path: '/reception/notifications', labelKey: 'sidebar.notifications', icon: '🔔' },
  ],
  doctor: [
    { path: '/doctor/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
    { path: '/doctor/appointments', labelKey: 'sidebar.todayAppointments', icon: '📋' },
    { path: '/doctor/patient', labelKey: 'sidebar.patients', icon: '👤', exact: false },
    { path: '/doctor/consultations', labelKey: 'sidebar.consultations', icon: '🩺', exact: false },
    { path: '/doctor/prescription', labelKey: 'sidebar.prescriptions', icon: '💊', exact: false },
    { path: '/doctor/profile', labelKey: 'sidebar.profile', icon: '⚙️' },
    { path: '/doctor/notifications', labelKey: 'sidebar.notifications', icon: '🔔' },
  ],
  patient: [
    { path: '/patient/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
    { path: '/patient/departments', labelKey: 'sidebar.departments', icon: '🏥' },
    { path: '/patient/doctors', labelKey: 'sidebar.doctors', icon: '👨‍⚕️' },
    { path: '/patient/book-appointment', labelKey: 'sidebar.bookAppointment', icon: '📅' },
    { path: '/patient/my-appointments', labelKey: 'sidebar.myAppointments', icon: '📋' },
    { path: '/patient/prescriptions', labelKey: 'sidebar.prescriptions', icon: '💊' },
    { path: '/patient/medical-history', labelKey: 'sidebar.medicalHistory', icon: '📄' },
    { path: '/patient/profile', labelKey: 'sidebar.profile', icon: '⚙️' },
    { path: '/patient/notifications', labelKey: 'sidebar.notifications', icon: '🔔' },
  ],
  medical_store: [
    { path: '/medical-store/dashboard', labelKey: 'sidebar.dashboard', icon: '📊' },
    { path: '/medical-store/pending', labelKey: 'sidebar.pendingPrescriptions', icon: '⏳' },
    { path: '/medical-store/dispensed', labelKey: 'sidebar.dispensed', icon: '✅' },
    { path: '/medical-store/inventory', labelKey: 'sidebar.inventory', icon: '📦' },
    { path: '/medical-store/profile', labelKey: 'sidebar.profile', icon: '⚙️' },
    { path: '/medical-store/notifications', labelKey: 'sidebar.notifications', icon: '🔔' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const menuItems = MENU_CONFIG[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">+C</div>
        <span className="sidebar-brand-text">ClinicManager</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact !== false}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0.0</span>
      </div>
    </aside>
  );
}
