import apiClient from '../apiClient';

export const getClinics = () => apiClient.get('/core/clinics').then((r) => r.data.clinics);
export const createClinic = (data) => apiClient.post('/core/clinics', data).then((r) => r.data.clinic);
export const updateClinic = (id, data) => apiClient.put(`/core/clinics/${id}`, data).then((r) => r.data.clinic);
export const deleteClinic = (id) => apiClient.delete(`/core/clinics/${id}`).then((r) => r.data);

export const getSettings = () => apiClient.get('/core/settings').then((r) => r.data.settings);
export const updateSettings = (data) => apiClient.put('/core/settings', data).then((r) => r.data.settings);

export const getActivityLog = (params) => apiClient.get('/core/activity-log', { params }).then((r) => r.data.activity);

export const getDashboardSummary = () => apiClient.get('/core/dashboard/summary').then((r) => r.data.summary);

export const getReport = (category, params) =>
  apiClient.get('/core/reports', { params: { category, ...params } }).then((r) => r.data.data);
