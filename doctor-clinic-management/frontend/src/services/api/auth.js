import apiClient from '../apiClient';

export const login = (identifier, password, role) =>
  apiClient.post('/auth/login', { identifier, password, role }).then((r) => r.data);

export const register = (data) => apiClient.post('/auth/register', data).then((r) => r.data);

export const createStaff = (data) => apiClient.post('/auth/staff', data).then((r) => r.data);

export const changePassword = (currentPassword, newPassword) =>
  apiClient.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);

export const forgotPassword = (email) =>
  apiClient.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  apiClient.post('/auth/reset-password', { token, newPassword }).then((r) => r.data);

export const getMe = () => apiClient.get('/auth/me').then((r) => r.data.user);

export const getUsers = (params) => apiClient.get('/auth/users', { params }).then((r) => r.data.users);

export const updateUserStatus = (id, status) =>
  apiClient.patch(`/auth/users/${id}/status`, { status }).then((r) => r.data.user);

export const updateUser = (id, data) => apiClient.patch(`/auth/users/${id}`, data).then((r) => r.data.user);

export const deleteUser = (id) => apiClient.delete(`/auth/users/${id}`).then((r) => r.data);
