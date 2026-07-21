// Offline symptom knowledge base for the ChatBot.
// Advice is general home-care guidance only and is not a substitute for
// professional medical diagnosis or treatment.
//
// Each ailment maps to keywords (used for matching user input) and an
// `advice` object keyed by age group: child | adult | old.
// `precautions` is a list of strings, `seeDoctor` a list of red-flag strings.

export const AILMENTS = {
  fever: {
    labelKey: 'chatbot.ailments.fever',
    keywords: ['fever', 'temperature', 'pyrexia', 'बुखार', 'ज्वर', 'జ్వరం', 'ಕ್ಷಣ', 'ಕಾಯ್ಚಲ್', 'காய்ச்சல்', 'பனி'],
    advice: {
      child: {
        precautions: [
          'Keep the child hydrated with ORS, breast milk, or fluids.',
          'Dress in light clothing and keep the room ventilated.',
          'Use a lukewarm sponge bath to bring down high temperature.',
          'Give paracetamol syrup only as per paediatric dose (weight-based) and never aspirin.',
        ],
        seeDoctor: [
          'Fever above 102°F (39°C) lasting more than 2 days.',
          'Any fever in an infant under 3 months.',
          'Rash, stiff neck, persistent vomiting, or unusual drowsiness.',
        ],
      },
      adult: {
        precautions: [
          'Rest and drink plenty of fluids (water, ORS, soups).',
          'Use a light diet; avoid oily and heavy food.',
          'Paracetamol can be taken as per the standard adult dose.',
          'Use a cool compress and keep the room airy.',
        ],
        seeDoctor: [
          'Fever above 103°F (39.4°C) or lasting more than 3 days.',
          'Breathing difficulty, chest pain, or confusion.',
          'Fever with persistent loose motions or vomiting.',
        ],
      },
      old: {
        precautions: [
          'Ensure frequent sips of water, ORS, or tender coconut water.',
          'Monitor temperature regularly; seniors dehydrate quickly.',
          'Keep the room cool and clothing light.',
          'Continue regular medicines unless advised otherwise.',
        ],
        seeDoctor: [
          'Any fever above 100.4°F (38°C) in elders.',
          'Altered mental state, low urine output, or weakness.',
          'Fever with cough, breathlessness, or fall risk.',
        ],
      },
    },
  },
  cold: {
    labelKey: 'chatbot.ailments.cold',
    keywords: ['cold', 'runny nose', 'blocked nose', 'sneezing', 'जुकाम', 'नजला', 'జలుబు', 'ಕ್ಷಯ', 'சளி', 'ஜலதோஷம்'],
    advice: {
      child: {
        precautions: [
          'Saline nasal drops help clear a blocked nose in babies.',
          'Keep the child warm and well hydrated.',
          'Use a humidifier or steam in the room.',
          'Avoid over-the-counter cough syrups for young children.',
        ],
        seeDoctor: [
          'Cold with fast breathing or chest retraction.',
          'Ear pain or discharge from the ear.',
          'Symptoms lasting more than 10 days.',
        ],
      },
      adult: {
        precautions: [
          'Rest and drink warm fluids such as soups and herbal tea.',
          'Steam inhalation helps relieve congestion.',
          'Gargle with warm salt water for throat comfort.',
          'Wash hands often to avoid spreading.',
        ],
        seeDoctor: [
          'Cold with high fever or facial pain.',
          'Breathlessness or wheezing.',
          'Symptoms persisting beyond two weeks.',
        ],
      },
      old: {
        precautions: [
          'Keep warm and maintain good hydration.',
          'Steam inhalation and warm fluids ease congestion.',
          'Watch for reduced appetite and encourage small meals.',
          'Ensure regular medicines are taken on time.',
        ],
        seeDoctor: [
          'Any chest congestion with breathlessness.',
          'Confusion or reduced activity.',
          'Cold triggering existing asthma or COPD.',
        ],
      },
    },
  },
  cough: {
    labelKey: 'chatbot.ailments.cough',
    keywords: ['cough', 'coughing', 'खांसी', 'दग्गु', 'కెమ్ము', 'ಕೆಮ್ಮು', 'இருமல்', 'சுமை', 'விழுங்கு'],
    advice: {
      child: {
        precautions: [
          'Honey (for children above 1 year) soothes night cough.',
          'Keep the child hydrated and use a humidifier.',
          'Avoid cold drinks and exposure to smoke.',
          'Elevate the head while sleeping.',
        ],
        seeDoctor: [
          'Cough with breathing difficulty or bluish lips.',
          'Cough lasting more than a week with fever.',
          'Wheezing or stridor (noisy breathing).',
        ],
      },
      adult: {
        precautions: [
          'Warm water with honey and ginger eases throat irritation.',
          'Steam inhalation for productive cough.',
          'Avoid smoking and cold beverages.',
          'Rest the voice and stay hydrated.',
        ],
        seeDoctor: [
          'Cough with blood or weight loss.',
          'Cough lasting more than 3 weeks.',
          'High fever with chest pain.',
        ],
      },
      old: {
        precautions: [
          'Sip warm fluids; honey (if diabetic-safe) can calm cough.',
          'Use pillows to keep the head elevated.',
          'Avoid cold air and dust exposure.',
          'Stay hydrated to loosen phlegm.',
        ],
        seeDoctor: [
          'Cough with breathlessness or chest tightness.',
          'Cough causing exhaustion or fainting.',
          'Any blood in sputum.',
        ],
      },
    },
  },
  headache: {
    labelKey: 'chatbot.ailments.headache',
    keywords: ['headache', 'head pain', 'migraine', 'सिरदर्द', 'तलेनोवु', 'తలనొప్పి', 'ತಲೆನೋವು', 'தலைவலி', 'தலை நோவு'],
    advice: {
      child: {
        precautions: [
          'Let the child rest in a quiet, dim room.',
          'Offer water; dehydration commonly causes headaches.',
          'A cool cloth on the forehead may help.',
          'Note triggers like skipped meals or screen time.',
        ],
        seeDoctor: [
          'Sudden severe headache.',
          'Headache with vomiting or vision change.',
          'Headache after a head injury.',
        ],
      },
      adult: {
        precautions: [
          'Rest in a dark, quiet room and hydrate.',
          'A cold or warm compress on the head/neck.',
          'Manage stress and screen breaks.',
          'Paracetamol can be taken as per the standard dose.',
        ],
        seeDoctor: [
          'Worst-ever sudden headache ("thunderclap").',
          'Headache with weakness, slurred speech, or vision loss.',
          'Persistent headache with fever and neck stiffness.',
        ],
      },
      old: {
        precautions: [
          'Rest and ensure adequate water intake.',
          'Check blood pressure regularly.',
          'Maintain regular sleep and meals.',
          'A calm, dim environment helps.',
        ],
        seeDoctor: [
          'New or sudden severe headache in elders.',
          'Headache with confusion or weakness.',
          'Headache with fever and neck stiffness.',
        ],
      },
    },
  },
  bodypain: {
    labelKey: 'chatbot.ailments.bodypain',
    keywords: ['body pain', 'body ache', 'muscle pain', 'joint pain', 'शरीर दर्द', 'ದೇಹ ನೋವು', 'శరీర నొప్పి', 'உடல் வலி', 'മ്യുക്യൽ വേദന'],
    advice: {
      child: {
        precautions: [
          'Encourage rest and light fluids.',
          'Gentle massage may ease muscle soreness.',
          'Keep the child comfortably warm.',
          'Monitor for fever accompanying the pain.',
        ],
        seeDoctor: [
          'Severe unexplained body pain with rash.',
          'Inability to walk or move a limb.',
          'Pain with high fever.',
        ],
      },
      adult: {
        precautions: [
          'Rest the affected area and apply a warm compress.',
          'Stay hydrated and eat potassium-rich foods (banana).',
          'Mild stretching after rest helps.',
          'Paracetamol/ibuprofen as per the standard dose if needed.',
        ],
        seeDoctor: [
          'Sudden severe pain with swelling or redness.',
          'Pain after an injury with inability to move.',
          'Body pain with breathlessness or chest discomfort.',
        ],
      },
      old: {
        precautions: [
          'Gentle movement and avoid prolonged bed rest.',
          'Warm compress for joint stiffness.',
          'Ensure adequate calcium and vitamin D in diet.',
          'Use supportive footwear and rails.',
        ],
        seeDoctor: [
          'Joint swelling with redness and heat.',
          'Sudden severe back or leg pain.',
          'Pain with numbness or loss of control.',
        ],
      },
    },
  },
  throatpain: {
    labelKey: 'chatbot.ailments.throatpain',
    keywords: ['throat', 'sore throat', 'throat pain', 'गले में दर्द', 'ಕಂಠ ನೋವು', 'గొంతు నొప్పి', 'தொண்டை வலி', 'தொண்டை நோவு'],
    advice: {
      child: {
        precautions: [
          'Warm salt-water gargle (for older children).',
          'Warm fluids and honey (above 1 year).',
          'Soft, non-spicy foods.',
          'Encourage rest and hydration.',
        ],
        seeDoctor: [
          'Difficulty swallowing or drooling.',
          'Muffled voice with high fever.',
          'Breathing difficulty.',
        ],
      },
      adult: {
        precautions: [
          'Gargle with warm salt water 2-3 times a day.',
          'Warm herbal teas with honey soothe the throat.',
          'Avoid cold, spicy, and oily foods.',
          'Rest the voice and stay hydrated.',
        ],
        seeDoctor: [
          'Throat pain with high fever and white patches.',
          'Difficulty breathing or swallowing.',
          'Pain lasting more than a week.',
        ],
      },
      old: {
        precautions: [
          'Warm salt-water gargle and warm fluids.',
          'Soft, easy-to-swallow foods.',
          'Steam inhalation for comfort.',
          'Keep well hydrated.',
        ],
        seeDoctor: [
          'Trouble swallowing leading to low intake.',
          'High fever with neck swelling.',
          'Breathing difficulty.',
        ],
      },
    },
  },
  vomit: {
    labelKey: 'chatbot.ailments.vomit',
    keywords: ['vomit', 'vomiting', 'throw up', 'उल्टी', 'ವಾಂತಿ', 'వాంతి', 'வாந்தி', 'ഛർദ്ദി'],
    advice: {
      child: {
        precautions: [
          'Give small sips of ORS frequently to prevent dehydration.',
          'Avoid solid food until vomiting settles.',
          'Continue breastfeeding if applicable.',
          'Watch for signs of dehydration (dry lips, no urine).',
        ],
        seeDoctor: [
          'Blood or green (bile) in vomit.',
          'Signs of dehydration or lethargy.',
          'Vomiting with a stiff neck or severe crying.',
        ],
      },
      adult: {
        precautions: [
          'Sip ORS or clear fluids slowly and often.',
          'Rest and avoid heavy meals initially.',
          'Bland foods (rice, toast) when tolerable.',
          'Rehydrate gradually to avoid triggering more vomiting.',
        ],
        seeDoctor: [
          'Vomit with blood or forceful (projectile).',
          'Signs of severe dehydration.',
          'Vomiting with severe abdominal pain.',
        ],
      },
      old: {
        precautions: [
          'Frequent tiny sips of ORS or water.',
          'Avoid large meals; eat light bland food.',
          'Monitor for weakness and dizziness.',
          'Keep the head elevated after eating.',
        ],
        seeDoctor: [
          'Any persistent vomiting in elders.',
          'Signs of dehydration or confusion.',
          'Vomiting with chest or abdominal pain.',
        ],
      },
    },
  },
};

