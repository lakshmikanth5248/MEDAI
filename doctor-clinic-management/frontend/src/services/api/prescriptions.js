import apiClient from '../apiClient';

// Note: the gateway prefix is "prescriptions" and the service's own routes
// are also "/prescriptions", so the full path is /api/prescriptions/prescriptions.
export const getPrescriptions = (params) =>
  apiClient.get('/prescriptions/prescriptions', { params }).then((r) => r.data.prescriptions);

export const getPrescription = (id) =>
  apiClient.get(`/prescriptions/prescriptions/${id}`).then((r) => r.data.prescription);

export const createPrescription = (data) =>
  apiClient.post('/prescriptions/prescriptions', data).then((r) => r.data.prescription);

export const dispensePrescription = (id, storeId) =>
  apiClient.post(`/prescriptions/prescriptions/${id}/dispense`, { storeId }).then((r) => r.data.prescription);
