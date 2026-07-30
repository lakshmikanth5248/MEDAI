# 🔐 Demo Login Credentials — MedAI Clinic Management System

All credentials below are for the **seeded demo accounts** created by `backend/seed/seed_data.py`.

---

## 🧑‍💼 User Accounts

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Admin** | `admin@clinic.com` | `admin123` | http://localhost:5173/admin/dashboard |
| **Doctor** | `doctor@clinic.com` | `doctor123` | http://localhost:5173/doctor/dashboard |
| **Receptionist** | `reception@clinic.com` | `reception123` | http://localhost:5173/reception/dashboard |
| **Patient** | `patient@clinic.com` | `patient123` | http://localhost:5173/patient/dashboard |
| **Medical Store** | `store@clinic.com` | `store123` | http://localhost:5173/medical-store/dashboard |

---

## 🌐 Local URLs

| Service | URL |
|---|---|
| **Frontend (React)** | http://localhost:5173 |
| **API Gateway** | http://localhost:5000 |
| **Auth Service** | http://localhost:5001 |
| **Clinical Service** | http://localhost:5002 |
| **Prescription Service** | http://localhost:5003 |
| **Pharmacy Service** | http://localhost:5004 |
| **Billing Service** | http://localhost:5005 |
| **Notification Service** | http://localhost:5006 |
| **Core Service** | http://localhost:5007 |

---

## 🚀 How to Run Locally

### Step 1 — Start the Backend

Open a **PowerShell** terminal and run:

```powershell
cd C:\DEMO\backend
./start-all.ps1
```

This starts all 8 microservices (gateway + 7 domain services) in the background.

To stop:
```powershell
./stop-all.ps1
```

### Step 2 — Start the Frontend

Open a **second terminal** and run:

```powershell
cd C:\DEMO\doctor-clinic-management\frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## ✅ Connectivity Checklist

| Check | Status | Details |
|---|---|---|
| Frontend API URL | ✅ Correct | `VITE_API_BASE_URL=http://localhost:5000/api` in `frontend/.env` |
| Gateway CORS | ✅ Correct | `FRONTEND_ORIGIN=http://localhost:5173` in `backend/.env` |
| Gateway Port | ✅ Correct | `GATEWAY_PORT=5000` in `backend/.env` |
| JWT Secret | ✅ Set | In `backend/.env` |
| Internal Service Secret | ✅ Set | In `backend/.env` |
| Database URL | ✅ Set | Supabase Session Pooler in `backend/.env` |

---

## 👤 Role Capabilities Quick Reference

| Role | Can Do |
|---|---|
| **Admin** | Dashboard KPIs, manage doctors/staff/stores/departments, reports, SMS logs, settings |
| **Doctor** | View appointments, create consultations, write prescriptions, view patients |
| **Receptionist** | Register patients, book appointments, manage billing, view prescriptions |
| **Patient** | Book appointments, view medical history, view own prescriptions |
| **Medical Store** | Dispense prescriptions, manage inventory, **view billing records** |

---

## 🏥 Seeded Demo Data

| Entity | Count |
|---|---|
| Departments | 8 (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, ENT, Ophthalmology, General Medicine) |
| Doctors | 10 |
| Patients | 6 |
| Appointments | 15 |
| User Accounts | 5 (one per role) |
