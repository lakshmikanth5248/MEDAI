import apiClient from '../apiClient';

// Stores
export const getStores = (params) => apiClient.get('/pharmacy/stores', { params }).then((r) => r.data.stores);
export const getStore = (id) => apiClient.get(`/pharmacy/stores/${id}`).then((r) => r.data.store);
export const createStore = (data) => apiClient.post('/pharmacy/stores', data).then((r) => r.data.store);
export const updateStore = (id, data) => apiClient.put(`/pharmacy/stores/${id}`, data).then((r) => r.data.store);
export const deleteStore = (id) => apiClient.delete(`/pharmacy/stores/${id}`).then((r) => r.data);

// Inventory
export const getStoreInventory = (storeId) =>
  apiClient.get(`/pharmacy/stores/${storeId}/inventory`).then((r) => r.data.inventory);
export const addInventoryItem = (storeId, data) =>
  apiClient.post(`/pharmacy/stores/${storeId}/inventory`, data).then((r) => r.data.item);
export const updateInventoryItem = (itemId, data) =>
  apiClient.put(`/pharmacy/inventory/${itemId}`, data).then((r) => r.data.item);
export const deleteInventoryItem = (itemId) =>
  apiClient.delete(`/pharmacy/inventory/${itemId}`).then((r) => r.data);
export const getLowStock = (params) =>
  apiClient.get('/pharmacy/inventory/low-stock', { params }).then((r) => r.data);
export const getDispensedForStore = (storeId) =>
  apiClient.get(`/pharmacy/stores/${storeId}/dispensed`).then((r) => r.data.prescriptions);
