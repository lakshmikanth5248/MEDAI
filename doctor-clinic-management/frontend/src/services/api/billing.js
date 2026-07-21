import apiClient from '../apiClient';

export const getBills = (params) => apiClient.get('/billing/bills', { params }).then((r) => r.data.bills);
export const getBill = (id) => apiClient.get(`/billing/bills/${id}`).then((r) => r.data.bill);
export const createBill = (data) => apiClient.post('/billing/bills', data).then((r) => r.data.bill);
export const updateBillStatus = (id, status) =>
  apiClient.patch(`/billing/bills/${id}/status`, { status }).then((r) => r.data.bill);
