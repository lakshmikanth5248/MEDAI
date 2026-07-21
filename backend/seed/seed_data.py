"""Loads demo data equivalent to the frontend's src/utils/mockData.js and
src/services/*.js seeds directly into Supabase Postgres, across every
service's schema, so the microservices have something to run against
locally without needing the real frontend flows to have been exercised yet.

Run AFTER backend/sql/schema.sql has been applied and backend/migrate-all.ps1
-Stamp has been run.

Usage:
    cd backend/seed
    pip install -r requirements.txt
    python seed_data.py            # idempotent-ish: skips if departments already exist
    python seed_data.py --reset    # truncates every seeded schema first, then reloads
"""
import argparse
import os
import sys
from pathlib import Path

import bcrypt
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_ROOT / ".env")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("DATABASE_URL is not set - copy backend/.env.example to backend/.env and fill it in first.")


def hash_password(plain):
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ---------------------------------------------------------------------------
# Source data - mirrors frontend/src/utils/mockData.js and
# frontend/src/services/notificationStore.js exactly, field for field.
# ---------------------------------------------------------------------------

DEPARTMENTS = [
    {"name": "Cardiology", "icon": "❤️", "color": "#EF4444", "description": "Heart and cardiovascular system diagnosis and treatment"},
    {"name": "Neurology", "icon": "\U0001F9E0", "color": "#8B5CF6", "description": "Brain, spinal cord and nervous system disorders"},
    {"name": "Orthopedics", "icon": "\U0001F9B4", "color": "#F97316", "description": "Musculoskeletal system and bone health"},
    {"name": "Pediatrics", "icon": "\U0001F476", "color": "#22C55E", "description": "Medical care for infants, children and adolescents"},
    {"name": "Dermatology", "icon": "\U0001F52C", "color": "#EC4899", "description": "Skin, hair and nail conditions"},
    {"name": "General Medicine", "icon": "\U0001FA7A", "color": "#38BDF8", "description": "Primary care and general health consultations"},
    {"name": "Ophthalmology", "icon": "\U0001F441️", "color": "#14B8A6", "description": "Eye care and vision disorders"},
    {"name": "ENT", "icon": "\U0001F442", "color": "#6366F1", "description": "Ear, nose and throat conditions"},
]

RAW_DOCTORS = [
    {"mock_id": 1, "name": "Dr. Arjun Mehta", "dept": 1, "specialization": "Interventional Cardiology", "experience": 15, "fee": 800, "availability": "Mon-Fri 9AM-5PM", "rating": 4.8, "education": "MBBS, MD (Cardiology), DM (Cardiology)"},
    {"mock_id": 2, "name": "Dr. Priya Sharma", "dept": 1, "specialization": "Pediatric Cardiology", "experience": 10, "fee": 700, "availability": "Mon-Sat 10AM-4PM", "rating": 4.6, "education": "MBBS, MD (Pediatrics), DM (Cardiology)"},
    {"mock_id": 3, "name": "Dr. Vikram Patel", "dept": 2, "specialization": "Neurology & Stroke Management", "experience": 18, "fee": 1000, "availability": "Tue-Sat 9AM-6PM", "rating": 4.9, "education": "MBBS, MD (Medicine), DM (Neurology)"},
    {"mock_id": 4, "name": "Dr. Sneha Reddy", "dept": 3, "specialization": "Joint Replacement Surgery", "experience": 12, "fee": 900, "availability": "Mon-Fri 8AM-4PM", "rating": 4.7, "education": "MBBS, MS (Orthopedics), MCh (Ortho)"},
    {"mock_id": 5, "name": "Dr. Amit Kumar", "dept": 4, "specialization": "Neonatology", "experience": 8, "fee": 600, "availability": "Mon-Sat 10AM-7PM", "rating": 4.5, "education": "MBBS, MD (Pediatrics), Fellowship (Neonatology)"},
    {"mock_id": 6, "name": "Dr. Neha Gupta", "dept": 5, "specialization": "Cosmetic Dermatology", "experience": 9, "fee": 750, "availability": "Mon-Fri 10AM-5PM", "rating": 4.4, "education": "MBBS, MD (Dermatology), Fellowship (Cosmetology)"},
    {"mock_id": 7, "name": "Dr. Rohan Desai", "dept": 6, "specialization": "Internal Medicine", "experience": 20, "fee": 500, "availability": "Mon-Sat 8AM-8PM", "rating": 4.3, "education": "MBBS, MD (Internal Medicine)"},
    {"mock_id": 8, "name": "Dr. Kavita Singh", "dept": 7, "specialization": "Cataract & LASIK Surgery", "experience": 14, "fee": 850, "availability": "Mon-Sat 9AM-5PM", "rating": 4.8, "education": "MBBS, MS (Ophthalmology), Fellowship (Cornea)"},
    {"mock_id": 9, "name": "Dr. Sanjay Verma", "dept": 8, "specialization": "ENT & Head Neck Surgery", "experience": 16, "fee": 700, "availability": "Mon-Fri 9AM-6PM", "rating": 4.6, "education": "MBBS, MS (ENT), DNB (ENT)"},
    {"mock_id": 10, "name": "Dr. Meera Joshi", "dept": 3, "specialization": "Sports Medicine", "experience": 7, "fee": 650, "availability": "Mon-Sat 11AM-7PM", "rating": 4.2, "education": "MBBS, DNB (Orthopedics), Fellowship (Sports Medicine)"},
]
CITIES = ["Mumbai", "Pune", "Delhi", "Bangalore", "Kochi", "Chennai", "Hyderabad", "Kolkata", "Ahmedabad", "Jaipur"]

