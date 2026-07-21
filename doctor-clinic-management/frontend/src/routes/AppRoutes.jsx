import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleRoute } from '../components/RoleRoute/RoleRoute';
import { PageLoader } from '../components/Loader';
import DashboardLayout from '../components/DashboardLayout/DashboardLayout';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import NotFound from '../pages/NotFound';

import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminDoctors from '../pages/Admin/Doctors';
import AdminMedicalStores from '../pages/Admin/MedicalStores';
import AdminReceptionStaff from '../pages/Admin/ReceptionStaff';
import AdminDepartments from '../pages/Admin/Departments';
import AdminReports from '../pages/Admin/Reports';
import AdminSmsLogs from '../pages/Admin/SmsLogs';
import AdminClinics from '../pages/Admin/Clinics';
import AdminSettings from '../pages/Admin/Settings';

import SharedProfile from '../pages/Shared/Profile';
import Notifications from '../pages/Shared/Notifications';
import DoctorConsultations from '../pages/Doctor/Consultations';

import ReceptionDashboard from '../pages/Reception/Dashboard';
import RegisterPatient from '../pages/Reception/RegisterPatient';
import PatientsList from '../pages/Reception/PatientsList';
import ReceptionAppointments from '../pages/Reception/Appointments';
import Billing from '../pages/Reception/Billing';
import ReceptionPrescriptions from '../pages/Reception/Prescriptions';

import DoctorDashboard from '../pages/Doctor/Dashboard';
import TodayAppointments from '../pages/Doctor/TodayAppointments';
import PatientDetails from '../pages/Doctor/PatientDetails';
import DoctorPatients from '../pages/Doctor/Patients';
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
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

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
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

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

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
          <Route path="/admin/doctors" element={<RoleRoute allowedRoles={['admin']}><AdminDoctors /></RoleRoute>} />
          <Route path="/admin/medical-stores" element={<RoleRoute allowedRoles={['admin']}><AdminMedicalStores /></RoleRoute>} />
          <Route path="/admin/reception-staff" element={<RoleRoute allowedRoles={['admin']}><AdminReceptionStaff /></RoleRoute>} />
          <Route path="/admin/departments" element={<RoleRoute allowedRoles={['admin']}><AdminDepartments /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute allowedRoles={['admin']}><AdminReports /></RoleRoute>} />
          <Route path="/admin/sms-logs" element={<RoleRoute allowedRoles={['admin']}><AdminSmsLogs /></RoleRoute>} />
          <Route path="/admin/clinics" element={<RoleRoute allowedRoles={['admin']}><AdminClinics /></RoleRoute>} />
          <Route path="/admin/settings" element={<RoleRoute allowedRoles={['admin']}><AdminSettings /></RoleRoute>} />
          <Route path="/admin/profile" element={<RoleRoute allowedRoles={['admin']}><SharedProfile /></RoleRoute>} />
          <Route path="/admin/notifications" element={<RoleRoute allowedRoles={['admin']}><Notifications /></RoleRoute>} />

          <Route path="/reception/dashboard" element={<RoleRoute allowedRoles={['reception']}><ReceptionDashboard /></RoleRoute>} />
          <Route path="/reception/register-patient" element={<RoleRoute allowedRoles={['reception']}><RegisterPatient /></RoleRoute>} />
          <Route path="/reception/patients" element={<RoleRoute allowedRoles={['reception']}><PatientsList /></RoleRoute>} />
          <Route path="/reception/appointments" element={<RoleRoute allowedRoles={['reception']}><ReceptionAppointments /></RoleRoute>} />
          <Route path="/reception/billing" element={<RoleRoute allowedRoles={['reception']}><Billing /></RoleRoute>} />
          <Route path="/reception/prescriptions" element={<RoleRoute allowedRoles={['reception']}><ReceptionPrescriptions /></RoleRoute>} />
          <Route path="/reception/profile" element={<RoleRoute allowedRoles={['reception']}><SharedProfile /></RoleRoute>} />
          <Route path="/reception/notifications" element={<RoleRoute allowedRoles={['reception']}><Notifications /></RoleRoute>} />

          <Route path="/doctor/dashboard" element={<RoleRoute allowedRoles={['doctor']}><DoctorDashboard /></RoleRoute>} />
          <Route path="/doctor/appointments" element={<RoleRoute allowedRoles={['doctor']}><TodayAppointments /></RoleRoute>} />
          <Route path="/doctor/patient" element={<RoleRoute allowedRoles={['doctor']}><DoctorPatients /></RoleRoute>} />
          <Route path="/doctor/patient/:id" element={<RoleRoute allowedRoles={['doctor']}><PatientDetails /></RoleRoute>} />
          <Route path="/doctor/consultations" element={<RoleRoute allowedRoles={['doctor']}><DoctorConsultations /></RoleRoute>} />
          <Route path="/doctor/consultation/:id" element={<RoleRoute allowedRoles={['doctor']}><Consultation /></RoleRoute>} />
          <Route path="/doctor/prescription" element={<RoleRoute allowedRoles={['doctor']}><DoctorPrescription /></RoleRoute>} />
          <Route path="/doctor/prescription/:id" element={<RoleRoute allowedRoles={['doctor']}><DoctorPrescription /></RoleRoute>} />
          <Route path="/doctor/profile" element={<RoleRoute allowedRoles={['doctor']}><DoctorProfile /></RoleRoute>} />
          <Route path="/doctor/notifications" element={<RoleRoute allowedRoles={['doctor']}><Notifications /></RoleRoute>} />

          <Route path="/patient/dashboard" element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
          <Route path="/patient/departments" element={<RoleRoute allowedRoles={['patient']}><PatientDepartments /></RoleRoute>} />
          <Route path="/patient/doctors" element={<RoleRoute allowedRoles={['patient']}><PatientDoctors /></RoleRoute>} />
          <Route path="/patient/book-appointment" element={<RoleRoute allowedRoles={['patient']}><BookAppointment /></RoleRoute>} />
          <Route path="/patient/my-appointments" element={<RoleRoute allowedRoles={['patient']}><MyAppointments /></RoleRoute>} />
          <Route path="/patient/prescriptions" element={<RoleRoute allowedRoles={['patient']}><PatientPrescriptions /></RoleRoute>} />
          <Route path="/patient/medical-history" element={<RoleRoute allowedRoles={['patient']}><MedicalHistory /></RoleRoute>} />
          <Route path="/patient/profile" element={<RoleRoute allowedRoles={['patient']}><PatientProfile /></RoleRoute>} />
          <Route path="/patient/notifications" element={<RoleRoute allowedRoles={['patient']}><Notifications /></RoleRoute>} />

          <Route path="/medical-store/dashboard" element={<RoleRoute allowedRoles={['medical_store']}><MedicalStoreDashboard /></RoleRoute>} />
          <Route path="/medical-store/pending" element={<RoleRoute allowedRoles={['medical_store']}><PendingPrescriptions /></RoleRoute>} />
          <Route path="/medical-store/dispensed" element={<RoleRoute allowedRoles={['medical_store']}><DispensedMedicines /></RoleRoute>} />
          <Route path="/medical-store/inventory" element={<RoleRoute allowedRoles={['medical_store']}><MedicineInventory /></RoleRoute>} />
          <Route path="/medical-store/profile" element={<RoleRoute allowedRoles={['medical_store']}><SharedProfile /></RoleRoute>} />
          <Route path="/medical-store/notifications" element={<RoleRoute allowedRoles={['medical_store']}><Notifications /></RoleRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
