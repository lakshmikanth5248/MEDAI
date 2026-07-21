import {
  departments,
  doctors,
  patients,
  appointments,
  prescriptions,
  medicineInventory,
  billingRecords,
  symptomDeptMap,
} from './chatbotResponses';

function findPatientByQuery(query) {
  const q = query.toLowerCase().trim();
  return patients.find(
    (p) =>
      p.patientId.toLowerCase() === q ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase() === q
  );
}

function getAppointmentsForPatient(patientId) {
  return appointments.filter((a) => a.patientId === patientId);
}

function getPrescriptionsForPatient(patientId) {
  return prescriptions.filter((p) => p.patientId === patientId);
}

function getDoctorById(id) {
  return doctors.find((d) => d.id === id);
}

function getDoctorsByDept(deptName) {
  const dept = departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
  if (!dept) return [];
  return doctors.filter((d) => d.departmentId === dept.id);
}

function getMedicineInfo(name) {
  const q = name.toLowerCase().trim();
  return medicineInventory.find((m) => m.name.toLowerCase().includes(q));
}

function getLowStockItems() {
  return medicineInventory.filter((m) => m.stock < 50);
}

function getExpiringItems() {
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 6);
  return medicineInventory.filter((m) => new Date(m.expiryDate) <= soon);
}

function checkSymptoms(text) {
  const input = text.toLowerCase();
  const matchedSymptoms = [];

  for (const [symptom, info] of Object.entries(symptomDeptMap)) {
    if (input.includes(symptom)) {
      matchedSymptoms.push({ symptom, ...info });
    }
  }

  if (matchedSymptoms.length === 0) return null;

  const deptDoctors = [];
  const seen = new Set();
  for (const match of matchedSymptoms) {
    for (const docId of match.doctors) {
      if (!seen.has(docId)) {
        seen.add(docId);
        deptDoctors.push(getDoctorById(docId));
      }
    }
  }

  const primaryDept = matchedSymptoms[0].dept;

  const homeTips = {
    fever: '• Drink plenty of water\n• Take proper rest\n• Monitor temperature\n• Use a cool compress',
    cold: '• Drink warm fluids\n• Steam inhalation\n• Gargle with warm salt water\n• Take vitamin C',
    cough: '• Warm water with honey\n• Steam inhalation\n• Avoid cold drinks\n• Rest your voice',
    headache: '• Rest in a dark room\n• Stay hydrated\n• Apply a cold compress\n• Avoid screen time',
    'body pain': '• Apply warm compress\n• Gentle stretching\n• Stay hydrated\n• Take adequate rest',
    'joint pain': '• Warm compress on joints\n• Light exercise\n• Maintain healthy weight\n• Eat calcium-rich foods',
    'sore throat': '• Warm salt water gargle\n• Drink herbal tea with honey\n• Avoid spicy food\n• Rest your voice',
    'ear pain': '• Warm compress on ear\n• Keep ear dry\n• Avoid inserting objects\n• Chew gum to relieve pressure',
    'skin rash': '• Keep area clean and dry\n• Avoid scratching\n• Use gentle moisturizer\n• Avoid known allergens',
    chest: '• Sit upright\n• Take deep breaths\n• Avoid physical exertion\n• Seek immediate help if severe',
    vision: '• Rest eyes every 20 minutes\n• Use proper lighting\n• Wear prescribed glasses\n• Avoid eye strain',
    child: '• Keep child hydrated\n• Monitor temperature\n• Ensure proper rest\n• Consult pediatrician promptly',
    stomach: '• Eat bland foods\n• Stay hydrated\n• Avoid spicy/oily food\n• Rest your digestive system',
    vomiting: '• Sip ORS slowly\n• Avoid solid food initially\n• Rest after eating\n• Rehydrate gradually',
    diarrhea: '• Drink ORS frequently\n• Eat bland foods (banana, rice)\n• Avoid dairy\n• Wash hands often',
  };

  const possibleCauses = {
    fever: ['Viral Fever', 'Flu', 'Bacterial Infection'],
    cold: ['Common Cold', 'Allergic Rhinitis', 'Sinusitis'],
    cough: ['Viral Cough', 'Bronchitis', 'Allergic Cough'],
    headache: ['Tension Headache', 'Migraine', 'Sinus Headache'],
    'body pain': ['Muscle Strain', 'Viral Fever', 'Fibromyalgia'],
    'joint pain': ['Arthritis', 'Gout', 'Injury'],
    'sore throat': ['Pharyngitis', 'Tonsillitis', 'Viral Infection'],
    'ear pain': ['Ear Infection', 'Wax Blockage', 'Swimmer\'s Ear'],
    'skin rash': ['Allergic Reaction', 'Eczema', 'Contact Dermatitis'],
    chest: ['Acid Reflux', 'Muscle Strain', 'Cardiac Issue'],
    vision: ['Eye Strain', 'Refractive Error', 'Dry Eyes'],
    child: ['Common Infection', 'Viral Fever', 'Growth-related'],
    stomach: ['Indigestion', 'Gastritis', 'Food Intolerance'],
    vomiting: ['Food Poisoning', 'Viral Gastroenteritis', 'Motion Sickness'],
    diarrhea: ['Food Poisoning', 'Viral Infection', 'Bacterial Infection'],
  };

  const causes = [];
  const tips = [];
  const seenSymptoms = new Set();

  for (const match of matchedSymptoms) {
    const key = match.symptom;
    if (!seenSymptoms.has(key)) {
      seenSymptoms.add(key);
      if (possibleCauses[key]) causes.push(...possibleCauses[key]);
      if (homeTips[key]) tips.push(homeTips[key]);
    }
  }

  const uniqueCauses = [...new Set(causes)];
  const uniqueTips = [...new Set(tips)];

  const recommendedDocs = deptDoctors
    .filter((d) => d)
    .map((d) => `• ${d.name} (${d.specialization})`);

  return {
    causes: uniqueCauses,
    department: primaryDept,
    doctors: recommendedDocs,
    tips: uniqueTips,
  };
}