PATIENTS = [
    {"mock_id": 1, "name": "Rajesh Gupta", "email": "rajesh.g@email.com", "phone": "9876543210", "gender": "male", "dob": "1985-06-15", "blood_group": "o_pos", "address": "42, Sunshine Apartments, MG Road, Mumbai", "registered": "2025-01-10"},
    {"mock_id": 2, "name": "Anita Deshmukh", "email": "anita.d@email.com", "phone": "9876543211", "gender": "female", "dob": "1990-11-22", "blood_group": "a_pos", "address": "15, Green Park Colony, Pune", "registered": "2025-02-05"},
    {"mock_id": 3, "name": "Sunil Patil", "email": "sunil.p@email.com", "phone": "9876543212", "gender": "male", "dob": "1978-03-08", "blood_group": "b_pos", "address": "78, Lake View, Andheri East, Mumbai", "registered": "2025-02-18"},
    {"mock_id": 4, "name": "Pooja Jain", "email": "pooja.j@email.com", "phone": "9876543213", "gender": "female", "dob": "1995-09-30", "blood_group": "ab_pos", "address": "3/12, Krishna Nagar, Delhi", "registered": "2025-03-01"},
    {"mock_id": 5, "name": "Mohan Rao", "email": "mohan.r@email.com", "phone": "9876543214", "gender": "male", "dob": "1965-12-12", "blood_group": "o_neg", "address": "56, Gandhi Nagar, Bangalore", "registered": "2025-03-15"},
    {"mock_id": 6, "name": "Lakshmi Nair", "email": "lakshmi.n@email.com", "phone": "9876543215", "gender": "female", "dob": "2000-07-25", "blood_group": "b_neg", "address": "22, Temple Road, Kochi", "registered": "2025-04-01"},
]

