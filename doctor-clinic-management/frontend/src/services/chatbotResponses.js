export const departments = [
  { id: 1, name: 'Cardiology', icon: '❤️' },
  { id: 2, name: 'Neurology', icon: '🧠' },
  { id: 3, name: 'Orthopedics', icon: '🦴' },
  { id: 4, name: 'Pediatrics', icon: '👶' },
  { id: 5, name: 'Dermatology', icon: '🔬' },
  { id: 6, name: 'General Medicine', icon: '🩺' },
  { id: 7, name: 'Ophthalmology', icon: '👁️' },
  { id: 8, name: 'ENT', icon: '👂' },
];

export const doctors = [
  { id: 1, name: 'Dr. Arjun Mehta', departmentId: 1, specialization: 'Interventional Cardiology', fee: 800, availability: 'Mon-Fri 9AM-5PM', rating: 4.8 },
  { id: 2, name: 'Dr. Priya Sharma', departmentId: 1, specialization: 'Pediatric Cardiology', fee: 700, availability: 'Mon-Sat 10AM-4PM', rating: 4.6 },
  { id: 3, name: 'Dr. Vikram Patel', departmentId: 2, specialization: 'Neurology & Stroke Management', fee: 1000, availability: 'Tue-Sat 9AM-6PM', rating: 4.9 },
  { id: 4, name: 'Dr. Sneha Reddy', departmentId: 3, specialization: 'Joint Replacement Surgery', fee: 900, availability: 'Mon-Fri 8AM-4PM', rating: 4.7 },
  { id: 5, name: 'Dr. Amit Kumar', departmentId: 4, specialization: 'Neonatology', fee: 600, availability: 'Mon-Sat 10AM-7PM', rating: 4.5 },
  { id: 6, name: 'Dr. Neha Gupta', departmentId: 5, specialization: 'Cosmetic Dermatology', fee: 750, availability: 'Mon-Fri 10AM-5PM', rating: 4.4 },
  { id: 7, name: 'Dr. Rohan Desai', departmentId: 6, specialization: 'Internal Medicine', fee: 500, availability: 'Mon-Sat 8AM-8PM', rating: 4.3 },
  { id: 8, name: 'Dr. Kavita Singh', departmentId: 7, specialization: 'Cataract & LASIK Surgery', fee: 850, availability: 'Mon-Sat 9AM-5PM', rating: 4.8 },
  { id: 9, name: 'Dr. Sanjay Verma', departmentId: 8, specialization: 'ENT & Head Neck Surgery', fee: 700, availability: 'Mon-Fri 9AM-6PM', rating: 4.6 },
  { id: 10, name: 'Dr. Meera Joshi', departmentId: 3, specialization: 'Sports Medicine', fee: 650, availability: 'Mon-Sat 11AM-7PM', rating: 4.2 },
];

export const patients = [
  { id: 1, patientId: 'PAT-100001', name: 'Rajesh Gupta', email: 'rajesh.g@email.com', phone: '9876543210', gender: 'Male', dob: '1985-06-15', bloodGroup: 'O+' },
  { id: 2, patientId: 'PAT-100002', name: 'Anita Deshmukh', email: 'anita.d@email.com', phone: '9876543211', gender: 'Female', dob: '1990-11-22', bloodGroup: 'A+' },
  { id: 3, patientId: 'PAT-100003', name: 'Sunil Patil', email: 'sunil.p@email.com', phone: '9876543212', gender: 'Male', dob: '1978-03-08', bloodGroup: 'B+' },
  { id: 4, patientId: 'PAT-100004', name: 'Pooja Jain', email: 'pooja.j@email.com', phone: '9876543213', gender: 'Female', dob: '1995-09-30', bloodGroup: 'AB+' },
  { id: 5, patientId: 'PAT-100005', name: 'Mohan Rao', email: 'mohan.r@email.com', phone: '9876543214', gender: 'Male', dob: '1965-12-12', bloodGroup: 'O-' },
  { id: 6, patientId: 'PAT-100006', name: 'Lakshmi Nair', email: 'lakshmi.n@email.com', phone: '9876543215', gender: 'Female', dob: '2000-07-25', bloodGroup: 'B-' },
];

