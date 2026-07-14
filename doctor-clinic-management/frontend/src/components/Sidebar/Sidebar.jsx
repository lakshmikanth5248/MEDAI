import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const MENU_CONFIG = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { path: '/admin/departments', label: 'Departments', icon: '🏥' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/admin/sms-logs', label: 'SMS Logs', icon: '✉️' },
    { path: '/admin/clinics', label: 'Clinics', icon: '🏛️' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ],
  reception: [
    { path: '/reception/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/reception/register-patient', label: 'Register Patient', icon: '📝' },
    { path: '/reception/patients', label: 'Patients', icon: '👥' },
    { path: '/reception/appointments', label: 'Appointments', icon: '📅' },
    { path: '/reception/billing', label: 'Billing', icon: '💰' },
  ],
  doctor: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/doctor/appointments', label: "Today's Appointments", icon: '📋' },
    { path: '/doctor/patient', label: 'Patients', icon: '👤', exact: false },
    { path: '/doctor/consultation', label: 'Consultations', icon: '🩺', exact: false },
    { path: '/doctor/prescription', label: 'Prescriptions', icon: '💊', exact: false },
    { path: '/doctor/profile', label: 'Profile', icon: '⚙️' },
  ],
  patient: [
    { path: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/patient/departments', label: 'Departments', icon: '🏥' },
    { path: '/patient/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: '📅' },
    { path: '/patient/my-appointments', label: 'My Appointments', icon: '📋' },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: '💊' },
    { path: '/patient/medical-history', label: 'Medical History', icon: '📄' },
    { path: '/patient/profile', label: 'Profile', icon: '⚙️' },
  ],
  medical_store: [
    { path: '/medical-store/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/medical-store/pending', label: 'Pending Prescriptions', icon: '⏳' },
    { path: '/medical-store/dispensed', label: 'Dispensed', icon: '✅' },
    { path: '/medical-store/inventory', label: 'Inventory', icon: '📦' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
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
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0.0</span>
      </div>
    </aside>
  );
}