APPOINTMENTS = [
    {"patient": 1, "doctor": 1, "dept_name": "Cardiology", "date": "2025-07-14", "time": "09:30", "status": "scheduled", "type": "Consultation", "reason": "Chest pain and shortness of breath"},
    {"patient": 2, "doctor": 7, "dept_name": "General Medicine", "date": "2025-07-14", "time": "10:00", "status": "confirmed", "type": "Follow-up", "reason": "Blood pressure review"},
    {"patient": 3, "doctor": 4, "dept_name": "Orthopedics", "date": "2025-07-13", "time": "11:00", "status": "completed", "type": "Surgery Follow-up", "reason": "Knee replacement post-op check"},
    {"patient": 4, "doctor": 3, "dept_name": "Neurology", "date": "2025-07-13", "time": "14:00", "status": "completed", "type": "Consultation", "reason": "Chronic migraine treatment"},
    {"patient": 5, "doctor": 2, "dept_name": "Cardiology", "date": "2025-07-12", "time": "09:00", "status": "cancelled", "type": "Consultation", "reason": "ECG review"},
    {"patient": 6, "doctor": 5, "dept_name": "Pediatrics", "date": "2025-07-15", "time": "10:30", "status": "scheduled", "type": "Vaccination", "reason": "Routine vaccination for child"},
    {"patient": 1, "doctor": 7, "dept_name": "General Medicine", "date": "2025-07-15", "time": "15:00", "status": "confirmed", "type": "Check-up", "reason": "Annual health checkup"},
    {"patient": 2, "doctor": 8, "dept_name": "Ophthalmology", "date": "2025-07-16", "time": "11:00", "status": "scheduled", "type": "Consultation", "reason": "Vision test and glasses prescription"},
    {"patient": 3, "doctor": 9, "dept_name": "ENT", "date": "2025-07-14", "time": "16:30", "status": "confirmed", "type": "Consultation", "reason": "Ear infection treatment"},
    {"patient": 4, "doctor": 6, "dept_name": "Dermatology", "date": "2025-07-12", "time": "13:00", "status": "completed", "type": "Consultation", "reason": "Skin rash and allergy"},
    {"patient": 5, "doctor": 10, "dept_name": "Orthopedics", "date": "2025-07-17", "time": "09:00", "status": "scheduled", "type": "Physiotherapy", "reason": "Sports injury rehabilitation"},
    {"patient": 6, "doctor": 1, "dept_name": "Cardiology", "date": "2025-07-18", "time": "10:00", "status": "scheduled", "type": "Consultation", "reason": "Heart murmur evaluation"},
    {"patient": 1, "doctor": 3, "dept_name": "Neurology", "date": "2025-07-11", "time": "14:30", "status": "completed", "type": "Consultation", "reason": "Nerve conduction study"},
    {"patient": 3, "doctor": 5, "dept_name": "Pediatrics", "date": "2025-07-19", "time": "11:30", "status": "scheduled", "type": "Check-up", "reason": "Child growth assessment"},
    {"patient": 2, "doctor": 4, "dept_name": "Orthopedics", "date": "2025-07-10", "time": "09:30", "status": "cancelled", "type": None, "reason": "Back pain consultation - patient rescheduled"},
]

RAW_MEDICAL_STORES = [
    {"mock_id": 1, "name": "City Pharmacy", "address": "45, MG Road, Mumbai", "phone": "022-23456789", "email": "citypharma@email.com"},
    {"mock_id": 2, "name": "HealthPlus Medical Store", "address": "12, Lake View Complex, Andheri East, Mumbai", "phone": "022-34567890", "email": "healthplus@email.com"},
    {"mock_id": 3, "name": "MediCare Drugs", "address": "8, Green Park, Pune", "phone": "020-45678901", "email": "medicare@email.com"},
]

MEDICINE_INVENTORY = [
    {"name": "Paracetamol 500mg", "category": "Analgesic", "stock": 500, "price": 2.50, "expiry": "2026-06-30", "manufacturer": "Cipla"},
    {"name": "Amoxicillin 250mg", "category": "Antibiotic", "stock": 200, "price": 5.00, "expiry": "2026-03-15", "manufacturer": "Sun Pharma"},
    {"name": "Omeprazole 20mg", "category": "Antacid", "stock": 300, "price": 4.00, "expiry": "2026-08-20", "manufacturer": "Dr. Reddy's"},
    {"name": "Cetirizine 10mg", "category": "Antihistamine", "stock": 25, "price": 3.00, "expiry": "2025-12-31", "manufacturer": "Alkem"},
    {"name": "Metformin 500mg", "category": "Antidiabetic", "stock": 150, "price": 6.00, "expiry": "2026-05-10", "manufacturer": "Lupin"},
    {"name": "Amlodipine 5mg", "category": "Antihypertensive", "stock": 180, "price": 7.00, "expiry": "2026-07-25", "manufacturer": "Torrent"},
    {"name": "Ibuprofen 400mg", "category": "Anti-inflammatory", "stock": 10, "price": 3.50, "expiry": "2026-01-15", "manufacturer": "Cipla"},
    {"name": "Vitamin B Complex", "category": "Supplement", "stock": 400, "price": 8.00, "expiry": "2026-11-30", "manufacturer": "Abbott"},
    {"name": "Azithromycin 500mg", "category": "Antibiotic", "stock": 90, "price": 12.00, "expiry": "2026-04-20", "manufacturer": "Pfizer"},
    {"name": "Losartan 50mg", "category": "Antihypertensive", "stock": 120, "price": 9.00, "expiry": "2026-09-05", "manufacturer": "Novartis"},
]

