const STORAGE_KEY = 'clinic_notifications';

// Seed notifications are tagged so each role only sees what's relevant:
//  - recipientRole: which role this notification is intended for
//    ('all' = admin only / everyone, 'doctor' = a specific doctor, etc.)
//  - targetDoctorId: the doctor id a doctor-targeted notification relates to
//    (undefined means "any doctor" — used for clinic-wide doctor notices).
const SEED = [
  { id: 1, message: 'New appointment booked by Rajesh Gupta', type: 'info', time: '5 minutes ago', read: false, recipientRole: 'doctor', targetDoctorId: 1 },
  { id: 2, message: 'Prescription #3 has been dispensed', type: 'success', time: '15 minutes ago', read: false, recipientRole: 'doctor', targetDoctorId: 1, from: 'medical_store' },
  { id: 3, message: 'Appointment #5 was cancelled by patient', type: 'warning', time: '1 hour ago', read: false, recipientRole: 'doctor', targetDoctorId: 1, from: 'patient' },
  { id: 4, message: 'Dr. Arjun Mehta marked as available', type: 'info', time: '2 hours ago', read: true, recipientRole: 'doctor', targetDoctorId: 1 },
  { id: 5, message: 'New patient registration: Lakshmi Nair', type: 'info', time: '3 hours ago', read: true, recipientRole: 'reception' },
  { id: 6, message: 'Medicine stock low: Paracetamol 500mg', type: 'warning', time: '5 hours ago', read: true, recipientRole: 'medical_store' },
  { id: 7, message: 'Monthly report for June is ready', type: 'success', time: '1 day ago', read: true, recipientRole: 'all' },
];

let memoryLive = [];

export function getNotifications() {
  let stored = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [...SEED, ...stored, ...memoryLive];
}

// Persist a brand-new notification (clinic-wide or targeted).
export function addNotification(n) {
  const list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(list, JSON.parse(raw));
  } catch { /* ignore */ }
  const item = { id: Date.now(), read: false, time: 'just now', ...n };
  list.push(item);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  return item;
}

// Returns only the notifications relevant to the given user.
export function getNotificationsForUser(user) {
  if (!user) return [];
  const all = getNotifications();
  if (user.role === 'admin') return all; // admin sees everything

  if (user.role === 'doctor') {
    const doctorId = String(user.id);
    return all.filter((n) => {
      if (n.recipientRole === 'doctor') {
        return n.targetDoctorId === undefined || String(n.targetDoctorId) === doctorId;
      }
      // messages directed at this doctor from other roles
      if (n.targetDoctorId !== undefined && String(n.targetDoctorId) === doctorId) return true;
      return false;
    });
  }

  // reception / medical_store / patient: only their own role's items
  return all.filter((n) => n.recipientRole === user.role);
}
