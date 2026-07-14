export const departments = [
  { id: 1, name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular system diagnosis and treatment', doctorCount: 3 },
  { id: 2, name: 'Neurology', icon: '🧠', description: 'Brain, spinal cord and nervous system disorders', doctorCount: 2 },
  { id: 3, name: 'Orthopedics', icon: '🦴', description: 'Musculoskeletal system and bone health', doctorCount: 2 },
  { id: 4, name: 'Pediatrics', icon: '👶', description: 'Medical care for infants, children and adolescents', doctorCount: 2 },
  { id: 5, name: 'Dermatology', icon: '🔬', description: 'Skin, hair and nail conditions', doctorCount: 1 },
  { id: 6, name: 'General Medicine', icon: '🩺', description: 'Primary care and general health consultations', doctorCount: 2 },
  { id: 7, name: 'Ophthalmology', icon: '👁️', description: 'Eye care and vision disorders', doctorCount: 1 },
  { id: 8, name: 'ENT', icon: '👂', description: 'Ear, nose and throat conditions', doctorCount: 1 },
];

export const doctors = [
  { id: 1, name: 'Dr. Arjun Mehta', departmentId: 1, specialization: 'Interventional Cardiology', experience: 15, fee: 800, availability: 'Mon-Fri 9AM-5PM', rating: 4.8, image: null, education: 'MBBS, MD (Cardiology), DM (Cardiology)' },
  { id: 2, name: 'Dr. Priya Sharma', departmentId: 1, specialization: 'Pediatric Cardiology', experience: 10, fee: 700, availability: 'Mon-Sat 10AM-4PM', rating: 4.6, image: null, education: 'MBBS, MD (Pediatrics), DM (Cardiology)' },
  { id: 3, name: 'Dr. Vikram Patel', departmentId: 2, specialization: 'Neurology & Stroke Management', experience: 18, fee: 1000, availability: 'Tue-Sat 9AM-6PM', rating: 4.9, image: null, education: 'MBBS, MD (Medicine), DM (Neurology)' },
  { id: 4, name: 'Dr. Sneha Reddy', departmentId: 3, specialization: 'Joint Replacement Surgery', experience: 12, fee: 900, availability: 'Mon-Fri 8AM-4PM', rating: 4.7, image: null, education: 'MBBS, MS (Orthopedics), MCh (Ortho)' },
  { id: 5, name: 'Dr. Amit Kumar', departmentId: 4, specialization: 'Neonatology', experience: 8, fee: 600, availability: 'Mon-Sat 10AM-7PM', rating: 4.5, image: null, education: 'MBBS, MD (Pediatrics), Fellowship (Neonatology)' },
  { id: 6, name: 'Dr. Neha Gupta', departmentId: 5, specialization: 'Cosmetic Dermatology', experience: 9, fee: 750, availability: 'Mon-Fri 10AM-5PM', rating: 4.4, image: null, education: 'MBBS, MD (Dermatology), Fellowship (Cosmetology)' },
  { id: 7, name: 'Dr. Rohan Desai', departmentId: 6, specialization: 'Internal Medicine', experience: 20, fee: 500, availability: 'Mon-Sat 8AM-8PM', rating: 4.3, image: null, education: 'MBBS, MD (Internal Medicine)' },
  { id: 8, name: 'Dr. Kavita Singh', departmentId: 7, specialization: 'Cataract & LASIK Surgery', experience: 14, fee: 850, availability: 'Mon-Sat 9AM-5PM', rating: 4.8, image: null, education: 'MBBS, MS (Ophthalmology), Fellowship (Cornea)' },
  { id: 9, name: 'Dr. Sanjay Verma', departmentId: 8, specialization: 'ENT & Head Neck Surgery', experience: 16, fee: 700, availability: 'Mon-Fri 9AM-6PM', rating: 4.6, image: null, education: 'MBBS, MS (ENT), DNB (ENT)' },
  { id: 10, name: 'Dr. Meera Joshi', departmentId: 3, specialization: 'Sports Medicine', experience: 7, fee: 650, availability: 'Mon-Sat 11AM-7PM', rating: 4.2, image: null, education: 'MBBS, DNB (Orthopedics), Fellowship (Sports Medicine)' },
];

export const patients = [
  { id: 1, patientId: 'PAT-100001', name: 'Rajesh Gupta', email: 'rajesh.g@email.com', phone: '9876543210', gender: 'Male', dob: '1985-06-15', bloodGroup: 'O+', address: '42, Sunshine Apartments, MG Road, Mumbai', registeredDate: '2025-01-10' },
  { id: 2, patientId: 'PAT-100002', name: 'Anita Deshmukh', email: 'anita.d@email.com', phone: '9876543211', gender: 'Female', dob: '1990-11-22', bloodGroup: 'A+', address: '15, Green Park Colony, Pune', registeredDate: '2025-02-05' },
  { id: 3, patientId: 'PAT-100003', name: 'Sunil Patil', email: 'sunil.p@email.com', phone: '9876543212', gender: 'Male', dob: '1978-03-08', bloodGroup: 'B+', address: '78, Lake View, Andheri East, Mumbai', registeredDate: '2025-02-18' },
  { id: 4, patientId: 'PAT-100004', name: 'Pooja Jain', email: 'pooja.j@email.com', phone: '9876543213', gender: 'Female', dob: '1995-09-30', bloodGroup: 'AB+', address: '3/12, Krishna Nagar, Delhi', registeredDate: '2025-03-01' },
  { id: 5, patientId: 'PAT-100005', name: 'Mohan Rao', email: 'mohan.r@email.com', phone: '9876543214', gender: 'Male', dob: '1965-12-12', bloodGroup: 'O-', address: '56, Gandhi Nagar, Bangalore', registeredDate: '2025-03-15' },
  { id: 6, patientId: 'PAT-100006', name: 'Lakshmi Nair', email: 'lakshmi.n@email.com', phone: '9876543215', gender: 'Female', dob: '2000-07-25', bloodGroup: 'B-', address: '22, Temple Road, Kochi', registeredDate: '2025-04-01' },
];

export const appointments = [
  { id: 1, patientId: 1, doctorId: 1, department: 'Cardiology', date: '2025-07-14', time: '09:30', status: 'scheduled', type: 'Consultation', reason: 'Chest pain and shortness of breath' },
  { id: 2, patientId: 2, doctorId: 7, department: 'General Medicine', date: '2025-07-14', time: '10:00', status: 'confirmed', type: 'Follow-up', reason: 'Blood pressure review' },
  { id: 3, patientId: 3, doctorId: 4, department: 'Orthopedics', date: '2025-07-13', time: '11:00', status: 'completed', type: 'Surgery Follow-up', reason: 'Knee replacement post-op check' },
  { id: 4, patientId: 4, doctorId: 3, department: 'Neurology', date: '2025-07-13', time: '14:00', status: 'completed', type: 'Consultation', reason: 'Chronic migraine treatment' },
  { id: 5, patientId: 5, doctorId: 2, department: 'Cardiology', date: '2025-07-12', time: '09:00', status: 'cancelled', type: 'Consultation', reason: 'ECG review' },
  { id: 6, patientId: 6, doctorId: 5, department: 'Pediatrics', date: '2025-07-15', time: '10:30', status: 'scheduled', type: 'Vaccination', reason: 'Routine vaccination for child' },
  { id: 7, patientId: 1, doctorId: 7, department: 'General Medicine', date: '2025-07-15', time: '15:00', status: 'confirmed', type: 'Check-up', reason: 'Annual health checkup' },
  { id: 8, patientId: 2, doctorId: 8, department: 'Ophthalmology', date: '2025-07-16', time: '11:00', status: 'scheduled', type: 'Consultation', reason: 'Vision test and glasses prescription' },
  { id: 9, patientId: 3, doctorId: 9, department: 'ENT', date: '2025-07-14', time: '16:30', status: 'confirmed', type: 'Consultation', reason: 'Ear infection treatment' },
  { id: 10, patientId: 4, doctorId: 6, department: 'Dermatology', date: '2025-07-12', time: '13:00', status: 'completed', type: 'Consultation', reason: 'Skin rash and allergy' },
  { id: 11, patientId: 5, doctorId: 10, department: 'Orthopedics', date: '2025-07-17', time: '09:00', status: 'scheduled', type: 'Physiotherapy', reason: 'Sports injury rehabilitation' },
  { id: 12, patientId: 6, doctorId: 1, department: 'Cardiology', date: '2025-07-18', time: '10:00', status: 'scheduled', type: 'Consultation', reason: 'Heart murmur evaluation' },
  { id: 13, patientId: 1, doctorId: 3, department: 'Neurology', date: '2025-07-11', time: '14:30', status: 'completed', type: 'Consultation', reason: 'Nerve conduction study' },
  { id: 14, patientId: 3, doctorId: 5, department: 'Pediatrics', date: '2025-07-19', time: '11:30', status: 'scheduled', type: 'Check-up', reason: 'Child growth assessment' },
  { id: 15, patientId: 2, doctorId: 4, department: 'Orthopedics', date: '2025-07-10', time: '09:30', status: 'cancelled', reason: 'Back pain consultation - patient rescheduled' },
];

export const prescriptions = [
  {
    id: 1,
    appointmentId: 3,
    patientId: 3,
    doctorId: 4,
    date: '2025-07-13',
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', quantity: 10 },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '7 days', quantity: 7 },
    ],
    notes: 'Take after meals. Avoid spicy food.',
    storeId: 1,
    status: 'dispensed',
  },
  {
    id: 2,
    appointmentId: 4,
    patientId: 4,
    doctorId: 3,
    date: '2025-07-13',
    medicines: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: '30 days', quantity: 10 },
      { name: 'Propranolol', dosage: '40mg', frequency: 'Once daily', duration: '30 days', quantity: 30 },
    ],
    notes: 'For migraine prophylaxis. Take Sumatriptan at onset of migraine.',
    storeId: 2,
    status: 'dispensed',
  },
  {
    id: 3,
    appointmentId: 10,
    patientId: 4,
    doctorId: 6,
    date: '2025-07-12',
    medicines: [
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '10 days', quantity: 10 },
      { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Apply twice daily', duration: '7 days', quantity: 1 },
    ],
    notes: 'Avoid known allergens. Use moisturizer regularly.',
    storeId: 1,
    status: 'active',
  },
  {
    id: 4,
    appointmentId: 13,
    patientId: 1,
    doctorId: 3,
    date: '2025-07-11',
    medicines: [
      { name: 'Gabapentin', dosage: '300mg', frequency: 'Twice daily', duration: '15 days', quantity: 30 },
      { name: 'Vitamin B Complex', dosage: 'One tablet', frequency: 'Once daily', duration: '30 days', quantity: 30 },
    ],
    notes: 'Neuropathic pain management. Review after 2 weeks.',
    storeId: 2,
    status: 'active',
  },
];