# Plain-name items matching prescription medicine names exactly, added to
# stores 1 and 2 so a live POST /prescriptions/<id>/dispense demo call
# actually finds matching stock (the mockData names above bake the dosage
# into the inventory name, e.g. "Paracetamol 500mg", which the prescriptions
# below don't - a pre-existing inconsistency in the mock we're not silently
# replicating into an unusable seed).
EXTRA_DEMO_INVENTORY = {
    1: [  # City Pharmacy
        {"name": "Paracetamol", "category": "Analgesic", "stock": 90, "price": 2.5, "manufacturer": "Cipla"},
        {"name": "Omeprazole", "category": "Antacid", "stock": 93, "price": 4.0, "manufacturer": "Dr. Reddy's"},
        {"name": "Cetirizine", "category": "Antihistamine", "stock": 90, "price": 3.0, "manufacturer": "Alkem"},
        {"name": "Hydrocortisone Cream", "category": "Dermatological", "stock": 49, "price": 45.0, "manufacturer": "GSK"},
    ],
    2: [  # HealthPlus Medical Store
        {"name": "Sumatriptan", "category": "Analgesic", "stock": 90, "price": 18.0, "manufacturer": "Sun Pharma"},
        {"name": "Propranolol", "category": "Antihypertensive", "stock": 70, "price": 5.5, "manufacturer": "Cipla"},
        {"name": "Gabapentin", "category": "Neurological", "stock": 70, "price": 6.5, "manufacturer": "Lupin"},
        {"name": "Vitamin B Complex", "category": "Supplement", "stock": 70, "price": 8.0, "manufacturer": "Abbott"},
    ],
}

PRESCRIPTIONS = [
    {"appointment": 3, "patient": 3, "doctor": 4, "date": "2025-07-13", "status": "dispensed", "store": 1,
     "notes": "Take after meals. Avoid spicy food.",
     "medicines": [
         {"name": "Paracetamol", "dosage": "500mg", "frequency": "Twice daily", "duration": 5, "duration_type": "days", "quantity": 10},
         {"name": "Omeprazole", "dosage": "20mg", "frequency": "Once daily", "duration": 7, "duration_type": "days", "quantity": 7},
     ]},
    {"appointment": 4, "patient": 4, "doctor": 3, "date": "2025-07-13", "status": "dispensed", "store": 2,
     "notes": "For migraine prophylaxis. Take Sumatriptan at onset of migraine.",
     "medicines": [
         {"name": "Sumatriptan", "dosage": "50mg", "frequency": "As needed", "duration": 30, "duration_type": "days", "quantity": 10},
         {"name": "Propranolol", "dosage": "40mg", "frequency": "Once daily", "duration": 30, "duration_type": "days", "quantity": 30},
     ]},
    {"appointment": 10, "patient": 4, "doctor": 6, "date": "2025-07-12", "status": "active", "store": None,
     "notes": "Avoid known allergens. Use moisturizer regularly.",
     "medicines": [
         {"name": "Cetirizine", "dosage": "10mg", "frequency": "Once daily", "duration": 10, "duration_type": "days", "quantity": 10},
         {"name": "Hydrocortisone Cream", "dosage": "1%", "frequency": "Apply twice daily", "duration": 7, "duration_type": "days", "quantity": 1},
     ]},
    {"appointment": 13, "patient": 1, "doctor": 3, "date": "2025-07-11", "status": "active", "store": None,
     "notes": "Neuropathic pain management. Review after 2 weeks.",
     "medicines": [
         {"name": "Gabapentin", "dosage": "300mg", "frequency": "Twice daily", "duration": 15, "duration_type": "days", "quantity": 30},
         {"name": "Vitamin B Complex", "dosage": "One tablet", "frequency": "Once daily", "duration": 30, "duration_type": "days", "quantity": 30},
     ]},
]

