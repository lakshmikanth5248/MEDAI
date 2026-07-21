import apiClient from '../apiClient';

export const getNotifications = () => apiClient.get('/notifications/notifications').then((r) => r.data.notifications);
export const markNotificationRead = (id) =>
  apiClient.post(`/notifications/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/notifications/read-all').then((r) => r.data);
export const broadcastNotification = (data) =>
  apiClient.post('/notifications/notifications', data).then((r) => r.data.notification);

export const getSmsLogs = (params) => apiClient.get('/notifications/sms-logs', { params }).then((r) => r.data.smsLogs);
export const sendSms = (data) => apiClient.post('/notifications/sms-logs', data).then((r) => r.data.smsLog);