export const appointments = [
  { id: 1, patientId: 1, doctorId: 1, department: 'Cardiology', date: '2025-07-14', time: '09:30', status: 'scheduled', type: 'Consultation' },
  { id: 2, patientId: 2, doctorId: 7, department: 'General Medicine', date: '2025-07-14', time: '10:00', status: 'confirmed', type: 'Follow-up' },
  { id: 3, patientId: 3, doctorId: 4, department: 'Orthopedics', date: '2025-07-13', time: '11:00', status: 'completed', type: 'Surgery Follow-up' },
  { id: 4, patientId: 4, doctorId: 3, department: 'Neurology', date: '2025-07-13', time: '14:00', status: 'completed', type: 'Consultation' },
  { id: 5, patientId: 5, doctorId: 2, department: 'Cardiology', date: '2025-07-12', time: '09:00', status: 'cancelled', type: 'Consultation' },
  { id: 6, patientId: 6, doctorId: 5, department: 'Pediatrics', date: '2025-07-15', time: '10:30', status: 'scheduled', type: 'Vaccination' },
  { id: 7, patientId: 1, doctorId: 7, department: 'General Medicine', date: '2025-07-15', time: '15:00', status: 'confirmed', type: 'Check-up' },
  { id: 8, patientId: 2, doctorId: 8, department: 'Ophthalmology', date: '2025-07-16', time: '11:00', status: 'scheduled', type: 'Consultation' },
  { id: 9, patientId: 3, doctorId: 9, department: 'ENT', date: '2025-07-14', time: '16:30', status: 'confirmed', type: 'Consultation' },
  { id: 10, patientId: 4, doctorId: 6, department: 'Dermatology', date: '2025-07-12', time: '13:00', status: 'completed', type: 'Consultation' },
];