BILLS = [
    {"patient": 1, "date": "2025-07-13", "status": "paid", "items": [("Consultation Fee", 800), ("ECG Test", 400)]},
    {"patient": 3, "date": "2025-07-13", "status": "paid", "items": [("Surgery Follow-up", 900), ("X-Ray", 600), ("Medicines", 2000)]},
    {"patient": 4, "date": "2025-07-13", "status": "pending", "items": [("Neurology Consultation", 1000), ("MRI Scan", 500)]},
    {"patient": 2, "date": "2025-07-12", "status": "paid", "items": [("General Checkup", 500)]},
    {"patient": 4, "date": "2025-07-12", "status": "unpaid", "items": [("Dermatology Consultation", 750)]},
    {"patient": 5, "date": "2025-07-11", "status": "paid", "items": [("Cardiology Consultation", 700), ("Stress Test", 1300)]},
    {"patient": 1, "date": "2025-07-11", "status": "paid", "items": [("Nerve Conduction Study", 1000), ("Neurology Consultation", 800)]},
]

# Mirrors frontend/src/services/notificationStore.js SEED (the real runtime
# source, richer than mockData.js's notifications array) - targetDoctorId
# refers to the mock doctor id, resolved below to that doctor's auth user id.
NOTIFICATIONS = [
    {"message": "New appointment booked by Rajesh Gupta", "type": "info", "recipient_role": "doctor", "target_doctor_mock_id": 1, "read": False},
    {"message": "Prescription #3 has been dispensed", "type": "success", "recipient_role": "doctor", "target_doctor_mock_id": 1, "from_role": "medical_store", "read": False},
    {"message": "Appointment #5 was cancelled by patient", "type": "warning", "recipient_role": "doctor", "target_doctor_mock_id": 1, "from_role": "patient", "read": False},
    {"message": "Dr. Arjun Mehta marked as available", "type": "info", "recipient_role": "doctor", "target_doctor_mock_id": 1, "read": True},
    {"message": "New patient registration: Lakshmi Nair", "type": "info", "recipient_role": "reception", "read": True},
    {"message": "Medicine stock low: Paracetamol 500mg", "type": "warning", "recipient_role": "medical_store", "read": True},
    {"message": "Monthly report for June is ready", "type": "success", "recipient_role": "all", "read": True},
]

SMS_LOGS = [
    {"recipient": "Rajesh Gupta", "phone": "9876543210", "patient_mock_id": 1, "type": "Appointment", "status": "sent", "message": "Appointment reminder sent"},
    {"recipient": "Anita Deshmukh", "phone": "9876543211", "patient_mock_id": 2, "type": "Billing", "status": "failed", "message": "Payment failed notification"},
]

CLINICS = [
    {"name": "Central Clinic", "address": "12 MG Road, Mumbai", "phone": "022-12345678", "email": "central@clinic.com", "working_hours": "9AM - 6PM", "status": "active"},
    {"name": "Northside Health", "address": "45 North Ave, Pune", "phone": "020-98765432", "email": "north@clinic.com", "working_hours": "10AM - 5PM", "status": "active"},
]

RECENT_ACTIVITIES = [
    {"actor_name": "Priya Sharma", "action_type": "appointment", "target": "booked appointment for Rajesh Gupta with Dr. Arjun Mehta"},
    {"actor_name": "Dr. Sneha Reddy", "action_type": "appointment", "target": "completed consultation for Sunil Patil (Orthopedics)"},
    {"actor_name": "Admin User", "action_type": "registration", "target": "added new user Dr. Meera Joshi"},
    {"actor_name": "City Pharmacy", "action_type": "prescription", "target": "dispensed Prescription #3"},
    {"actor_name": "Priya Sharma", "action_type": "registration", "target": "registered new patient Lakshmi Nair"},
    {"actor_name": "Dr. Vikram Patel", "action_type": "other", "target": "updated medical records for Pooja Jain"},
]