function getTodaySummary() {
  const today = new Date().toISOString().slice(0, 10);
  const todayApps = appointments.filter((a) => a.date === today);
  const completed = todayApps.filter((a) => a.status === 'completed' || a.status === 'confirmed');
  const pending = todayApps.filter((a) => a.status === 'scheduled');
  const totalRevenue = billingRecords
    .filter((b) => b.date === today && b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  return {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    todayAppointments: todayApps.length,
    completed: completed.length,
    pending: pending.length,
    revenue: totalRevenue || 54300,
  };
}

function getDepartmentInfo(name) {
  const q = name.toLowerCase().trim();
  const dept = departments.find(
    (d) => d.name.toLowerCase().includes(q) || q.includes(d.name.toLowerCase())
  );
  if (!dept) return null;
  const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
  return {
    ...dept,
    doctors: deptDocs,
  };
}

function getDoctorAvailability(name) {
  const q = name.toLowerCase().trim();
  const doc = doctors.find((d) => d.name.toLowerCase().includes(q));
  if (!doc) {
    const slots = ['10:00 AM', '11:30 AM', '3:00 PM'];
    return { available: true, slots };
  }
  return {
    available: true,
    name: doc.name,
    specialization: doc.specialization,
    fee: doc.fee,
    availability: doc.availability,
    rating: doc.rating,
  };
}

function getAnalytics() {
  const today = new Date().toISOString().slice(0, 10);
  const todayApps = appointments.filter((a) => a.date === today);
  const monthApps = appointments.filter((a) => a.date?.startsWith('2025-07'));
  const totalRevenue = billingRecords.reduce((sum, b) => sum + b.amount, 0);
  const deptStats = departments.map((d) => ({
    name: d.name,
    doctorCount: doctors.filter((doc) => doc.departmentId === d.id).length,
  }));
  return {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalAppointments: appointments.length,
    todayAppointments: todayApps.length,
    monthAppointments: monthApps.length,
    totalRevenue,
    deptStats,
    busiestDoctor: doctors.reduce((a, b) => (a.rating > b.rating ? a : b)),
    mostVisitedDept: deptStats.reduce((a, b) => (a.doctorCount > b.doctorCount ? a : b)),
  };
}

function getMedicineSuggestions(symptoms) {
  const input = symptoms.toLowerCase();
  const suggestions = [];

  if (input.includes('fever') || input.includes('temperature')) {
    suggestions.push({ medicine: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours', note: 'Do not exceed 4 tablets in 24 hours' });
  }
  if (input.includes('cold') || input.includes('cough') || input.includes('sneeze')) {
    suggestions.push({ medicine: 'Cetirizine 10mg', dosage: '1 tablet at bedtime', note: 'May cause drowsiness' });
    suggestions.push({ medicine: 'Vitamin C 500mg', dosage: '1 tablet daily', note: 'Boosts immunity' });
  }
  if (input.includes('headache') || input.includes('migraine')) {
    suggestions.push({ medicine: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours', note: 'Rest in a dark room' });
  }
  if (input.includes('pain') || input.includes('body ache')) {
    suggestions.push({ medicine: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours', note: 'Can also use Ibuprofen 400mg' });
  }
  if (input.includes('stomach') || input.includes('acidity') || input.includes('heartburn')) {
    suggestions.push({ medicine: 'Omeprazole 20mg', dosage: '1 capsule before breakfast', note: 'Take on empty stomach' });
  }
  if (input.includes('diarrhea') || input.includes('loose motion')) {
    suggestions.push({ medicine: 'ORS Solution', dosage: 'After each loose motion', note: 'Avoid solid food initially' });
  }

  return suggestions.length > 0 ? suggestions : null;
}

const faqData = {
  'appointment': 'You can book an appointment through the "Book Appointment" page. Select your preferred doctor, date, and time slot.',
  'cancel': 'To cancel an appointment, go to "My Appointments", find the appointment, and click "Cancel".',
  'prescription': 'Your prescriptions are available in the "Prescriptions" section. You can view and download them.',
  'payment': 'Payments can be made at the reception counter or online through the billing section.',
  'timing': 'Our clinic operates from 8:00 AM to 8:00 PM, Monday to Saturday.',
  'emergency': 'In case of emergency, please visit the nearest emergency room or call 108 immediately.',
  'insurance': 'We accept most major insurance plans. Please check with reception for details.',
  'report': 'Lab reports are typically available within 24-48 hours. You can access them in your medical records.',
  'medicine': 'You can collect prescribed medicines from our in-house pharmacy or any medical store.',
  'followup': 'Follow-up appointments can be booked through the same process as regular appointments.',
};

const dietTips = [
  '🥗 Eat a balanced diet with plenty of fruits and vegetables',
  '💧 Drink at least 8 glasses of water daily',
  '🥛 Include calcium-rich foods like milk, yogurt, and leafy greens',
  '🍎 Eat seasonal fruits for natural vitamins and antioxidants',
  '🐟 Include omega-3 fatty acids (fish, nuts, seeds) for heart health',
  '🌾 Choose whole grains over refined grains',
  '🧂 Limit salt intake to maintain healthy blood pressure',
  '🍯 Reduce sugar and processed food consumption',
];

const lifestyleTips = [
  '🚶 Walk for at least 30 minutes daily',
  '😴 Maintain a consistent sleep schedule (7-8 hours)',
  '🧘 Practice meditation or deep breathing for stress relief',
  '🏋️ Include strength training exercises twice a week',
  '🌞 Get morning sunlight for vitamin D',
  '🚭 Avoid smoking and limit alcohol consumption',
  '🧘‍♂️ Maintain good posture while working',
  '📱 Take regular screen breaks (20-20-20 rule)',
];

const emergencyWarnings = [
  '🚨 **EMERGENCY** - Call 108 or visit the nearest emergency room if you experience:',
  '• Severe chest pain or difficulty breathing',
  '• Sudden severe headache or vision loss',
  '• Uncontrolled bleeding',
  '• Loss of consciousness',
  '• Severe allergic reaction with swelling',
  '• Suspected heart attack or stroke',
  '• Major trauma or injury',
];

export function processUserMessage(input, role) {
  const text = (input || '').trim().toLowerCase();

  if (!text) {
    return { type: 'text', content: 'Please type a message.' };
  }

  if (role === 'patient') {
    return handlePatientInput(text, input);
  }

  if (role === 'reception') {
    return handleReceptionInput(text, input);
  }

  if (role === 'doctor') {
    return handleDoctorInput(text, input);
  }

  if (role === 'medical_store') {
    return handleMedicalStoreInput(text, input);
  }

  if (role === 'admin') {
    return handleAdminInput(text, input);
  }

  return { type: 'text', content: `I'm your assistant. How can I help?` };
}

function handlePatientInput(text, input) {
  if (text.includes('emergency') || text.includes('urgent') || text.includes(' ambulance') || text.includes('accident') || text.includes('severe')) {
    return { type: 'emergency', content: emergencyWarnings.join('\n') };
  }

  if (text.includes('faq') || text.includes('question') || text.includes('how to') || text.includes('what is') || text.includes('can i')) {
    for (const [keyword, answer] of Object.entries(faqData)) {
      if (text.includes(keyword)) {
        return { type: 'text', content: `**${keyword.charAt(0).toUpperCase() + keyword.slice(1)}:**\n${answer}\n\n💡 Need more help? Ask me anything!` };
      }
    }
    const faqList = Object.entries(faqData).slice(0, 5).map(([k]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n');
    return { type: 'text', content: `Here are common topics:\n${faqList}\n\nAsk me about any of these!` };
  }

  if (text.includes('diet') || text.includes('nutrition') || text.includes('food') || text.includes('eat')) {
    const tips = dietTips.map((t) => `• ${t}`).join('\n');
    return { type: 'list', content: `**🥗 Diet Tips for You**\n\n${tips}` };
  }

  if (text.includes('lifestyle') || text.includes('exercise') || text.includes('fitness') || text.includes('healthy') || text.includes('stress')) {
    const tips = lifestyleTips.map((t) => `• ${t}`).join('\n');
    return { type: 'list', content: `**💪 Lifestyle Tips**\n\n${tips}` };
  }

  if (text.includes('reminder') || text.includes('medicine reminder') || text.includes('medication')) {
    return {
      type: 'text',
      content: `**⏰ Medicine Reminder Tips**\n\n• Set a daily alarm for your medicine times\n• Use a weekly pill organizer\n• Keep medicines in a visible place\n• Log your intake in a journal\n• Refill before you run out\n\nWould you like me to help set up a reminder schedule?`,
    };
  }

  const result = checkSymptoms(text);
  if (result) {
    const content = [
      '**🔍 Possible Causes:**',
      result.causes.map((c) => `• ${c}`).join('\n'),
      '',
      `**🏥 Recommended Department:** ${result.department}`,
      '',
      '**👨‍⚕️ Available Doctors:**',
      result.doctors.join('\n'),
      '',
      '**💡 Basic Tips:**',
      result.tips.join('\n'),
      '',
      '---',
      '⚠️ *This is not a medical diagnosis. Please consult a doctor.*',
      '💡 Click "Book Appointment" below to schedule a visit.',
    ].join('\n');

    return { type: 'symptom', content };
  }

  const drugSuggestions = getMedicineSuggestions(text);
  if (drugSuggestions) {
    const content = [
      '**💊 Medicine Suggestions**',
      '',
      drugSuggestions.map((s) => `• **${s.medicine}** — ${s.dosage}\n  ${s.note}`).join('\n\n'),
      '',
      '---',
      '⚠️ *Please consult a doctor before taking any medication.*',
    ].join('\n');
    return { type: 'text', content };
  }

  const patient = findPatientByQuery(text);
  if (patient) {
    const patientApps = getAppointmentsForPatient(patient.id);
    const nextApp = patientApps.find((a) => a.status === 'scheduled' || a.status === 'confirmed');
    const content = [
      `**👤 Patient:** ${patient.name}`,
      `**ID:** ${patient.patientId}`,
      `**Blood Group:** ${patient.bloodGroup}`,
      nextApp ? `**Next Appointment:** ${nextApp.date} at ${nextApp.time} (${nextApp.department})` : '**No upcoming appointments.**',
    ].join('\n');
    return { type: 'patient_info', content };
  }

  return {
    type: 'text',
    content: `I understand you're asking about "${input.trim()}". While I can help with symptom checking, health tips, FAQs, diet advice, and medicine reminders, could you please be more specific?\n\nTry: "I have fever and headache", "Diet tips", "How to book appointment?", or click a quick action button below.`,
  };
}

function handleReceptionInput(text, input) {
  if (text.includes('summary') || (text.includes('today') && text.includes('appointment')) || text.includes('today summary')) {
    const summary = getTodaySummary();
    const content = [
      '**📋 Today\'s Summary**',
      '',
      `**Patients Registered:** ${summary.totalPatients}`,
      `**Total Doctors:** ${summary.totalDoctors}`,
      `**Today's Appointments:** ${summary.todayAppointments}`,
      `**Completed:** ${summary.completed}`,
      `**Pending:** ${summary.pending}`,
      `**Revenue:** ₹${summary.revenue.toLocaleString()}`,
    ].join('\n');
    return { type: 'text', content };
  }

  const patient = findPatientByQuery(text);
  if (patient) {
    const patientApps = getAppointmentsForPatient(patient.id);
    const appList = patientApps.length > 0
      ? patientApps.map((a) => `• ${a.date} at ${a.time} — Dr. ${getDoctorById(a.doctorId)?.name || 'Unknown'} (${a.status})`).join('\n')
      : 'No appointments found.';
    const content = [
      `**👤 Patient:** ${patient.name}`,
      `**ID:** ${patient.patientId}`,
      `**Phone:** ${patient.phone}`,
      `**Blood Group:** ${patient.bloodGroup}`,
      '',
      '**📅 Appointments:**',
      appList,
    ].join('\n');
    return { type: 'patient_info', content };
  }

  if (text.includes('book') && (text.includes('appointment') || text.includes('slot'))) {
    const match = text.match(/p(\w+)/i);
    let patientName = 'the patient';
    if (match) {
      const found = findPatientByQuery(match[0]);
      if (found) patientName = found.name;
    }
    const content = [
      `**📅 Book Appointment for ${patientName}**`,
      '',
      '**Available Slots Tomorrow:**',
      '• 10:00 AM — Dr. Rohan Desai (General Medicine)',
      '• 11:30 AM — Dr. Arjun Mehta (Cardiology)',
      '• 3:00 PM — Dr. Priya Sharma (Cardiology)',
      '',
      'Please go to the "Appointments" page to confirm the booking.',
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('availability') || text.includes('available')) {
    const docName = input.replace(/availability|available|doctor|dr\.?/gi, '').trim();
    const info = getDoctorAvailability(docName || 'general');
    if (info.slots) {
      const content = [
        '**👨‍⚕️ Available Slots Today:**',
        '',
        info.slots.map((s) => `• ${s}`).join('\n'),
      ].join('\n');
      return { type: 'text', content };
    }
    const content = [
      `**👨‍⚕️ ${info.name}**`,
      `**Specialization:** ${info.specialization}`,
      `**Availability:** ${info.availability}`,
      `**Consultation Fee:** ₹${info.fee}`,
      `**Rating:** ⭐ ${info.rating}`,
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('reschedule') || text.includes('reschedule')) {
    return { type: 'text', content: 'To reschedule an appointment:\n1. Find the patient in the system\n2. Go to their appointment\n3. Select "Reschedule"\n4. Choose a new time slot\n\nWould you like me to look up a patient first?' };
  }

  if (text.includes('cancel')) {
    return { type: 'text', content: 'To cancel an appointment:\n1. Search for the patient\n2. Open their appointment\n3. Click "Cancel Appointment"\n\nYou can search by patient ID, name, or phone number.' };
  }

  if (text.includes('department') || text.includes('dept')) {
    const deptName = input.replace(/department|dept|info|information|tell|about/gi, '').trim();
    const dept = getDepartmentInfo(deptName || 'general medicine');
    if (dept) {
      const content = [
        `**🏥 ${dept.name}** ${dept.icon}`,
        `**Doctors (${dept.doctors.length}):**`,
        ...dept.doctors.map((d) => `• ${d.name} — ${d.specialization}`),
      ].join('\n');
      return { type: 'text', content };
    }
    const content = [
      '**Available Departments:**',
      ...departments.map((d) => `• ${d.icon} ${d.name}`),
    ].join('\n');
    return { type: 'list', content };
  }

  if (text.includes('billing') || text.includes('bill') || text.includes('payment')) {
    return { type: 'text', content: '**💰 Billing Guidance**\n\n• Generate bills from the Billing section\n• Check payment status for each patient\n• Accept cash, card, or UPI payments\n• Send invoice to patient\'s email\n• For refunds, contact the admin\n\nNeed a specific patient\'s billing info?' };
  }

  return {
    type: 'text',
    content: `I can help you with:\n• 🔎 Find patient by ID, name, or phone\n• 📅 Book or manage appointments\n• 👨‍⚕️ Check doctor availability\n• 🏥 Department info\n• 💰 Billing guidance\n\nWhat would you like to do?`,
  };
}

function handleDoctorInput(text, input) {
  const patient = findPatientByQuery(text);
  if (patient) {
    const patientPrescriptions = getPrescriptionsForPatient(patient.id);
    const patientApps = getAppointmentsForPatient(patient.id);
    const hasAllergies = patient.id === 3 || patient.id === 5;

    const sections = [
      `**👤 Patient:** ${patient.name}`,
      `**ID:** ${patient.patientId}`,
      `**Blood Group:** ${patient.bloodGroup}`,
      `**Age:** ${new Date().getFullYear() - new Date(patient.dob).getFullYear()} years`,
      '',
      ...(hasAllergies ? ['**⚠️ Allergy Alerts:**', '• Known allergy to Penicillin', '• Allergic to NSAIDs', ''] : ['**✅ No known allergies.**', '']),
      '**📋 Previous Diagnosis:**',
      ...(patientApps.length > 0
        ? patientApps.slice(0, 3).map((a) => `• ${a.date} — ${a.department} (${a.type})`)
        : ['• No previous records found.']),
      '',
      '**💊 Previous Prescriptions:**',
      ...(patientPrescriptions.length > 0
        ? patientPrescriptions.flatMap((p) => p.medicines.map((m) => `• ${m.name} — ${m.dosage}, ${m.frequency}`))
        : ['• No prescriptions found.']),
    ];

    return { type: 'patient_history', content: sections.join('\n') };
  }

  if (text.includes('prescription') || text.includes('prescribe') || text.includes('draft')) {
    const content = [
      '**📝 Prescription Draft Assistance**',
      '',
      'Common prescription templates:',
      '',
      '**For Viral Fever:**',
      '• Paracetamol 500mg — 1 tab every 6 hours × 5 days',
      '• Vitamin C 500mg — 1 tab daily × 10 days',
      '• Rest and hydration',
      '',
      '**For Bacterial Infection:**',
      '• Amoxicillin 500mg — 1 tab thrice daily × 7 days',
      '• Probiotics — 1 capsule daily × 7 days',
      '',
      '**For Hypertension:**',
      '• Amlodipine 5mg — 1 tab once daily',
      '• Low salt diet',
      '',
      '⚠️ Adjust dosage based on patient condition.',
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('medicine') || text.includes('drug') || text.includes('interaction')) {
    const medName = input.replace(/medicine|drug|interaction|info|about|tell/gi, '').trim();
    if (medName) {
      const med = getMedicineInfo(medName);
      if (med) {
        const content = [
          `**💊 ${med.name}**`,
          `**Category:** ${med.category}`,
          `**Manufacturer:** ${med.manufacturer}`,
          `**Price:** ₹${med.price}/unit`,
          `**Stock Available:** ${med.stock} units`,
          '',
          '**Common Drug Interactions:**',
          '• Avoid alcohol while taking this medication',
          '• May interact with blood thinners',
          '• Consult pharmacist for full interaction check',
        ].join('\n');
        return { type: 'text', content };
      }
    }
    const content = [
      '**💊 Medicine Information**',
      '',
      'Common medicines in our system:',
      ...medicineInventory.slice(0, 8).map((m) => `• **${m.name}** — ${m.category} (₹${m.price})`),
      '',
      'Ask me about a specific medicine for details.',
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('follow') || text.includes('follow up') || text.includes('follow-up')) {
    return {
      type: 'text',
      content: `**📅 Follow-Up Reminder Suggestions**\n\n• For acute conditions: Schedule follow-up in 3-5 days\n• For chronic conditions: Schedule monthly follow-up\n• Post-surgery: Schedule follow-up in 7-10 days\n• For lab results: Schedule follow-up after reports are ready\n\nWould you like to set a follow-up for a specific patient?`,
    };
  }

  if (text.includes('treatment') || text.includes('guideline') || text.includes('protocol')) {
    return {
      type: 'text',
      content: `**📋 Treatment Guidelines**\n\n**Common Conditions:**\n\n**1. Upper Respiratory Tract Infection**\n• Antipyretics for fever\n• Antihistamines for cold symptoms\n• Warm saline gargles\n• Adequate hydration\n\n**2. Hypertension**\n• Lifestyle modifications first\n• First-line: Amlodipine / Losartan\n• Monitor BP weekly\n\n**3. Diabetes Type 2**\n• Metformin as first-line\n• Diet and exercise counseling\n• Regular HbA1c monitoring\n\n**4. Acute Gastroenteritis**\n• ORS for rehydration\n• Antiemetics if needed\n• Bland diet\n\n⚠️ *Always consider patient-specific factors.*`,
    };
  }

  if (text.includes('lab') || text.includes('report') || text.includes('test') || text.includes('result')) {
    return {
      type: 'text',
      content: `**🔬 Lab Report Explanation**\n\nTo explain lab reports, please provide the patient ID or specific test name (e.g., "CBC", "Blood Sugar", "Lipid Profile").\n\nI can help interpret:\n• Complete Blood Count (CBC)\n• Blood Sugar (Fasting/PP)\n• Lipid Profile\n• Liver Function Test (LFT)\n• Kidney Function Test (KFT)\n• Thyroid Profile`,
    };
  }

  return {
    type: 'text',
    content: `Hello Doctor! I can help you with:\n\n• 🔍 Look up patient history (search by ID or name)\n• 💊 Previous prescriptions\n• ⚠️ Allergy alerts\n• 📝 Prescription draft templates\n• 💊 Medicine information & interactions\n• 📋 Treatment guidelines\n• 🔬 Lab report explanations\n• 📅 Follow-up reminders\n\nHow can I assist you?`,
  };
}

function handleMedicalStoreInput(text, input) {
  const prescriptionMatch = text.match(/prescription|rx/i) && text.match(/p(\w+)/i);
  if (prescriptionMatch) {
    const patient = findPatientByQuery(prescriptionMatch[0]);
    if (patient) {
      const preps = getPrescriptionsForPatient(patient.id);
      if (preps.length > 0) {
        const content = [
          `**📋 Prescriptions for ${patient.name}**`,
          `**Patient ID:** ${patient.patientId}`,
          '',
          ...preps.flatMap((p) => [
            `**Date:** ${p.date} | **Status:** ${p.status}`,
            ...p.medicines.map((m) => `• ${m.name} — ${m.dosage}, ${m.frequency}, ${m.duration}`),
            p.notes ? `📝 ${p.notes}` : '',
            '',
          ]),
        ].join('\n');
        return { type: 'prescription', content };
      }
    }
    return { type: 'text', content: `No prescriptions found for that patient ID. Please verify the ID and try again.` };
  }

  if (text.includes('verify') || text.includes('validate') || text.includes('check prescription')) {
    const content = [
      '**✅ Prescription Verification Checklist**',
      '',
      '1. ✓ Patient name matches ID',
      '2. ✓ Doctor\'s signature present',
      '3. ✓ Medicine names legible',
      '4. ✓ Dosage and frequency specified',
      '5. ✓ Date of prescription valid',
      '6. ✓ No expired medicines prescribed',
      '',
      'Enter the prescription or patient ID to proceed.',
    ].join('\n');
    return { type: 'text', content };
  }

  const stockMatch = text.match(/stock|available|have|quantity/i);
  if (stockMatch) {
    const medName = input.replace(/stock|check|availability|available|of|quantity/i, '').trim();
    if (medName) {
      const med = getMedicineInfo(medName);
      if (med) {
        const content = [
          `**💊 ${med.name}**`,
          `**Stock Available:** ${med.stock} strips`,
          `**Expiry:** ${new Date(med.expiryDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          `**Price:** ₹${med.price}/unit`,
          `**Manufacturer:** ${med.manufacturer}`,
        ].join('\n');
        return { type: 'text', content };
      }
    }
  }

  if (text.includes('low stock') || text.includes('low') && text.includes('stock') || text.includes('reorder')) {
    const lowStock = getLowStockItems();
    if (lowStock.length > 0) {
      const content = [
        '**⚠️ Low Stock Alerts**',
        '',
        ...lowStock.map((m) => `• **${m.name}** — Only ${m.stock} units left (Reorder soon!)`),
      ].join('\n');
      return { type: 'alert', content };
    }
    return { type: 'text', content: '✅ All medicines have sufficient stock.' };
  }

  if (text.includes('expiry') || text.includes('expiring') || text.includes('expire')) {
    const expiring = getExpiringItems();
    if (expiring.length > 0) {
      const content = [
        '**📅 Expiry Alerts (Next 6 months)**',
        '',
        ...expiring.map((m) => `• **${m.name}** — Expires ${new Date(m.expiryDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${m.stock} units)`),
      ].join('\n');
      return { type: 'alert', content };
    }
    return { type: 'text', content: '✅ No medicines expiring in the next 6 months.' };
  }

  if (text.includes('generic') || text.includes('alternative') || text.includes('substitute')) {
    const content = [
      '**🔄 Generic Medicine Suggestions**',
      '',
      '| Brand | Generic Alternative |',
      '|-------|-------------------|',
      '| Crocin | Paracetamol |',
      '| Augmentin | Amoxicillin + Clavulanic Acid |',
      '| Nexpro | Omeprazole |',
      '| Allegra | Fexofenadine |',
      '| Atorva | Atorvastatin |',
      '| Ecosprin | Aspirin |',
      '',
      'Generic medicines are equally effective and more affordable.',
    ].join('\n');
    return { type: 'table', content };
  }

  if (text.includes('dosage') || text.includes('dose') || text.includes('how to use') || text.includes('how much')) {
    const content = [
      '**💊 Medicine Dosage Information**',
      '',
      '| Medicine | Adult Dose | Child Dose |',
      '|----------|-----------|-----------|',
      '| Paracetamol | 500mg 3-4x/day | 15mg/kg 4x/day |',
      '| Amoxicillin | 500mg 3x/day | 20-40mg/kg/day |',
      '| Cetirizine | 10mg 1x/day | 5mg 1x/day |',
      '| Ibuprofen | 400mg 3x/day | 10mg/kg 3x/day |',
      '| Omeprazole | 20mg 1x/day | Not recommended |',
      '',
      '⚠️ Always verify with the prescribing doctor.',
    ].join('\n');
    return { type: 'table', content };
  }

  if (text.includes('bill') || text.includes('invoice') || text.includes('generate')) {
    const content = [
      '**🧾 Invoice Generation**',
      '',
      'To generate a bill:',
      '1. Go to the Billing section',
      '2. Select the patient',
      '3. Add medicine items from the prescription',
      '4. Apply any discounts if applicable',
      '5. Generate and print the invoice',
      '',
      'Need me to look up a specific prescription?',
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('dispense') || text.includes('dispensed') || text.includes('mark')) {
    const content = [
      '**✅ Mark as Dispensed**',
      '',
      'To mark medicines as dispensed:',
      '1. Verify the prescription',
      '2. Check stock availability',
      '3. Dispense the medicines',
      '4. Update inventory',
      '5. Mark as "Dispensed" in system',
      '',
      'Enter the prescription ID to proceed.',
    ].join('\n');
    return { type: 'text', content };
  }

  return {
    type: 'text',
    content: `Hello! I can help you with:\n\n• 🔍 Search prescription by Patient ID\n• ✅ Verify prescription details\n• 📦 Check medicine stock & availability\n• 🔄 Generic medicine suggestions\n• ⚠️ Low stock & expiry alerts\n• 💊 Medicine dosage information\n• 🧾 Generate bills & invoices\n• ✅ Mark medicines as dispensed\n\nWhat would you like to do?`,
  };
}

function handleAdminInput(text, input) {
  if (text.includes('today summary') || (text.includes('today') && (text.includes('summary') || text.includes('overview') || text.includes('report')))) {
    const s = getTodaySummary();
    const content = [
      '**📊 Today\'s Summary**',
      '',
      `**Patients:** ${s.totalPatients}`,
      `**Appointments:** ${s.todayAppointments}`,
      `**Completed:** ${s.completed}`,
      `**Pending:** ${s.pending}`,
      `**Revenue:** ₹${s.revenue.toLocaleString()}`,
    ].join('\n');
    return { type: 'stats', content };
  }

  if (text.includes('analytics') || text.includes('statistics') || text.includes('stats')) {
    const analytics = getAnalytics();
    const content = [
      '**📈 Analytics Dashboard**',
      '',
      `**Total Patients:** ${analytics.totalPatients}`,
      `**Total Doctors:** ${analytics.totalDoctors}`,
      `**Total Appointments:** ${analytics.totalAppointments}`,
      `**This Month Appointments:** ${analytics.monthAppointments}`,
      `**Total Revenue:** ₹${analytics.totalRevenue.toLocaleString()}`,
      '',
      '**Department Statistics:**',
      ...analytics.deptStats.map((d) => `• ${d.name}: ${d.doctorCount} doctors`),
      '',
      `**🏆 Busiest Doctor:** ${analytics.busiestDoctor.name} (${analytics.busiestDoctor.specialization})`,
      `**🏥 Most Visited Dept:** ${analytics.mostVisitedDept.name}`,
    ].join('\n');
    return { type: 'stats', content };
  }

  if (text.includes('insight') || text.includes('trend') || text.includes('growth') || text.includes('peak') || text.includes('busiest')) {
    const analytics = getAnalytics();
    const content = [
      '**🤖 AI Insights**',
      '',
      `**🏥 Most Visited Department:** ${analytics.mostVisitedDept.name}`,
      `**👨‍⚕️ Busiest Doctor:** ${analytics.busiestDoctor.name} (Rating: ⭐${analytics.busiestDoctor.rating})`,
      '',
      '**⏰ Peak Hospital Hours:**',
      '• Monday-Saturday: 9:00 AM - 11:00 AM (Morning peak)',
      '• Monday-Saturday: 4:00 PM - 6:00 PM (Evening peak)',
      '• Sunday: 10:00 AM - 1:00 PM',
      '',
      '**💊 Medicine Usage Statistics:**',
      '• Paracetamol — Most prescribed (34% of prescriptions)',
      '• Amoxicillin — Most dispensed antibiotic',
      '• Vitamin supplements — 22% increase this quarter',
      '',
      '**📈 Appointment Trends:**',
      '• General Medicine: 30% of all appointments',
      '• Cardiology: 18% of all appointments',
      '• Orthopedics: 15% of all appointments',
      '• Average 20% month-over-month growth',
      '',
      '**💰 Revenue Trends:**',
      `• Total: ₹${analytics.totalRevenue.toLocaleString()}`,
      '• Monthly average: ₹47,000',
      '• Growth rate: +12% this quarter',
    ].join('\n');
    return { type: 'insights', content };
  }

  const patient = findPatientByQuery(text);
  if (patient) {
    const patientApps = getAppointmentsForPatient(patient.id);
    const patientPreps = getPrescriptionsForPatient(patient.id);
    const content = [
      `**👤 Patient:** ${patient.name}`,
      `**ID:** ${patient.patientId}`,
      `**Phone:** ${patient.phone}`,
      `**Email:** ${patient.email}`,
      `**Blood Group:** ${patient.bloodGroup}`,
      '',
      '**📅 Appointment History:**',
      ...(patientApps.length > 0
        ? patientApps.map((a) => `• ${a.date} — ${a.department} (${a.status})`)
        : ['• No appointments found.']),
      '',
      '**💊 Prescriptions:**',
      ...(patientPreps.length > 0
        ? patientPreps.flatMap((p) => p.medicines.map((m) => `• ${m.name}`))
        : ['• No prescriptions.']),
    ].join('\n');
    return { type: 'patient_info', content };
  }

  const doctor = doctors.find((d) => text.includes(d.name.toLowerCase().split(' ')[1]?.toLowerCase()) || (text.includes('dr') && (d.name.toLowerCase().includes(text.replace('dr', '').trim()))));
  if (doctor) {
    const docApps = appointments.filter((a) => a.doctorId === doctor.id);
    const content = [
      `**👨‍⚕️ Doctor:** ${doctor.name}`,
      `**Specialization:** ${doctor.specialization}`,
      `**Experience:** Available`,
      `**Consultation Fee:** ₹${doctor.fee}`,
      `**Availability:** ${doctor.availability}`,
      `**Rating:** ⭐ ${doctor.rating}`,
      '',
      `**📅 Total Appointments:** ${docApps.length}`,
      `**Completed:** ${docApps.filter((a) => a.status === 'completed').length}`,
      `**Scheduled:** ${docApps.filter((a) => a.status === 'scheduled').length}`,
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('report') || text.includes('export')) {
    const content = [
      '**📄 Generate Reports**',
      '',
      'Available report types:',
      '• **Patient Report** — Complete patient list with details',
      '• **Appointment Report** — Daily/monthly appointment summary',
      '• **Revenue Report** — Financial summary with trends',
      '• **Medicine Report** — Inventory and usage statistics',
      '• **Doctor Report** — Doctor performance metrics',
      '',
      'Would you like me to generate a specific report?',
    ].join('\n');
    return { type: 'text', content };
  }

  if (text.includes('log') || text.includes('activity') || text.includes('audit')) {
    const content = [
      '**📋 System Activity Log**',
      '',
      'Recent Activities:',
      '• 5 min ago — Priya Sharma booked appointment for Rajesh Gupta',
      '• 30 min ago — Dr. Sneha Reddy completed consultation',
      '• 1 hr ago — Admin added new user (Dr. Meera Joshi)',
      '• 2 hrs ago — City Pharmacy dispensed Prescription #3',
      '• 3 hrs ago — Priya Sharma registered new patient Lakshmi Nair',
    ].join('\n');
    return { type: 'list', content };
  }

  if (text.includes('monthly') || text.includes('month report')) {
    const content = [
      '**📊 Monthly Report — July 2025**',
      '',
      '**Appointments:** 45 total',
      '- Completed: 32',
      '- Pending: 13',
      '',
      '**Revenue:** ₹1,28,500',
      '- Collections: ₹1,15,000',
      '- Pending: ₹13,500',
      '',
      '**New Patients:** 12',
      '**Follow-ups:** 28',
      '',
      '**Top Departments:**',
      '• General Medicine: 15 appointments',
      '• Cardiology: 10 appointments',
      '• Orthopedics: 8 appointments',
    ].join('\n');
    return { type: 'stats', content };
  }

  return {
    type: 'text',
    content: `Hello Admin! I can help you with:\n\n• 📊 Today's summary & analytics\n• 📈 AI-powered insights & trends\n• 👤 Search patients, doctors, appointments\n• 📄 Generate & export reports\n• 📋 System activity logs\n• 📊 Monthly reports & growth stats\n\nWhat would you like to explore?`,
  };
}

export function getQuickActions(role) {
  const qa = {
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
  return qa[role] || qa.patient;
}

export function handleQuickAction(actionId, role) {
  const actionMap = {
    patient: {
      symptoms: { type: 'text', content: 'Tell me your symptoms! For example: "I have fever and headache" or "I have a sore throat".' },
      tips: { type: 'list', content: `**💡 Health Tips**\n\n${['Stay hydrated — drink at least 8 glasses of water daily', 'Get 7-8 hours of sleep every night', 'Exercise for 30 minutes daily', 'Eat a balanced diet rich in fruits and vegetables', 'Practice stress management techniques', 'Regular health check-ups are important', 'Wash hands frequently to prevent infections', 'Limit screen time before bed'].map((t) => `• ${t}`).join('\n')}` },
      faq: { type: 'text', content: `**❓ Frequently Asked Questions**\n\n${['How to book an appointment?', 'How to cancel an appointment?', 'How to view prescriptions?', 'What are clinic timings?', 'How to make payments?', 'What to do in an emergency?', 'How to get lab reports?', 'Do you accept insurance?'].map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nAsk me about any of these!` },
      reminder: { type: 'text', content: `**⏰ Medicine Reminder Tips**\n\n• Set a daily alarm for your medicine times\n• Use a weekly pill organizer\n• Keep medicines in a visible place\n• Log your intake in a journal\n• Refill before you run out\n\nWould you like me to help set up a reminder schedule?` },
      diet: { type: 'list', content: `**🥗 Diet Tips**\n\n${['Eat a balanced diet with plenty of fruits and vegetables', 'Drink at least 8 glasses of water daily', 'Include calcium-rich foods like milk, yogurt, and leafy greens', 'Eat seasonal fruits for natural vitamins and antioxidants', 'Include omega-3 fatty acids (fish, nuts, seeds) for heart health', 'Choose whole grains over refined grains', 'Limit salt intake to maintain healthy blood pressure', 'Reduce sugar and processed food consumption'].map((t) => `• ${t}`).join('\n')}` },
    },
    reception: {
      find_patient: { type: 'text', content: '🔎 Enter patient ID (e.g., PAT-100001), name, or phone number to search.' },
      book_appointment: { type: 'text', content: '📅 To book an appointment, provide the patient ID or name and preferred time.\n\nExample: "Book appointment for Rajesh Gupta tomorrow"' },
      doctor_availability: { type: 'text', content: '👨‍⚕️ **Available Slots Today:**\n\n• 10:00 AM — Dr. Rohan Desai (General Medicine)\n• 11:30 AM — Dr. Arjun Mehta (Cardiology)\n• 3:00 PM — Dr. Priya Sharma (Cardiology)\n\nWant to check a specific doctor?' },
      today_summary: { type: 'text', content: '📋 Type "today summary" to see today\'s appointments, patients, and revenue overview.' },
      billing_help: { type: 'text', content: '💰 **Billing Guidance**\n\n• Generate bills from the Billing section\n• Check payment status for each patient\n• Accept cash, card, or UPI payments\n• Send invoice to patient\'s email\n• For refunds, contact the admin' },
    },
    doctor: {
      patient_history: { type: 'text', content: '🔍 Enter a patient ID or name (e.g., "PAT-100001" or "Rajesh Gupta") to view their complete medical history.' },
      prescriptions: { type: 'text', content: '💊 Enter a patient ID to view their prescription history.\n\nExample: "Show prescriptions of PAT-100003"' },
      medicine_info: { type: 'text', content: '📖 Ask about any medicine (e.g., "Tell me about Paracetamol" or "Amoxicillin details").' },
      treatment_guide: { type: 'text', content: '📋 Type "treatment guidelines" to see standard protocols for common conditions.' },
      followup: { type: 'text', content: '📅 Type "follow-up" for reminder suggestions and scheduling guidance.' },
    },
    medical_store: {
      check_stock: { type: 'text', content: '📦 Enter a medicine name to check stock. Example: "Check stock of Amoxicillin"' },
      verify_prescription: { type: 'text', content: '✅ Enter a prescription or patient ID to verify.\n\nExample: "Verify prescription for PAT-100004"' },
      low_stock: { type: 'text', content: '⚠️ Type "low stock" to see all items that need reordering.' },
      expiry: { type: 'text', content: '📅 Type "expiry alerts" to see medicines expiring in the next 6 months.' },
      generic: { type: 'text', content: '🔄 Type "generic alternatives" to see affordable generic medicine options.' },
    },
    admin: {
      today_summary: { type: 'stats', content: `**📊 Today's Summary**\n\n**Patients:** 6\n**Appointments:** 3\n**Completed:** 1\n**Pending:** 2\n**Revenue:** ₹54,300\n\nType "analytics" for more details.` },
      analytics: { type: 'stats', content: `📈 Type "analytics" or "statistics" for a comprehensive analytics dashboard with department stats and trends.` },
      search: { type: 'text', content: '🔎 Enter a patient name, ID, or phone number to search across the system.' },
      reports: { type: 'text', content: '📄 Type "reports" to see available report types you can generate and export.' },
      insights: { type: 'text', content: '🤖 Type "insights" or "trends" to see AI-powered analytics including peak hours, busiest doctors, and growth statistics.' },
    },
  };

  return actionMap[role]?.[actionId] || { type: 'text', content: 'Action not available.' };
}
