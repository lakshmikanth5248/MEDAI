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
export const getSmsStats = () => apiClient.get('/notifications/sms-logs/stats').then((r) => r.data);

export const getEmailLogs = (params) => apiClient.get('/notifications/email-logs', { params }).then((r) => r.data.emailLogs);
export const sendEmail = (data) => apiClient.post('/notifications/email-logs/send', data).then((r) => r.data.emailLog);
export const getEmailStats = () => apiClient.get('/notifications/email-logs/stats').then((r) => r.data);
export const retryFailedEmails = () => apiClient.post('/notifications/email-logs/retry-failed').then((r) => r.data);