export const medicalStores = [
  { id: 1, name: 'City Pharmacy', address: '45, MG Road, Mumbai', phone: '022-23456789', email: 'citypharma@email.com' },
  { id: 2, name: 'HealthPlus Medical Store', address: '12, Lake View Complex, Andheri East, Mumbai', phone: '022-34567890', email: 'healthplus@email.com' },
  { id: 3, name: 'MediCare Drugs', address: '8, Green Park, Pune', phone: '020-45678901', email: 'medicare@email.com' },
];

export const users = [
  { id: 1, name: 'Dr. Arjun Mehta', email: 'arjun.mehta@clinic.com', role: 'doctor', status: 'active', lastLogin: '2025-07-13 08:30 AM' },
  { id: 2, name: 'Priya Sharma', email: 'priya.sharma@clinic.com', role: 'reception', status: 'active', lastLogin: '2025-07-13 09:00 AM' },
  { id: 3, name: 'Admin User', email: 'admin@clinic.com', role: 'admin', status: 'active', lastLogin: '2025-07-13 07:45 AM' },
  { id: 4, name: 'Rajesh Gupta', email: 'rajesh.g@email.com', role: 'patient', status: 'active', lastLogin: '2025-07-12 06:30 PM' },
  { id: 5, name: 'City Pharmacy', email: 'citypharma@email.com', role: 'medical_store', status: 'active', lastLogin: '2025-07-13 08:00 AM' },
  { id: 6, name: 'Dr. Vikram Patel', email: 'vikram.patel@clinic.com', role: 'doctor', status: 'active', lastLogin: '2025-07-12 07:15 PM' },
  { id: 7, name: 'Sneha Reddy', email: 'sneha.reddy@clinic.com', role: 'doctor', status: 'active', lastLogin: '2025-07-13 08:15 AM' },
  { id: 8, name: 'Reception Desk', email: 'reception@clinic.com', role: 'reception', status: 'active', lastLogin: '2025-07-13 09:00 AM' },
];

