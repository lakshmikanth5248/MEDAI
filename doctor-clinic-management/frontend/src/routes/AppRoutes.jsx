import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout/DashboardLayout';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import NotFound from '../pages/NotFound';

import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminDoctors from '../pages/Admin/Doctors';
import AdminDepartments from '../pages/Admin/Departments';
import AdminReports from '../pages/Admin/Reports';
import AdminSmsLogs from '../pages/Admin/SmsLogs';
import AdminClinics from '../pages/Admin/Clinics';
import AdminSettings from '../pages/Admin/Settings';

import ReceptionDashboard from '../pages/Reception/Dashboard';
import RegisterPatient from '../pages/Reception/RegisterPatient';
import PatientsList from '../pages/Reception/PatientsList';
import ReceptionAppointments from '../pages/Reception/Appointments';
import Billing from '../pages/Reception/Billing';

import DoctorDashboard from '../pages/Doctor/Dashboard';
import TodayAppointments from '../pages/Doctor/TodayAppointments';
import PatientDetails from '../pages/Doctor/PatientDetails';
import Consultation from '../pages/Doctor/Consultation';
import DoctorPrescription from '../pages/Doctor/Prescription';
import DoctorProfile from '../pages/Doctor/Profile';

import PatientDashboard from '../pages/Patient/Dashboard';
import PatientDepartments from '../pages/Patient/Departments';
import PatientDoctors from '../pages/Patient/Doctors';
import BookAppointment from '../pages/Patient/BookAppointment';
import MyAppointments from '../pages/Patient/MyAppointments';
import PatientPrescriptions from '../pages/Patient/Prescriptions';
import MedicalHistory from '../pages/Patient/MedicalHistory';
import PatientProfile from '../pages/Patient/Profile';

import MedicalStoreDashboard from '../pages/MedicalStore/Dashboard';
import PendingPrescriptions from '../pages/MedicalStore/PendingPrescriptions';
import DispensedMedicines from '../pages/MedicalStore/DispensedMedicines';
import MedicineInventory from '../pages/MedicalStore/MedicineInventory';

const ROLE_PATH_MAP = {
  admin: 'admin',
  reception: 'reception',
  doctor: 'doctor',
  patient: 'patient',
  medical_store: 'medical-store',
};

function ProtectedRoute() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const pathPrefix = window.location.pathname.split('/')[1];
  const userPath = ROLE_PATH_MAP[user.role];

  if (pathPrefix !== userPath) {
    return <Navigate to={`/${userPath}/dashboard`} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const userPath = ROLE_PATH_MAP[user.role];
    return <Navigate to={`/${userPath}/dashboard`} replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/sms-logs" element={<AdminSmsLogs />} />
          <Route path="/admin/clinics" element={<AdminClinics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/reception/register-patient" element={<RegisterPatient />} />
          <Route path="/reception/patients" element={<PatientsList />} />
          <Route path="/reception/appointments" element={<ReceptionAppointments />} />
          <Route path="/reception/billing" element={<Billing />} />

          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<TodayAppointments />} />
          <Route path="/doctor/patient/:id" element={<PatientDetails />} />
          <Route path="/doctor/consultation/:id" element={<Consultation />} />
          <Route path="/doctor/prescription/:id" element={<DoctorPrescription />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />

          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/departments" element={<PatientDepartments />} />
          <Route path="/patient/doctors" element={<PatientDoctors />} />
          <Route path="/patient/book-appointment" element={<BookAppointment />} />
          <Route path="/patient/my-appointments" element={<MyAppointments />} />
          <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
          <Route path="/patient/medical-history" element={<MedicalHistory />} />
          <Route path="/patient/profile" element={<PatientProfile />} />

          <Route path="/medical-store/dashboard" element={<MedicalStoreDashboard />} />
          <Route path="/medical-store/pending" element={<PendingPrescriptions />} />
          <Route path="/medical-store/dispensed" element={<DispensedMedicines />} />
          <Route path="/medical-store/inventory" element={<MedicineInventory />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
