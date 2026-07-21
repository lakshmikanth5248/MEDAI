// AuthContext now builds the full role-specific profile at login time
// (merging the auth identity with the doctor/patient/medical_store record
// from the real backend - see enrichProfile() in context/AuthContext.jsx),
// so `user` from useAuth() already IS the resolved profile. This is kept
// as a pass-through so every page that calls resolveProfile(user) keeps
// working unchanged.
export function resolveProfile(user) {
  return user || null;
}

// Convenience helper for pages: returns the role-specific id used to filter
// records (doctorId / patientId / etc). doctorId/patientId are the
// backend's human-readable codes (DOC-100001 etc) but appointments/
// prescriptions/etc are keyed by the internal numeric id, so most page
// filtering should use profile.id, not this - use getRoleId() only where a
// human-readable code is what's actually needed (e.g. displaying "My ID").
export function getRoleId(profile) {
  if (!profile) return null;
  switch (profile.role) {
    case 'doctor': return profile.doctorId || profile.id;
    case 'patient': return profile.patientId || profile.id;
    case 'reception': return profile.receptionId || profile.id;
    case 'medical_store': return profile.storeCode || profile.id;
    case 'admin': return profile.adminId || profile.id;
    default: return profile.id;
  }
}