export const notifications = [
  { id: 1, message: 'New appointment booked by Rajesh Gupta', type: 'info', time: '5 minutes ago', read: false },
  { id: 2, message: 'Prescription #3 has been dispensed', type: 'success', time: '15 minutes ago', read: false },
  { id: 3, message: 'Appointment #5 was cancelled by patient', type: 'warning', time: '1 hour ago', read: false },
  { id: 4, message: 'Dr. Arjun Mehta marked as available', type: 'info', time: '2 hours ago', read: true },
  { id: 5, message: 'New patient registration: Lakshmi Nair', type: 'info', time: '3 hours ago', read: true },
  { id: 6, message: 'Medicine stock low: Paracetamol 500mg', type: 'warning', time: '5 hours ago', read: true },
  { id: 7, message: 'Monthly report for June is ready', type: 'success', time: '1 day ago', read: true },
];

export const recentActivities = [
  { id: 1, user: 'Priya Sharma', action: 'booked appointment', target: 'Rajesh Gupta with Dr. Arjun Mehta', time: '5 minutes ago' },
  { id: 2, user: 'Dr. Sneha Reddy', action: 'completed consultation', target: 'Sunil Patil (Orthopedics)', time: '30 minutes ago' },
  { id: 3, user: 'Admin User', action: 'added new user', target: 'Dr. Meera Joshi', time: '1 hour ago' },
  { id: 4, user: 'City Pharmacy', action: 'dispensed prescription', target: 'Prescription #3', time: '2 hours ago' },
  { id: 5, user: 'Priya Sharma', action: 'registered new patient', target: 'Lakshmi Nair', time: '3 hours ago' },
  { id: 6, user: 'Dr. Vikram Patel', action: 'updated medical records', target: 'Patient #4 (Pooja Jain)', time: '4 hours ago' },
];

