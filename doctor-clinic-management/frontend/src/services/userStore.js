const STORAGE_KEY = 'clinic_users';

const DEFAULT_USERS = {
  'admin@clinic.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 3 },
  'doctor@clinic.com': { password: 'doctor123', role: 'doctor', name: 'Dr. Arjun Mehta', id: 1 },
  'reception@clinic.com': { password: 'reception123', role: 'reception', name: 'Priya Sharma', id: 2 },
  'patient@clinic.com': { password: 'patient123', role: 'patient', name: 'Rajesh Gupta', id: 1 },
  'store@clinic.com': { password: 'store123', role: 'medical_store', name: 'City Pharmacy', id: 1 },
};

export function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return { ...DEFAULT_USERS };
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
  if (!email) return null;
  return getUsers()[email.trim().toLowerCase()] || null;
}

export function updatePassword(email, newPassword) {
  const key = email?.trim().toLowerCase();
  const users = getUsers();
  if (!users[key]) return false;
  users[key] = { ...users[key], password: newPassword };
  saveUsers(users);
  return true;
}

export function addUser({ email, password, role, name, id }) {
  const key = email?.trim().toLowerCase();
  const users = getUsers();
  if (users[key]) return false;
  users[key] = { password, role, name: name || email, id: id || Date.now() };
  saveUsers(users);
  return true;
}

export function encodeResetToken(email) {
  return btoa(unescape(encodeURIComponent(email.trim().toLowerCase())));
}

export function decodeResetToken(token) {
  try {
    return decodeURIComponent(escape(atob(token)));
  } catch {
    return null;
  }
}