export const prescriptions = [
  { id: 1, patientId: 3, doctorId: 4, date: '2025-07-13', medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', quantity: 10 }, { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '7 days', quantity: 7 }], notes: 'Take after meals.', status: 'dispensed' },
  { id: 2, patientId: 4, doctorId: 3, date: '2025-07-13', medicines: [{ name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: '30 days', quantity: 10 }, { name: 'Propranolol', dosage: '40mg', frequency: 'Once daily', duration: '30 days', quantity: 30 }], notes: 'For migraine prophylaxis.', status: 'dispensed' },
  { id: 3, patientId: 4, doctorId: 6, date: '2025-07-12', medicines: [{ name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '10 days', quantity: 10 }, { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Apply twice daily', duration: '7 days', quantity: 1 }], notes: 'Avoid allergens.', status: 'active' },
];

export const medicineInventory = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, price: 2.50, expiryDate: '2026-06-30', manufacturer: 'Cipla' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 200, price: 5.00, expiryDate: '2026-03-15', manufacturer: 'Sun Pharma' },
  { id: 3, name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 68, price: 8.00, expiryDate: '2028-03-01', manufacturer: 'Sun Pharma' },
  { id: 4, name: 'Omeprazole 20mg', category: 'Antacid', stock: 300, price: 4.00, expiryDate: '2026-08-20', manufacturer: 'Dr. Reddy\'s' },
  { id: 5, name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 25, price: 3.00, expiryDate: '2025-12-31', manufacturer: 'Alkem' },
  { id: 6, name: 'Metformin 500mg', category: 'Antidiabetic', stock: 150, price: 6.00, expiryDate: '2026-05-10', manufacturer: 'Lupin' },
  { id: 7, name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 180, price: 7.00, expiryDate: '2026-07-25', manufacturer: 'Torrent' },
  { id: 8, name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', stock: 10, price: 3.50, expiryDate: '2026-01-15', manufacturer: 'Cipla' },
  { id: 9, name: 'Azithromycin 500mg', category: 'Antibiotic', stock: 90, price: 12.00, expiryDate: '2026-04-20', manufacturer: 'Pfizer' },
  { id: 10, name: 'Losartan 50mg', category: 'Antihypertensive', stock: 120, price: 9.00, expiryDate: '2026-09-05', manufacturer: 'Novartis' },
];

export const medicalStores = [
  { id: 1, name: 'City Pharmacy', address: '45, MG Road, Mumbai', phone: '022-23456789', email: 'citypharma@email.com' },
  { id: 2, name: 'HealthPlus Medical Store', address: '12, Lake View Complex, Andheri East, Mumbai', phone: '022-34567890', email: 'healthplus@email.com' },
];

export const billingRecords = [
  { id: 1, patientId: 1, patientName: 'Rajesh Gupta', date: '2025-07-13', amount: 1200, status: 'paid' },
  { id: 2, patientId: 3, patientName: 'Sunil Patil', date: '2025-07-13', amount: 3500, status: 'paid' },
  { id: 3, patientId: 4, patientName: 'Pooja Jain', date: '2025-07-13', amount: 1500, status: 'pending' },
  { id: 4, patientId: 2, patientName: 'Anita Deshmukh', date: '2025-07-12', amount: 500, status: 'paid' },
  { id: 5, patientId: 4, patientName: 'Pooja Jain', date: '2025-07-12', amount: 750, status: 'unpaid' },
];

export const symptomDeptMap = {
  fever: { dept: 'General Medicine', deptId: 6, doctors: [7, 1] },
  cold: { dept: 'General Medicine', deptId: 6, doctors: [7] },
  cough: { dept: 'General Medicine', deptId: 6, doctors: [7] },
  headache: { dept: 'Neurology', deptId: 2, doctors: [3] },
  migraine: { dept: 'Neurology', deptId: 2, doctors: [3] },
  'body pain': { dept: 'Orthopedics', deptId: 3, doctors: [4, 10] },
  'joint pain': { dept: 'Orthopedics', deptId: 3, doctors: [4, 10] },
  'sore throat': { dept: 'ENT', deptId: 8, doctors: [9] },
  'ear pain': { dept: 'ENT', deptId: 8, doctors: [9] },
  'skin rash': { dept: 'Dermatology', deptId: 5, doctors: [6] },
  chest: { dept: 'Cardiology', deptId: 1, doctors: [1, 2] },
  vision: { dept: 'Ophthalmology', deptId: 7, doctors: [8] },
  child: { dept: 'Pediatrics', deptId: 4, doctors: [5] },
  stomach: { dept: 'General Medicine', deptId: 6, doctors: [7] },
  vomiting: { dept: 'General Medicine', deptId: 6, doctors: [7] },
  diarrhea: { dept: 'General Medicine', deptId: 6, doctors: [7] },
};

export const quickActionsByRole = {
  patient: [
    { id: 'symptoms', label: 'Check Symptoms', icon: '🔍' },
    { id: 'tips', label: 'Health Tips', icon: '💡' },
    { id: 'faq', label: 'FAQs', icon: '❓' },
    { id: 'reminder', label: 'Medicine Reminder', icon: '⏰' },
    { id: 'diet', label: 'Diet Tips', icon: '🥗' },
  ],
  reception: [
    { id: 'find_patient', label: 'Find Patient', icon: '🔎' },
    { id: 'book_appointment', label: 'Book Appointment', icon: '📅' },
    { id: 'doctor_availability', label: 'Doctor Availability', icon: '👨‍⚕️' },
    { id: 'today_summary', label: 'Today Summary', icon: '📋' },
    { id: 'billing_help', label: 'Billing Help', icon: '💰' },
  ],
  doctor: [
    { id: 'patient_history', label: 'Patient History', icon: '📜' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'medicine_info', label: 'Medicine Info', icon: '📖' },
    { id: 'treatment_guide', label: 'Treatment Guide', icon: '📋' },
    { id: 'followup', label: 'Follow-up', icon: '📅' },
  ],
  medical_store: [
    { id: 'check_stock', label: 'Check Stock', icon: '📦' },
    { id: 'verify_prescription', label: 'Verify Prescription', icon: '✅' },
    { id: 'low_stock', label: 'Low Stock Alerts', icon: '⚠️' },
    { id: 'expiry', label: 'Expiry Alerts', icon: '📅' },
    { id: 'generic', label: 'Generic Suggestions', icon: '🔄' },
  ],
  admin: [
    { id: 'today_summary', label: 'Today Summary', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'search', label: 'Search Patient', icon: '🔎' },
    { id: 'reports', label: 'Generate Report', icon: '📄' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
  ],
};

export const welcomeMessages = {
  patient: {
    title: 'Welcome! How can I help you today?',
    subtitle: 'I can check symptoms, suggest health tips, answer FAQs, and more.',
  },
  reception: {
    title: 'Welcome, Reception!',
    subtitle: 'I can help find patients, manage appointments, doctor availability, and billing.',
  },
  doctor: {
    title: 'Welcome, Doctor!',
    subtitle: 'I can show patient history, prescriptions, medicine info, and treatment guidelines.',
  },
  medical_store: {
    title: 'Welcome!',
    subtitle: 'I can check stock, verify prescriptions, show low stock alerts, and more.',
  },
  admin: {
    title: 'Welcome, Admin!',
    subtitle: 'I can show analytics, summaries, generate reports, and provide AI insights.',
  },
};