export const statsData = {
  totalPatients: 1524,
  todayAppointments: 18,
  totalDoctors: 10,
  revenue: 284500,
  newPatientsThisMonth: 47,
  appointmentGrowth: 12,
  patientGrowth: 8,
  revenueGrowth: 15,
  pendingPrescriptions: 3,
  lowStockItems: 2,
  bedOccupancy: 68,
};

export const medicineInventory = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, price: 2.50, expiryDate: '2026-06-30', manufacturer: 'Cipla' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 200, price: 5.00, expiryDate: '2026-03-15', manufacturer: 'Sun Pharma' },
  { id: 3, name: 'Omeprazole 20mg', category: 'Antacid', stock: 300, price: 4.00, expiryDate: '2026-08-20', manufacturer: 'Dr. Reddy\'s' },
  { id: 4, name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 25, price: 3.00, expiryDate: '2025-12-31', manufacturer: 'Alkem' },
  { id: 5, name: 'Metformin 500mg', category: 'Antidiabetic', stock: 150, price: 6.00, expiryDate: '2026-05-10', manufacturer: 'Lupin' },
  { id: 6, name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 180, price: 7.00, expiryDate: '2026-07-25', manufacturer: 'Torrent' },
  { id: 7, name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', stock: 10, price: 3.50, expiryDate: '2026-01-15', manufacturer: 'Cipla' },
  { id: 8, name: 'Vitamin B Complex', category: 'Supplement', stock: 400, price: 8.00, expiryDate: '2026-11-30', manufacturer: 'Abbott' },
  { id: 9, name: 'Azithromycin 500mg', category: 'Antibiotic', stock: 90, price: 12.00, expiryDate: '2026-04-20', manufacturer: 'Pfizer' },
  { id: 10, name: 'Losartan 50mg', category: 'Antihypertensive', stock: 120, price: 9.00, expiryDate: '2026-09-05', manufacturer: 'Novartis' },
];