DEMO_USERS = [
    {"email": "admin@clinic.com", "password": "admin123", "role": "admin", "name": "Admin User"},
    {"email": "doctor@clinic.com", "password": "doctor123", "role": "doctor", "name": "Dr. Arjun Mehta", "doctor_mock_id": 1},
    {"email": "reception@clinic.com", "password": "reception123", "role": "reception", "name": "Priya Sharma"},
    {"email": "patient@clinic.com", "password": "patient123", "role": "patient", "name": "Rajesh Gupta", "patient_mock_id": 1},
    {"email": "store@clinic.com", "password": "store123", "role": "medical_store", "name": "City Pharmacy", "store_mock_id": 1},
]

SCHEMAS_IN_TRUNCATE_ORDER = [
    "core.activity_log", "core.clinic_settings", "core.clinics",
    "notification.notification_reads", "notification.notifications", "notification.sms_logs",
    "billing.bill_items", "billing.bills",
    "prescription.prescription_items", "prescription.prescriptions",
    "pharmacy.medicine_inventory", "pharmacy.medical_stores",
    "clinical.consultations", "clinical.appointments", "clinical.patients", "clinical.doctors", "clinical.departments",
    "clinic_auth.password_reset_tokens", "clinic_auth.staff_profiles", "clinic_auth.users",
]


def reset_database(conn):
    with conn.cursor() as cur:
        for table in SCHEMAS_IN_TRUNCATE_ORDER:
            cur.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE")
    conn.commit()
    print("Reset: all seeded tables truncated.")


