# PPT Generation Prompt — Doctor Clinic Management System

You are a presentation designer. Using the project specification below, generate a professional, well-structured slide deck (PowerPoint / PPTX) for the **Doctor Clinic Management System**. The audience is a technical review panel / stakeholders. Use a clean medical theme (blues/teals, white background). Target 14–18 slides. Each slide should have a clear title, concise bullets (not paragraphs), and where useful a diagram described in text.

---

## PROJECT OVERVIEW
- **Name:** Doctor Clinic Management System
- **Type:** Full-stack web application — a multi-role clinic/hospital management platform
- **Purpose:** Digitize and streamline clinic operations: appointments, consultations, prescriptions, pharmacy/inventory, billing, and notifications across distinct user roles.
- **Architecture:** Decoupled frontend (React SPA) + backend Python/Flask microservices, communicating over a JWT-authenticated API gateway. Single PostgreSQL database (Supabase) with schema-per-service.
- **Deployment model:** No Docker — each backend service runs as a plain Python process on its own port; services started/stopped via PowerShell scripts.

---

## FRONTEND
- **Stack:** React 19 + Vite 8, react-router-dom v7, Axios for HTTP, Oxlint for linting.
- **Structure:** `src/` with pages, components, routes, hooks, context, services, i18n (multi-language support), utils, styles.
- **Key UI features:**
  - Role-based dashboards and protected routing (redirects users to their role's section).
  - Reusable component library: DashboardLayout, Navbar, Sidebar, Cards, Tables, Forms, Modal, Buttons, Alerts, Loader, ChatBot, LanguageSwitcher, StaffManager.
  - Internationalization (i18n) with separate translation keys for Patient and Medical Store roles.
- **Public pages:** Home, Login, Register, Forgot/Reset Password.
- **Five role portals:**
  1. **Admin** — dashboard, users, doctors, medical stores, reception staff, departments, reports, SMS logs, clinics, settings.
  2. **Reception** — dashboard, register patient, patient list, appointments, billing, prescriptions.
  3. **Doctor** — dashboard, today's appointments, patients, patient details, consultations, consultation view, prescription, profile.
  4. **Patient** — dashboard, departments, doctors, book appointment, my appointments, prescriptions, medical history, profile.
  5. **Medical Store** — dashboard, pending prescriptions, dispensed medicines, inventory.

---

## BACKEND
- **Stack:** Python / Flask microservices, SQLAlchemy + Alembic (per service), PostgreSQL on Supabase (schema-per-service).
- **API Gateway (port 5000):** Routes `/api/<service>/*`, verifies JWTs, handles CORS.
- **Microservices:**

| Service | Port | Schema | Responsibility |
|---|---|---|---|
| auth-service | 5001 | clinic_auth | Login, registration, staff creation, password reset |
| clinical-service | 5002 | clinical | Departments, doctors, patients, appointments, consultations |
| prescription-service | 5003 | prescription | Prescriptions, dispense orchestration |
| pharmacy-service | 5004 | pharmacy | Medical stores, inventory |
| billing-service | 5005 | billing | Bills |
| notification-service | 5006 | notification | Notifications, SMS logs |
| core-service | 5007 | core | Clinics, settings, activity log, dashboard/report aggregation |

- **Shared module:** `shared/` provides common utilities (DB connection, JWT utils, internal service auth, error handling, ID generation) installed into each service venv.
- **Auth design:** JWT-based; internal service-to-service calls secured with `INTERNAL_SERVICE_SECRET`. Note: Postgres schema is `clinic_auth` (Supabase reserves `auth`).
- **Migrations:** Alembic baseline stamped from `sql/schema.sql`; future changes via per-service revisions applied in dependency order: `auth → clinical → pharmacy → prescription → billing → notification → core`.
- **Management scripts:** `start-all.ps1`, `stop-all.ps1`, `migrate-all.ps1`, `seed/seed_data.py`.

---

## DATA & SEEDING
- Single Supabase PostgreSQL DB, schema-per-service.
- Supabase pooler connection string (Session/Transaction pooler) required; password special-char URL-encoding handled.
- **Seed demo data:** 8 departments, 10 doctors, 6 patients, 15 appointments, plus prescriptions, inventory, bills, notifications.
- **5 demo login accounts:** Admin, Doctor, Reception, Patient, Medical Store.

---

## KEY WORKFLOWS
1. **Patient books appointment** → Reception/Doctor views → Doctor performs consultation → Doctor writes prescription.
2. **Prescription dispense flow** → prescription-service orchestrates dispense via sequential REST calls to pharmacy-service (best-effort, not distributed-transaction safe).
3. **Billing** → Reception generates bills via billing-service.
4. **Notifications/SMS** → notification-service logs SMS (delivery not yet implemented).
5. **Admin oversight** → reports, activity log, SMS logs, user/staff management.

---

## KNOWN LIMITATIONS / FUTURE WORK
- No real SMS/email delivery (logs only).
- No file uploads.
- No Docker / CI-CD.
- No automated tests.
- Dispense flow lacks distributed-transaction safety (best-effort sequential calls).
- No rate limiting / observability.
- No multi-clinic scoping.
- Frontend currently uses `localStorage` mocks, not yet wired to the live backend.

---

## SUGGESTED SLIDE OUTLINE
1. Title slide
2. Project overview & goals
3. System architecture (diagram: React SPA → API Gateway → microservices → Supabase)
4. Tech stack (frontend + backend)
5. Frontend structure & features
6. Role-based access & routing
7. The 5 user roles (summary)
8. Admin portal
9. Reception portal
10. Doctor portal
11. Patient portal
12. Medical Store portal
13. Backend microservices overview (table)
14. API Gateway & authentication (JWT + internal secret)
15. Database & schema-per-service design
16. Key business workflows
17. Demo data & accounts
18. Limitations & roadmap

Keep text concise and presentation-ready. Use the medical color theme throughout.