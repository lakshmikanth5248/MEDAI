import axios from 'axios';
import {
  doctors, patients, appointments, departments,
  prescriptions, medicalStores, medicineInventory,
  users, statsData, notifications, recentActivities,
  billingRecords,
} from '../utils/mockData';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function simulateDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simulateResponse(data, success = true) {
  return { data: { success, data } };
}

export async function login(credentials) {
  await simulateDelay(500);
  const validUsers = {
    'admin@clinic.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 3 },
    'doctor@clinic.com': { password: 'doctor123', role: 'doctor', name: 'Dr. Arjun Mehta', id: 1 },
    'reception@clinic.com': { password: 'reception123', role: 'reception', name: 'Priya Sharma', id: 2 },
    'patient@clinic.com': { password: 'patient123', role: 'patient', name: 'Rajesh Gupta', id: 1 },
    'store@clinic.com': { password: 'store123', role: 'medical_store', name: 'City Pharmacy', id: 1 },
  };
  const user = validUsers[credentials.email];
  if (user && user.password === credentials.password) {
    const token = 'mock-jwt-token-' + Date.now();
    const userData = { id: user.id, name: user.name, email: credentials.email, role: user.role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return simulateResponse({ token, user: userData });
  }
  return simulateResponse(null, false);
}

export async function register(data) {
  await simulateDelay(500);
  return simulateResponse({ message: 'Registration successful. Please check your email to verify.' });
}

export async function forgotPassword(email) {
  await simulateDelay(500);
  return simulateResponse({ message: 'Password reset link sent to your email.' });
}

export async function getPatients() {
  await simulateDelay();
  return simulateResponse(patients);
}

export async function getPatientById(id) {
  await simulateDelay();
  const patient = patients.find((p) => p.id === id);
  return simulateResponse(patient || null);
}

export async function createPatient(data) {
  await simulateDelay();
  const newPatient = { id: patients.length + 1, patientId: 'PAT-' + String(100000 + patients.length + 1).slice(1), ...data, registeredDate: new Date().toISOString().split('T')[0] };
  return simulateResponse(newPatient);
}

export async function getDoctors() {
  await simulateDelay();
  return simulateResponse(doctors);
}

export async function getDoctorsByDepartment(deptId) {
  await simulateDelay();
  const filtered = doctors.filter((d) => d.departmentId === deptId);
  return simulateResponse(filtered);
}

export async function getDoctorById(id) {
  await simulateDelay();
  const doctor = doctors.find((d) => d.id === id);
  return simulateResponse(doctor || null);
}

export async function getAppointments() {
  await simulateDelay();
  return simulateResponse(appointments);
}

export async function getAppointmentsByPatient(patientId) {
  await simulateDelay();
  const filtered = appointments.filter((a) => a.patientId === patientId);
  return simulateResponse(filtered);
}

export async function getAppointmentsByDoctor(doctorId) {
  await simulateDelay();
  const filtered = appointments.filter((a) => a.doctorId === doctorId);
  return simulateResponse(filtered);
}

export async function bookAppointment(data) {
  await simulateDelay();
  const newAppointment = { id: appointments.length + 1, ...data, status: 'scheduled' };
  return simulateResponse(newAppointment);
}

export async function updateAppointmentStatus(id, status) {
  await simulateDelay();
  const appointment = appointments.find((a) => a.id === id);
  if (appointment) appointment.status = status;
  return simulateResponse(appointment || null);
}

export async function getPrescriptions() {
  await simulateDelay();
  return simulateResponse(prescriptions);
}

export async function getPrescriptionsByPatient(patientId) {
  await simulateDelay();
  const filtered = prescriptions.filter((p) => p.patientId === patientId);
  return simulateResponse(filtered);
}

export async function createPrescription(data) {
  await simulateDelay();
  const newPrescription = { id: prescriptions.length + 1, ...data, status: 'active', date: new Date().toISOString().split('T')[0] };
  return simulateResponse(newPrescription);
}

export async function getDepartments() {
  await simulateDelay();
  return simulateResponse(departments);
}

export async function getMedicalStores() {
  await simulateDelay();
  return simulateResponse(medicalStores);
}

export async function getInventory() {
  await simulateDelay();
  return simulateResponse(medicineInventory);
}

export async function dispenseMedicine(data) {
  await simulateDelay();
  return simulateResponse({ message: 'Medicine dispensed successfully', ...data });
}

export async function getDashboardStats(role) {
  await simulateDelay();
  return simulateResponse(statsData);
}

export async function getUsers() {
  await simulateDelay();
  return simulateResponse(users);
}

export async function createUser(data) {
  await simulateDelay();
  const newUser = { id: users.length + 1, ...data, status: 'active', lastLogin: '-' };
  return simulateResponse(newUser);
}

export async function updateUser(id, data) {
  await simulateDelay();
  const user = users.find((u) => u.id === id);
  Object.assign(user || {}, data);
  return simulateResponse(user || null);
}

export async function getBillingRecords() {
  await simulateDelay();
  return simulateResponse(billingRecords);
}

export async function getNotifications() {
  await simulateDelay();
  return simulateResponse(notifications);
}

export async function getRecentActivities() {
  await simulateDelay();
  return simulateResponse(recentActivities);
}

export default api;