// Role-specific proactive tips (bullets). These are short, helpful reminders.
export const ROLE_TIPS = {
  patient: [
    'Keep a note of your symptoms and duration before the visit.',
    'Stay hydrated and rest for common viral illnesses.',
    'Use the Book Appointment page to see a doctor quickly.',
    'Review your prescriptions and medical history in one place.',
  ],
  doctor: [
    'Confirm patient identity and allergy history before prescribing.',
    'Wash hands and sanitize between consultations.',
    'Document the chief complaint and vitals clearly.',
    'Explain dosage and follow-up clearly to the patient.',
  ],
  reception: [
    'Verify patient contact number for SMS reminders.',
    'Keep the queue and waiting area organised.',
    'Confirm insurance or billing details early.',
    'Use the billing screen to generate invoices promptly.',
  ],
  medical_store: [
    'Cross-check prescription before dispensing medicines.',
    'Check expiry and batch for every item.',
    'Maintain stock alerts for fast-moving medicines.',
    'Update inventory after each dispense.',
  ],
  admin: [
    'Review SMS logs to confirm reminder delivery.',
    'Keep doctor and department lists up to date.',
    'Monitor reports for clinic performance.',
    'Ensure user roles and access are correctly assigned.',
  ],
};

// Map free-text input to an ailment key.
export function matchAilment(input) {
  const text = String(input || '').toLowerCase().trim();
  if (!text) return null;
  for (const [key, ail] of Object.entries(AILMENTS)) {
    const keywords = ail.keywords;
    if (keywords.some((k) => text.includes(k.toLowerCase()))) return key;
  }
  return null;
}

// Recommended department id for each ailment. For children we bias toward
// Pediatrics where a paediatric-safe option exists.
const AILMENT_DEPT = {
  fever: 6, // General Medicine
  cold: 6, // General Medicine
  cough: 6, // General Medicine
  headache: 2, // Neurology
  bodypain: 3, // Orthopedics
  throatpain: 8, // ENT
  vomit: 6, // General Medicine
};

const PEDIATRICS_DEPT = 4;

// Given an ailment key and age group, return a department id and a doctor
// object (from mockData) that best fits. Returns { departmentId, doctor }.
export function recommendDoctor(ailmentKey, ageGroup, doctors, departments) {
  if (!ailmentKey || !doctors || !departments) return null;
  let departmentId = AILMENT_DEPT[ailmentKey] ?? 6;

  // Prefer Pediatrics for children when the ailment is generic/non-specialist.
  if (ageGroup === 'child' && departmentId === 6) {
    departmentId = PEDIATRICS_DEPT;
  }

  const deptDoctors = doctors.filter((d) => d.departmentId === departmentId);
  if (deptDoctors.length === 0) return null;

  // Pick the highest-rated doctor as the best match.
  const doctor = [...deptDoctors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  return { departmentId, doctor };
}

