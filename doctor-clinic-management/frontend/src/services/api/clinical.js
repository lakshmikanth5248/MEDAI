import apiClient from '../apiClient';

// Departments
export const getDepartments = () => apiClient.get('/clinical/departments').then((r) => r.data.departments);
export const createDepartment = (data) => apiClient.post('/clinical/departments', data).then((r) => r.data.department);
export const updateDepartment = (id, data) => apiClient.put(`/clinical/departments/${id}`, data).then((r) => r.data.department);
export const deleteDepartment = (id) => apiClient.delete(`/clinical/departments/${id}`).then((r) => r.data);

// Doctors
export const getDoctors = (params) => apiClient.get('/clinical/doctors', { params }).then((r) => r.data.doctors);
export const getDoctor = (id) => apiClient.get(`/clinical/doctors/${id}`).then((r) => r.data.doctor);
export const createDoctor = (data) => apiClient.post('/clinical/doctors', data).then((r) => r.data.doctor);
export const updateDoctor = (id, data) => apiClient.put(`/clinical/doctors/${id}`, data).then((r) => r.data.doctor);
export const deleteDoctor = (id) => apiClient.delete(`/clinical/doctors/${id}`).then((r) => r.data);
export const getDoctorPatients = (id) => apiClient.get(`/clinical/doctors/${id}/patients`).then((r) => r.data.patients);

// Patients
export const getPatients = (params) => apiClient.get('/clinical/patients', { params }).then((r) => r.data.patients);
export const getPatient = (id) => apiClient.get(`/clinical/patients/${id}`).then((r) => r.data.patient);
export const createPatient = (data) => apiClient.post('/clinical/patients', data).then((r) => r.data.patient);
export const updatePatient = (id, data) => apiClient.put(`/clinical/patients/${id}`, data).then((r) => r.data.patient);
export const getPatientTimeline = (id) => apiClient.get(`/clinical/patients/${id}/timeline`).then((r) => r.data);

// Appointments
export const getAppointments = (params) => apiClient.get('/clinical/appointments', { params }).then((r) => r.data.appointments);
export const getTodayAppointments = (params) => apiClient.get('/clinical/appointments/today', { params }).then((r) => r.data.appointments);
export const getAppointment = (id) => apiClient.get(`/clinical/appointments/${id}`).then((r) => r.data.appointment);
export const createAppointment = (data) => apiClient.post('/clinical/appointments', data).then((r) => r.data.appointment);
export const updateAppointmentStatus = (id, data) => apiClient.patch(`/clinical/appointments/${id}/status`, data).then((r) => r.data.appointment);

// Consultations
export const getConsultations = (params) => apiClient.get('/clinical/consultations', { params }).then((r) => r.data.consultations);
export const getConsultation = (id) => apiClient.get(`/clinical/consultations/${id}`).then((r) => r.data.consultation);
export const createConsultation = (data) => apiClient.post('/clinical/consultations', data).then((r) => r.data.consultation);
