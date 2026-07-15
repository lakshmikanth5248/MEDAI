import { doctors, patients, users, medicalStores } from './mockData';

export function resolveProfile(user) {
  if (!user) return null;

  const base = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: '',
    status: 'active',
    lastLogin: '—',
  };

  if (user.role === 'doctor') {
    const rec = doctors.find((d) => d.id === user.id) || doctors.find((d) => d.email === user.email);
    return {
      ...base,
      ...(rec || {}),
      name: user.name,
      email: rec?.email || user.email,
      roleLabel: 'Doctor',
      specialization: rec?.specialization,
      department: rec?.department,
      experience: rec?.experience,
      qualification: rec?.qualification,
      licenseNo: rec?.licenseNo,
      fee: rec?.fee,
      availability: rec?.availability,
      doctorId: rec?.doctorId,
      address: rec?.address,
      status: rec?.status || 'Active',
      phone: rec?.phone || base.phone,
    };
  }

  if (user.role === 'patient') {
    const rec = patients.find((p) => p.id === user.id) || patients.find((p) => p.email === user.email);
    return {
      ...base,
      ...(rec || {}),
      name: user.name,
      email: rec?.email || user.email,
      roleLabel: 'Patient',
      patientId: rec?.patientId,
      bloodGroup: rec?.bloodGroup,
      dob: rec?.dob,
      gender: rec?.gender,
      address: rec?.address,
      registeredDate: rec?.registeredDate,
      phone: rec?.phone || base.phone,
    };
  }

  const rec = users.find((u) => u.email === user.email);
  const storeRec = user.role === 'medical_store' ? medicalStores.find((s) => s.name === user.name) || medicalStores[0] : null;
  const matched = rec || storeRec;

  return {
    ...base,
    ...(matched || {}),
    name: user.name,
    email: user.email,
    roleLabel: user.role,
    id: storeRec?.storeCode || matched?.id || user.id,
    storeCode: storeRec?.storeCode,
    status: matched?.status || 'active',
    lastLogin: matched?.lastLogin || '—',
    phone: matched?.phone || base.phone,
  };
}
