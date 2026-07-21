const STORAGE_KEY = 'clinic_users';

// `uid` is the human-facing unique id (patientId / doctorId / storeCode) used
// for ID-based login, alongside the email.
const DEFAULT_USERS = {
  'admin@clinic.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 3, uid: 'USER-0001' },
  'doctor@clinic.com': { password: 'doctor123', role: 'doctor', name: 'Dr. Arjun Mehta', id: 1, uid: 'DOC-0001' },
  'reception@clinic.com': { password: 'reception123', role: 'reception', name: 'Priya Sharma', id: 2, uid: 'REC-0001' },
  'patient@clinic.com': { password: 'patient123', role: 'patient', name: 'Rajesh Gupta', id: 1, uid: 'PAT-0001' },
  'store@clinic.com': { password: 'store123', role: 'medical_store', name: 'City Pharmacy', id: 1, uid: 'STORE-0001' },
};

export function getUsers() {
  let users;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) users = JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  if (!users) {
    users = { ...DEFAULT_USERS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return users;
  }
  // Sync uid from defaults so stored users always use the current ID format.
  let changed = false;
  for (const [email, u] of Object.entries(users)) {
    if (DEFAULT_USERS[email]?.uid && u.uid !== DEFAULT_USERS[email].uid) {
      u.uid = DEFAULT_USERS[email].uid;
      changed = true;
    }
  }
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
  if (!email) return null;
  return getUsers()[email.trim().toLowerCase()] || null;
}

// Match a login identifier (email OR unique id) for a given role.
// Users are stored keyed by their email, and each record also carries a `uid`
// (patientId / doctorId / storeCode). Returns the stored user record or null.
export function findUserByIdentifier(identifier, role) {
  if (!identifier) return null;
  const users = getUsers();
  const id = identifier.trim();
  const idLower = id.toLowerCase();
  const matches = Object.entries(users)
    .map(([emailKey, u]) => ({ ...u, email: u.email || emailKey, _key: emailKey }))
    .filter((u) => {
      if (role && u.role !== role) return false;
      return (
        u.email?.trim().toLowerCase() === idLower ||
        String(u.uid || '').trim().toLowerCase() === idLower ||
        String(u.id) === id
      );
    });
  if (!matches[0]) return null;
  // Expose the storage key (email key) so callers can update the record later.
  return { ...matches[0], key: matches[0]._key };
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

// Merge partial profile fields into an existing stored user record.
export function updateUser(email, fields) {
  const key = email?.trim().toLowerCase();
  if (!key) return false;
  const users = getUsers();
  if (!users[key]) return false;
  users[key] = { ...users[key], ...fields };
  saveUsers(users);
  return true;
}

// Create or update a staff login account keyed by email. Used by the admin
// staff managers so each doctor / receptionist / medical store can log in
// with the email + password set by the admin.
export function upsertStaff({ email, password, role, name, id, uid, ...extra }) {
  const key = email?.trim().toLowerCase();
  if (!key) return false;
  const users = getUsers();
  const existing = users[key] || {};
  users[key] = {
    ...existing,
    ...extra,
    role,
    name: name || existing.name || email,
    id: id ?? existing.id,
    uid: uid || existing.uid,
    password: password || existing.password || `${role}@1234`,
  };
  saveUsers(users);
  return true;
}

// Remove a staff login account by email (e.g. when deleted in admin).
export function removeStaff(email) {
  const key = email?.trim().toLowerCase();
  if (!key) return false;
  const users = getUsers();
  if (!users[key]) return false;
  delete users[key];
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