def already_seeded(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM clinical.departments")
        return cur.fetchone()[0] > 0


def next_uid(cur, role):
    seq = {
        "doctor": "clinic_auth.doctor_uid_seq", "reception": "clinic_auth.reception_uid_seq",
        "patient": "clinic_auth.patient_uid_seq", "medical_store": "clinic_auth.store_uid_seq",
        "admin": "clinic_auth.admin_uid_seq",
    }[role]
    prefix = {"doctor": "DOC-", "reception": "REC-", "patient": "PAT-", "medical_store": "STORE-", "admin": "USER-"}[role]
    cur.execute(f"SELECT nextval('{seq}')")
    value = cur.fetchone()[0]
    return f"{prefix}{str(value).zfill(4)}"


def seed(conn):
    dept_id_by_mock = {}
    dept_id_by_name = {}
    doctor_id_by_mock = {}
    patient_id_by_mock = {}
    store_id_by_mock = {}
    appointment_id_by_index = {}
    doctor_user_id_by_mock = {}

    with conn.cursor() as cur:
        # --- departments ---
        for i, d in enumerate(DEPARTMENTS, start=1):
            cur.execute(
                "INSERT INTO clinical.departments (name, icon, color, description) VALUES (%s,%s,%s,%s) RETURNING id",
                (d["name"], d["icon"], d["color"], d["description"]),
            )
            new_id = cur.fetchone()[0]
            dept_id_by_mock[i] = new_id
            dept_id_by_name[d["name"]] = new_id

        # --- doctors ---
        for i, d in enumerate(RAW_DOCTORS):
            days, _, hours = d["availability"].partition(" ")
            cur.execute(
                """INSERT INTO clinical.doctors
                   (department_id, name, specialization, qualification, experience_years, fee,
                    availability_days, availability_hours, rating, phone, address, license_no)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (
                    dept_id_by_mock[d["dept"]], d["name"], d["specialization"], d["education"],
                    d["experience"], d["fee"], days, hours, d["rating"],
                    f"98{70000000 + i * 111111}", f"{12 + i}, Wellness Lane, {CITIES[i % 10]}",
                    f"MCI-{100000 + i}",
                ),
            )
            doctor_id_by_mock[d["mock_id"]] = cur.fetchone()[0]

        # --- patients ---
        for p in PATIENTS:
            cur.execute(
                """INSERT INTO clinical.patients (name, email, phone, gender, dob, blood_group, address, registered_date)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (p["name"], p["email"], p["phone"], p["gender"], p["dob"], p["blood_group"], p["address"], p["registered"]),
            )
            patient_id_by_mock[p["mock_id"]] = cur.fetchone()[0]

        # --- medical stores ---
        for s in RAW_MEDICAL_STORES:
            cur.execute(
                "INSERT INTO pharmacy.medical_stores (name, address, phone, email) VALUES (%s,%s,%s,%s) RETURNING id",
                (s["name"], s["address"], s["phone"], s["email"]),
            )
            store_id_by_mock[s["mock_id"]] = cur.fetchone()[0]

        # --- 5 demo auth accounts, linked to their domain profile via user_id ---
        for u in DEMO_USERS:
            uid = next_uid(cur, u["role"])
            cur.execute(
                "INSERT INTO clinic_auth.users (email, password_hash, role, uid, name) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (u["email"], hash_password(u["password"]), u["role"], uid, u["name"]),
            )
            user_id = cur.fetchone()[0]

            if "doctor_mock_id" in u:
                real_doctor_id = doctor_id_by_mock[u["doctor_mock_id"]]
                cur.execute("UPDATE clinical.doctors SET user_id = %s WHERE id = %s", (user_id, real_doctor_id))
                doctor_user_id_by_mock[u["doctor_mock_id"]] = user_id
            elif "patient_mock_id" in u:
                cur.execute(
                    "UPDATE clinical.patients SET user_id = %s WHERE id = %s",
                    (user_id, patient_id_by_mock[u["patient_mock_id"]]),
                )
            elif "store_mock_id" in u:
                cur.execute(
                    "UPDATE pharmacy.medical_stores SET user_id = %s WHERE id = %s",
                    (user_id, store_id_by_mock[u["store_mock_id"]]),
                )
            elif u["role"] in ("reception", "admin"):
                cur.execute(
                    "INSERT INTO clinic_auth.staff_profiles (user_id, role, phone) VALUES (%s,%s,%s)",
                    (user_id, u["role"], "9800000000"),
                )

        # --- medicine inventory (mockData items duplicated per store + exact-name demo items) ---
        for mock_store_id, real_store_id in store_id_by_mock.items():
            for item in MEDICINE_INVENTORY:
                cur.execute(
                    """INSERT INTO pharmacy.medicine_inventory (store_id, name, category, stock, price, expiry_date, manufacturer)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (real_store_id, item["name"], item["category"], item["stock"], item["price"], item["expiry"], item["manufacturer"]),
                )
            for item in EXTRA_DEMO_INVENTORY.get(mock_store_id, []):
                cur.execute(
                    """INSERT INTO pharmacy.medicine_inventory (store_id, name, category, stock, price, manufacturer)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (real_store_id, item["name"], item["category"], item["stock"], item["price"], item["manufacturer"]),
                )

        # --- appointments ---
        for idx, a in enumerate(APPOINTMENTS):
            cur.execute(
                """INSERT INTO clinical.appointments
                   (patient_id, doctor_id, department_id, appt_date, appt_time, status, type, reason)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (
                    patient_id_by_mock[a["patient"]], doctor_id_by_mock[a["doctor"]],
                    dept_id_by_name[a["dept_name"]], a["date"], a["time"], a["status"], a["type"], a["reason"],
                ),
            )
            appointment_id_by_index[idx] = cur.fetchone()[0]

        # --- one seed consultation, matching mockData.js consultations[0] (appointment index 2 = mock id 3) ---
        cur.execute(
            """INSERT INTO clinical.consultations (appointment_id, doctor_id, patient_id, consult_date, notes)
               VALUES (%s,%s,%s,%s,%s)""",
            (appointment_id_by_index[2], doctor_id_by_mock[4], patient_id_by_mock[3], "2025-07-13", "Post-op check"),
        )

        # --- prescriptions + items ---
        for rx in PRESCRIPTIONS:
            store_real_id = store_id_by_mock[rx["store"]] if rx["store"] else None
            total_cost = None
            dispensed_at = None
            if rx["status"] == "dispensed":
                dispensed_at = rx["date"]
                price_lookup = {i["name"]: i["price"] for i in EXTRA_DEMO_INVENTORY.get(rx["store"], [])}
                total_cost = round(sum(price_lookup.get(m["name"], 0) * m["quantity"] for m in rx["medicines"]), 2)

            cur.execute(
                """INSERT INTO prescription.prescriptions
                   (appointment_id, patient_id, doctor_id, store_id, rx_date, notes, status,
                    total_cost, dispensed_by, dispensed_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (
                    appointment_id_by_index[rx["appointment"] - 1], patient_id_by_mock[rx["patient"]],
                    doctor_id_by_mock[rx["doctor"]], store_real_id, rx["date"], rx["notes"], rx["status"],
                    total_cost, store_real_id, dispensed_at,
                ),
            )
            rx_id = cur.fetchone()[0]
            for m in rx["medicines"]:
                cur.execute(
                    """INSERT INTO prescription.prescription_items
                       (prescription_id, name, dosage, frequency, duration, duration_type, quantity)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (rx_id, m["name"], m["dosage"], m["frequency"], m["duration"], m["duration_type"], m["quantity"]),
                )

        # --- bills + items ---
        for b in BILLS:
            subtotal = sum(amount for _, amount in b["items"])
            cur.execute(
                """INSERT INTO billing.bills
                   (patient_id, bill_date, status, discount, discount_type, tax_percent, subtotal, discount_amt, tax_amt, grand_total)
                   VALUES (%s,%s,%s,0,'fixed',0,%s,0,0,%s) RETURNING id""",
                (patient_id_by_mock[b["patient"]], b["date"], b["status"], subtotal, subtotal),
            )
            bill_id = cur.fetchone()[0]
            for description, amount in b["items"]:
                cur.execute(
                    "INSERT INTO billing.bill_items (bill_id, description, quantity, rate, amount) VALUES (%s,%s,1,%s,%s)",
                    (bill_id, description, amount, amount),
                )

        # --- notifications ---
        for n in NOTIFICATIONS:
            target_user_id = None
            if "target_doctor_mock_id" in n:
                target_user_id = doctor_user_id_by_mock.get(n["target_doctor_mock_id"])
            cur.execute(
                "INSERT INTO notification.notifications (message, type, recipient_role, target_user_id, from_role) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (n["message"], n["type"], n["recipient_role"], target_user_id, n.get("from_role")),
            )
            notif_id = cur.fetchone()[0]
            if n["read"] and target_user_id:
                cur.execute(
                    "INSERT INTO notification.notification_reads (notification_id, user_id) VALUES (%s,%s)",
                    (notif_id, target_user_id),
                )

        # --- sms logs ---
        for s in SMS_LOGS:
            cur.execute(
                """INSERT INTO notification.sms_logs (recipient, phone, patient_id, type, status, message)
                   VALUES (%s,%s,%s,%s,%s,%s)""",
                (s["recipient"], s["phone"], patient_id_by_mock[s["patient_mock_id"]], s["type"], s["status"], s["message"]),
            )

        # --- clinics ---
        for c in CLINICS:
            cur.execute(
                "INSERT INTO core.clinics (name, address, phone, email, working_hours, status) VALUES (%s,%s,%s,%s,%s,%s)",
                (c["name"], c["address"], c["phone"], c["email"], c["working_hours"], c["status"]),
            )

        # --- activity log ---
        for a in RECENT_ACTIVITIES:
            cur.execute(
                "INSERT INTO core.activity_log (actor_name, action_type, target_description) VALUES (%s,%s,%s)",
                (a["actor_name"], a["action_type"], a["target"]),
            )

    conn.commit()
    print("Seed complete:")
    print(f"  {len(DEPARTMENTS)} departments, {len(RAW_DOCTORS)} doctors, {len(PATIENTS)} patients")
    print(f"  {len(APPOINTMENTS)} appointments, 1 consultation, {len(PRESCRIPTIONS)} prescriptions")
    print(f"  {len(RAW_MEDICAL_STORES)} medical stores, inventory seeded per store")
    print(f"  {len(BILLS)} bills, {len(NOTIFICATIONS)} notifications, {len(SMS_LOGS)} sms logs")
    print(f"  {len(CLINICS)} clinics, {len(RECENT_ACTIVITIES)} activity log entries")
    print(f"  {len(DEMO_USERS)} demo login accounts (admin/doctor/reception/patient/store @clinic.com, same passwords as before)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Truncate all seeded tables before reloading")
    args = parser.parse_args()

    conn = psycopg2.connect(DATABASE_URL)
    try:
        if args.reset:
            reset_database(conn)
        elif already_seeded(conn):
            print("clinical.departments already has rows - looks already seeded. Use --reset to reload.")
            return
        seed(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