export const billingRecords = [
  { id: 1, patientId: 1, patientName: 'Rajesh Gupta', date: '2025-07-13', amount: 1200, status: 'paid', items: [{description: 'Consultation Fee', amount: 800}, {description: 'ECG Test', amount: 400}] },
  { id: 2, patientId: 3, patientName: 'Sunil Patil', date: '2025-07-13', amount: 3500, status: 'paid', items: [{description: 'Surgery Follow-up', amount: 900}, {description: 'X-Ray', amount: 600}, {description: 'Medicines', amount: 2000}] },
  { id: 3, patientId: 4, patientName: 'Pooja Jain', date: '2025-07-13', amount: 1500, status: 'pending', items: [{description: 'Neurology Consultation', amount: 1000}, {description: 'MRI Scan', amount: 500}] },
  { id: 4, patientId: 2, patientName: 'Anita Deshmukh', date: '2025-07-12', amount: 500, status: 'paid', items: [{description: 'General Checkup', amount: 500}] },
  { id: 5, patientId: 4, patientName: 'Pooja Jain', date: '2025-07-12', amount: 750, status: 'unpaid', items: [{description: 'Dermatology Consultation', amount: 750}] },
  { id: 6, patientId: 5, patientName: 'Mohan Rao', date: '2025-07-11', amount: 2000, status: 'paid', items: [{description: 'Cardiology Consultation', amount: 700}, {description: 'Stress Test', amount: 1300}] },
  { id: 7, patientId: 1, patientName: 'Rajesh Gupta', date: '2025-07-11', amount: 1800, status: 'paid', items: [{description: 'Nerve Conduction Study', amount: 1000}, {description: 'Neurology Consultation', amount: 800}] },
];

// Compatibility exports for files that expect these names
export const bills = billingRecords.map((b) => ({ ...b, grandTotal: b.amount }));

export const smsLogs = [
  { id: 1, recipient: 'Rajesh Gupta', phone: '9876543210', type: 'Appointment', status: 'Sent', date: '2025-07-13 09:00', message: 'Appointment reminder sent' },
  { id: 2, recipient: 'Anita Deshmukh', phone: '9876543211', type: 'Billing', status: 'Failed', date: '2025-07-12 11:30', message: 'Payment failed notification' },
];

export const consultations = [
  { id: 1, appointmentId: 3, doctorId: 4, patientId: 3, notes: 'Post-op check', date: '2025-07-13' },
];

export const currentDoctor = doctors[0] || null;
export const currentPatient = patients[0] || null;
export const currentMedicalStore = medicalStores[0] || null;

export const admin = users.find((u) => u.role === 'admin') || null;

export const clinics = [
  { id: 1, name: 'Central Clinic', address: '12 MG Road, Mumbai', phone: '022-12345678', email: 'central@clinic.com', workingHours: '9AM - 6PM', status: 'Active', doctorsCount: 8 },
  { id: 2, name: 'Northside Health', address: '45 North Ave, Pune', phone: '020-98765432', email: 'north@clinic.com', workingHours: '10AM - 5PM', status: 'Active', doctorsCount: 5 },
];
