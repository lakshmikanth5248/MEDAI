# 📄 Research Paper / Technical Document Generation Prompt

Use the prompt below (copy it as-is) to generate a full research paper or formal technical document for this project using any AI writing tool (ChatGPT, Gemini, Claude, etc.).

---

## ✅ PROMPT (Copy & Paste)

---

Write a comprehensive, well-structured research paper (approximately 6,000–8,000 words) in IEEE / ACM conference paper format for the following software engineering project. The paper should be suitable for submission to a Computer Science / Health Informatics academic venue. Follow all sections strictly.

---

### 🎯 PROJECT OVERVIEW (Context for the Paper)

**Title:** MedAI – A Role-Based Microservices-Driven Doctor Clinic Management System with Integrated AI Chatbot and Multilingual Support

**Domain:** Healthcare Information Systems / Clinical Informatics / Software Engineering

**Project Summary:**

The project is a full-stack, production-grade Doctor and Clinic Management System built as a microservices-based web application. It digitizes the end-to-end workflow of a multi-department clinic — from patient registration and appointment scheduling to prescription management, pharmacy dispensing, billing, and notifications.

---

### 🏗️ TECHNOLOGY STACK (Include in the paper)

**Frontend:**
- React 19 + Vite 8 (SPA, JSX components)
- Vanilla CSS with custom design system
- React Router DOM v7 (role-based protected routing)
- Axios for REST API calls
- Built-in AI Chatbot (rule-based NLP engine in JavaScript, approximately 1,033 lines)
- Multilingual support: English, Hindi, Tamil, Telugu, Kannada, Malayalam — 6 languages via custom i18n React context

**Backend (Python/Flask Microservices — No Docker):**
- Gateway (Port 5000): JWT verification, CORS, reverse-proxy routing to all downstream services
- Auth Service (Port 5001): User registration, login, role management, password reset with token, staff creation, clinic_auth PostgreSQL schema
- Clinical Service (Port 5002): Departments, Doctors, Patients, Appointments, Consultations — clinical schema
- Prescription Service (Port 5003): Digital prescriptions, dispense orchestration — prescription schema
- Pharmacy Service (Port 5004): Medical stores, medicine inventory management, dispensing — pharmacy schema
- Billing Service (Port 5005): Bill generation, payment status tracking — billing schema
- Notification Service (Port 5006): SMS/notification logs — notification schema
- Core Service (Port 5007): Clinic settings, activity logs, dashboard aggregation, reports — core schema

**Database:**
- PostgreSQL hosted on Supabase (cloud-managed)
- Schema-per-service isolation (8 schemas: clinic_auth, clinical, prescription, pharmacy, billing, notification, core)
- Alembic for per-service database migrations
- SQLAlchemy ORM with JSONB, ARRAY, CITEXT, and custom ENUM types

**Authentication and Security:**
- JWT-based stateless authentication
- Role-based access control (RBAC): Admin, Doctor, Receptionist, Patient, Medical Store
- Password hashing using bcrypt
- Internal service-to-service secret key
- Password reset token with expiry

---

### 👤 USER ROLES AND MODULES (Include feature tables)

Role: Admin
Key Features: Dashboard with KPIs, charts, activity feed; manage departments, doctors, receptionists, medical stores, users, clinics, settings, SMS logs, reports; direct staff registration modal

Role: Doctor
Key Features: Today's appointments, patient list and detailed profiles, consultations (vitals, symptoms, diagnosis, tests, notes), digital prescription writing, profile management

Role: Receptionist
Key Features: Patient registration, appointment booking, patient list, billing management, prescription view

Role: Patient
Key Features: Book appointments, view medical history, prescriptions, doctors and departments, profile

Role: Medical Store
Key Features: Pending prescription queue, medicine inventory (CRUD), dispensed medicines tracking, dashboard with inventory KPIs

---

### 🗄️ DATABASE ENTITIES (Include ER Diagram description)

Key entities and relationships:

- User: id, email, password_hash, role, uid, name, status, must_change_password — linked to StaffProfile, PasswordResetToken
- Department: id, name, icon, color, description, status
- Doctor: id, doctor_code, user_id (FK), department_id (FK), specialization, qualification, experience_years, fee, availability_days, availability_hours, rating, license_no, gender, dob
- Receptionist: id, reception_code, user_id (FK), department_id (FK), shift, desk_no, joining_date
- Patient: id, patient_code, user_id (FK), name, email, phone, gender, dob, blood_group, address, insurance (JSONB)
- Appointment: id, appointment_code, patient_id (FK), doctor_id (FK), department_id (FK), appt_date, appt_time, status (ENUM: scheduled/confirmed/arrived/completed/cancelled/rescheduled), type, reason, previous_date/time for rescheduling
- Consultation: id, appointment_id (FK), doctor_id (FK), patient_id (FK), prescription_id, vitals (JSONB), symptoms, diagnosis, tests (ARRAY), notes
- MedicalStore: id, store_code, user_id (FK), name, license_no, gst_no, floor_no
- MedicineInventory: id, store_id (FK), name, category, stock (non-negative constraint), price, expiry_date, manufacturer
- Bill: linked to patient and appointment, with status (pending/paid/cancelled)
- Notification: SMS logs and notification history

---

### 🤖 AI CHATBOT (Key innovation — dedicate a dedicated section)

The system includes a built-in clinical AI assistant chatbot implemented purely in JavaScript (~1,033 lines) with:

- Symptom-to-Department mapping: detects user-reported symptoms (e.g., fever, chest pain, headache) and recommends appropriate medical departments and specific doctors
- Patient lookup: search by patient ID, name, phone, or email to retrieve appointment and prescription history
- Medicine information: query drug details, low-stock alerts, expiring medicines
- Appointment guidance: helps users navigate booking and scheduling
- Multi-intent NLP: keyword and pattern matching across 50+ medical symptom categories
- Role-aware responses: adapts to the logged-in user's role context

---

### 🌐 MULTILINGUAL SUPPORT (Key innovation)

- 6 regional Indian languages: English, Hindi, Tamil, Telugu, Kannada, Malayalam
- Custom React Context-based i18n engine (no external library dependency)
- Complete UI translation with 500+ string keys per language covering all modules for all roles
- Runtime language switching without page reload
- Language files range from 40KB to 78KB per locale, indicating depth of coverage

---

### 🔌 API ARCHITECTURE (Include API design section)

RESTful API design with gateway proxy pattern:
- All frontend requests go to http://localhost:5000/api/<service>/*
- Gateway validates JWT, then proxies to internal service ports
- CORS restricted to known frontend origin
- Internal service calls use a shared secret (no JWT overhead between services)
- Standardized JSON responses, error handling via shared Flask error handler utility

Sample API endpoints:
- POST /api/auth/login — login with identifier, password, role
- GET /api/clinical/doctors — list all doctors (with query params)
- POST /api/clinical/appointments — create appointment
- PATCH /api/clinical/appointments/:id/status — update status
- POST /api/clinical/consultations — record consultation with vitals (JSONB)
- POST /api/prescription/prescriptions — create prescription
- GET /api/pharmacy/inventory — view medicine inventory
- POST /api/billing/bills — generate bill
- GET /api/core/dashboard/summary — aggregated clinic KPIs
- GET /api/core/activity-log — recent activity feed

---

### 📐 SYSTEM ARCHITECTURE (Describe for paper figure)

The system follows a layered microservices architecture:

React SPA Frontend (Vite) communicates exclusively through HTTP REST using Axios.
All requests hit the API Gateway on port 5000, which performs JWT verification and CORS enforcement before reverse-proxying to downstream services.
Eight independent Flask microservices run on dedicated ports (5001–5007), each owning its own PostgreSQL schema within a single shared Supabase database instance.
This design provides schema-level data isolation while avoiding the operational complexity of a separate database per service.

---

### 📋 RESEARCH PAPER STRUCTURE TO FOLLOW

Generate the paper with these exact sections:

**Section 1 — Abstract (250 words)**
- Problem statement: fragmentation and inefficiency in clinic operations
- Proposed solution: microservices-based management system
- Key contributions: RBAC, AI chatbot, multilingual support, schema isolation
- Results and benefits summary

**Section 2 — Introduction (600–800 words)**
- Healthcare digitization challenges in developing countries, with India as the context
- Limitations of monolithic clinic management systems
- Need for role-based, distributed, multilingual solutions
- Paper contributions and organization

**Section 3 — Related Work (500–700 words)**
- Compare with existing Hospital Management Systems: OpenEMR, Bahmni, CareSoft
- Microservices in healthcare (cite relevant papers)
- Chatbot use in healthcare domains
- Multilingual Health Information Systems in India

**Section 4 — System Requirements and Design (800–1,000 words)**
- Functional requirements per role, presented as a table
- Non-functional requirements: security, scalability, multilingual support, availability
- Use-case diagram description
- Actor roles and system boundary

**Section 5 — System Architecture (800–1,000 words)**
- Microservices decomposition rationale (schema-per-service)
- Gateway pattern and JWT security flow
- Frontend architecture: SPA, context, role routing
- Database design: schema isolation vs. shared DB trade-off analysis
- Inter-service communication: REST vs. message queue — rationale for current choice

**Section 6 — Implementation (1,000–1,200 words)**
- Backend: Flask, SQLAlchemy, Alembic migrations
- Frontend: React 19, custom design system, Vite
- RBAC: route guards, RoleRoute component
- AI Chatbot: NLP design, symptom-mapping algorithm, intent resolution
- Multilingual i18n engine: language context, runtime switching
- Pharmacy dispense orchestration: best-effort sequential REST flow
- Seeding strategy: 8 departments, 10 doctors, 6 patients, 15 appointments demo data

**Section 7 — Key Features and Modules (800–1,000 words)**
- Admin dashboard: KPIs, charts, activity feed, staff registration
- Doctor workflow: appointment → consultation → prescription pipeline
- Receptionist workflow: patient registration → appointment → billing
- Patient self-service: book, view history, prescriptions
- Medical Store: pending prescriptions → inventory deduction → dispense
- System health monitoring

**Section 8 — Security Design (400–500 words)**
- JWT authentication lifecycle
- RBAC enforcement at gateway and service levels
- Password hashing and reset token flow
- Internal service secret
- Supabase schema privilege isolation (note: clinic_auth instead of auth due to Supabase reserved schema)
- Known limitations: no rate limiting, no distributed transaction safety

**Section 9 — Challenges and Limitations (400–500 words)**
- Distributed transaction challenge in dispense flow (best-effort vs. 2PC/Saga pattern)
- Supabase IPv6 gotcha and connection pooler requirement
- SMS/email not yet wired (notification service logs only)
- No Docker or CI/CD pipeline
- No automated test suite
- Frontend still using localStorage mocks in some modules, not yet fully wired to backend
- Multi-clinic scoping not implemented

**Section 10 — Results and Discussion (400–500 words)**
- Module coverage: 5 roles, 30+ pages/screens, 40+ REST endpoints
- Language coverage: 6 languages, 500+ i18n keys
- Database: 15+ tables across 8 schemas
- Chatbot: 50+ symptom categories, multi-intent recognition
- Performance considerations: pooler vs. direct DB connection
- Scalability path: each microservice can be independently scaled and deployed

**Section 11 — Future Work (300–400 words)**
- Docker containerization and Kubernetes orchestration
- Replace best-effort dispense with Saga pattern for distributed transaction safety
- Real SMS/email integration (Twilio / SendGrid)
- Automated testing: pytest for backend, Vitest/Playwright for frontend
- Telemedicine module for video consultation
- AI upgrade: move chatbot to LLM-based (GPT/Gemini API) for natural language responses
- Mobile app using React Native
- Analytics dashboard with ML-based appointment demand forecasting
- Multi-clinic SaaS model

**Section 12 — Conclusion (250–300 words)**
- Summary of contributions
- Impact on clinic digitization
- Reusability of the microservices + RBAC + i18n pattern for healthcare

**Section 13 — References (IEEE format, 15–20 citations)**
- Include references for: microservices patterns, Flask, React, JWT, PostgreSQL, RBAC, healthcare chatbots, multilingual HIS, Supabase, Alembic

---

### 📌 STYLE GUIDELINES

- Write in formal academic English, third person
- Use present tense for system descriptions ("the system provides…", "the gateway validates…")
- Include code snippets (max 5–8 lines each) for: JWT middleware in gateway, SQLAlchemy model example (Appointment or Doctor), React RoleRoute component pattern, chatbot symptom matching logic
- Include tables for: role-feature mapping, service-port-schema mapping, API endpoints summary
- Include figures for: system architecture diagram, ER diagram description, data flow diagram
- Do not use marketing language — be precise and technical
- Cite limitations honestly — this strengthens academic credibility
- Target journal/conference: IEEE COMPSAC, ACM SAC Health Informatics Track, or IJHISI (International Journal of Healthcare Information Systems and Informatics)

---

### 📊 ADDITIONAL DATA TO WEAVE IN

- Lines of Code: approximately 150,000+ bytes of JavaScript/JSX frontend; 50,000+ bytes of Python backend
- Demo accounts: 5 roles with seeded credentials (admin@clinic.com, doctor@clinic.com, reception@clinic.com, patient@clinic.com, store@clinic.com)
- Seed data: 8 departments, 10 doctors, 6 patients, 15 appointments, prescriptions, inventory records, bills, notifications
- Deployment: No-Docker approach — 8 plain Python processes managed by PowerShell startup scripts (start-all.ps1, stop-all.ps1)
- Indian healthcare context: multilingual support targets India's linguistic diversity covering the Hindi belt and four major South Indian languages

---

### 🗂️ DATASETS, TOOLS, AND CONFIGURATION (Include as a dedicated subsection in Implementation or Appendix)

**Datasets Used:**

The system does not rely on any external public dataset. All data is synthetically generated through a deterministic seed script (`backend/seed/seed_data.py`) designed to replicate realistic clinic operations. The seed dataset comprises:

| Entity | Count | Details |
|---|---|---|
| Departments | 8 | Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, ENT, Ophthalmology, General Medicine |
| Doctors | 10 | Distributed across departments; each with specialization, qualification, fee, availability schedule, license number |
| Patients | 6 | Full profiles including blood group (A+/B+/O+ etc.), insurance JSONB, date of birth, gender |
| Appointments | 15 | Varying statuses: scheduled, confirmed, completed, cancelled — spread across dates |
| Prescriptions | Multiple | Linked to consultations, containing medicine name, dosage, frequency, duration |
| Medicine Inventory | Multiple | Per medical store: name, category, stock quantity, price, expiry date, manufacturer |
| Bills | Multiple | Linked to appointments with paid/pending status and itemized amounts |
| Notifications | Multiple | SMS log entries linked to appointment events |
| User Accounts | 5 | One per role (Admin, Doctor, Receptionist, Patient, Medical Store) with hashed passwords |

**Chatbot Knowledge Base (Internal Dataset):**
- 50+ symptom-to-department mappings (e.g., "chest pain" → Cardiology, "skin rash" → Dermatology)
- All doctor and patient records mirrored in-memory for fast lookups
- Medicine inventory snapshot for stock and expiry queries
- Billing records for revenue/pending queries

---

**Tools and Technologies:**

| Category | Tool / Library | Version | Purpose |
|---|---|---|---|
| Frontend Framework | React | 19.x | Component-based UI |
| Build Tool | Vite | 8.x | Dev server, bundling |
| Routing | React Router DOM | 7.x | SPA routing + role guards |
| HTTP Client | Axios | 1.18.x | REST API communication |
| Linter | OxLint | 1.71.x | Fast JavaScript linting |
| Backend Framework | Flask | Latest stable | Microservice HTTP server |
| ORM | SQLAlchemy | Latest stable | Database modeling |
| DB Migrations | Alembic | Latest stable | Schema versioning per service |
| Database | PostgreSQL (Supabase) | 15.x | Cloud-managed relational DB |
| Auth | PyJWT | Latest stable | JWT encoding/decoding |
| Password Hashing | bcrypt (via passlib) | Latest stable | Secure password storage |
| CORS | Flask-CORS | Latest stable | Cross-origin request handling |
| Environment Config | python-dotenv | Latest stable | .env file loading |
| Package Manager | pip (per-service venv) | — | Python dependency isolation |
| Frontend Deps | npm | — | Node package management |
| i18n | Custom React Context | — | No external i18n library |
| Version Control | Git | — | Source code management |
| IDE / Editor | VS Code | — | Development environment |
| OS / Shell | Windows + PowerShell | — | Process management scripts |

---

**Configuration Details:**

The system is configured via environment variables loaded from a `.env` file in the `backend/` directory. Key configuration parameters include:

| Variable | Description | Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Session Pooler) | `postgresql://user:pass@aws-0-region.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret key for JWT signing (48-byte URL-safe token) | `<generated via secrets.token_urlsafe(48)>` |
| `INTERNAL_SERVICE_SECRET` | Shared secret for inter-service calls | `<generated via secrets.token_urlsafe(48)>` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `PORT` | Port for each service | 5000–5007 (per service) |
| `AUTH_URL` | Gateway's upstream URL for auth-service | `http://127.0.0.1:5001` |
| `CLINICAL_URL` | Gateway's upstream URL for clinical-service | `http://127.0.0.1:5002` |

**Deployment Configuration:**
- Each microservice runs in its own Python virtual environment (`.venv/`) for full dependency isolation
- Services are started/stopped via PowerShell scripts: `start-all.ps1` and `stop-all.ps1`
- Running PIDs are persisted to `.running-pids.json` for clean shutdown
- Alembic per-service migration config in `alembic.ini` pointing to the service's own schema
- Frontend runs on `http://localhost:5173` via `npm run dev` (Vite dev server)
- No containerization (Docker/Kubernetes) in the current version — each process is a plain OS-level Python process

**Supabase-Specific Configuration Notes:**
- Connection string must use the **Session Pooler** endpoint (`aws-0-<region>.pooler.supabase.com`), not the direct connection, due to IPv6-only DNS resolution on the direct host
- The authentication schema is named `clinic_auth` (not `auth`) because Supabase reserves the `auth` schema for its own GoTrue authentication system
- Special characters in DB passwords (e.g., `@`, `%`, `/`, `#`) must be URL-encoded in `DATABASE_URL`
- Schema is initialized once via `backend/sql/schema.sql` run against the Supabase SQL Editor; Alembic is then stamped to the baseline with `./migrate-all.ps1 -Stamp`

---

### 📈 RESULTS AND PATTERN EXPLANATION (Use in Section 10 — Results and Discussion)

This section instructs the AI to present the system's measurable outcomes and explain the recurring architectural and behavioral patterns observed across the project.

---

**A. Quantitative Results — Present as Tables and Bullet Points**

Include the following concrete measurements in the Results section:

**System Coverage:**

| Metric | Value |
|---|---|
| Total User Roles | 5 (Admin, Doctor, Receptionist, Patient, Medical Store) |
| Total UI Pages / Screens | 30+ (across all role dashboards and sub-pages) |
| REST API Endpoints | 40+ (across 7 microservices, exposed through gateway) |
| Microservices | 8 (1 gateway + 7 domain services) |
| PostgreSQL Schemas | 8 (one per service: clinic_auth, clinical, prescription, pharmacy, billing, notification, core) |
| Database Tables | 15+ (User, Doctor, Patient, Appointment, Consultation, Prescription, MedicalStore, MedicineInventory, Bill, Notification, etc.) |
| Supported Languages | 6 (English, Hindi, Tamil, Telugu, Kannada, Malayalam) |
| i18n Translation Keys | 500+ string keys per language |
| Chatbot Symptom Categories | 50+ mapped symptom-to-department intents |
| Seed Demo Records | 8 departments, 10 doctors, 6 patients, 15 appointments, 5 user accounts |
| Frontend Codebase Size | ~150,000+ bytes of JSX/JavaScript |
| Backend Codebase Size | ~50,000+ bytes of Python |

---

**B. Functional Results — Per-Role Workflow Outcomes**

Present these results as workflow completion evidence:

- **Admin role**: Successfully aggregates live KPIs (total patients, doctors, appointments, revenue, pending bills, department count, active users) from 4 independent API services in a single dashboard render using `Promise.all()` — demonstrating cross-service read aggregation without a dedicated BFF (Backend-for-Frontend) layer.

- **Doctor role**: Complete appointment-to-prescription pipeline verified end-to-end: appointment status transitions (scheduled → confirmed → arrived → completed), linked consultation creation with vitals captured as flexible JSONB, and prescription generation linked to the consultation ID.

- **Receptionist role**: Patient registration creates both a `clinic_auth.users` record (auth service) and a `clinical.patients` record (clinical service) in separate schemas — demonstrating cross-service write coordination managed at the frontend API layer.

- **Patient role**: Self-service medical history retrieval pulls appointments, prescriptions, and consultation notes across three services using patient-scoped JWT claims.

- **Medical Store role**: Dispense flow fetches pending prescriptions from prescription-service, decrements inventory in pharmacy-service, and marks prescriptions as dispensed — a best-effort sequential orchestration pattern across two services.

- **Chatbot**: Correctly routes 50+ symptom inputs to the right department and recommends specific doctors using in-memory lookup, with response latency of <50ms (client-side only, no network round-trip).

---

**C. Architectural Patterns Observed and Explained**

Instruct the AI to identify and explain the following recurring patterns in the paper:

**Pattern 1 — Gateway-Mediated Security (API Gateway Pattern)**
All 40+ endpoints are secured at a single point (the gateway) rather than per-service. JWT validation happens once at the perimeter; downstream services trust an `X-Internal-Secret` header instead. This pattern reduces code duplication across services and centralizes token expiry/invalidation logic.

**Pattern 2 — Schema-Per-Service Data Isolation**
Each microservice owns a dedicated PostgreSQL schema within a single database instance. This is a pragmatic middle ground between a single shared schema (tight coupling) and a database-per-service (high operational overhead). Cross-schema foreign keys are avoided — services use `user_id` as a loose reference, not a FK constraint, preserving service independence.

**Pattern 3 — Role-Gated Route Protection (Frontend RBAC Pattern)**
The React frontend uses a `RoleRoute` wrapper component that inspects the authenticated user's role claim from JWT and redirects unauthorized access. This mirrors the backend's role-based middleware but at the UI layer, creating a defense-in-depth approach — even if the API is called directly, the gateway re-validates the role.

**Pattern 4 — Synchronous REST Orchestration (Best-Effort Saga)**
The pharmacy dispense flow calls prescription-service and pharmacy-service sequentially over REST. There is no distributed transaction coordinator. If the pharmacy stock update fails after the prescription is marked "dispensed," the system enters an inconsistent state. This is a known trade-off (documented in the codebase) — the pattern is named "best-effort sequential REST" and is flagged as a target for future Saga pattern replacement.

**Pattern 5 — Context-Driven i18n Without a Library**
Rather than adopting react-i18next or similar, the system implements a custom `LanguageContext` React context that holds the active language key and a `t(key)` translation function. Language files are plain JavaScript objects (not JSON processed at build time), allowing runtime language switching without rebuild. The pattern demonstrates that for tightly scoped multilingual needs, a zero-dependency i18n solution is viable and avoids bundle bloat.

**Pattern 6 — Symptom-Intent NLP via Keyword Matching**
The chatbot resolves user intent through a two-pass keyword scan: first matching against a symptom dictionary (50+ entries), then resolving matched symptoms to departments and doctors. Multiple symptom matches are deduplicated using a Set. This pattern achieves O(n × m) matching complexity where n = number of symptom keys and m = input length — fast enough for in-browser real-time processing with no API calls.

**Pattern 7 — Parallel API Fan-Out on Dashboard Load**
The Admin Dashboard fires 8 API calls simultaneously using `Promise.all()` on component mount. This fan-out pattern reduces total load time from the sum of sequential calls to the latency of the slowest single call — a critical optimization when each service is an independent network hop.

---

**D. Performance and Scalability Observations**

Include the following analysis in the Results section:

- **Connection pooling**: Using Supabase's Session Pooler instead of a direct connection reduces connection overhead significantly. Each service opens a small pool of persistent connections rather than a new TCP connection per request.
- **Stateless services**: All 7 backend services are stateless (no in-memory session state). JWT carries all identity context, meaning any service instance can handle any request — a prerequisite for horizontal scaling.
- **Independent deployability**: Because each service has its own virtualenv, port, and schema, any single service can be restarted, updated, or scaled without touching others — the core promise of the microservices pattern is structurally achieved even without Docker.
- **Frontend bundle size**: Vite's tree-shaking and ES module output ensure only used code is bundled. The absence of a heavy UI framework (e.g., Material UI, Ant Design) and the use of vanilla CSS keeps the initial JS payload lean.

---

**E. Comparison with Baseline / Related Systems**

Present a comparison table in the paper:

| Feature | MedAI (This System) | OpenEMR | Bahmni |
|---|---|---|---|
| Architecture | Microservices (8 services) | Monolithic PHP | Modular Monolith |
| Multilingual | 6 Indian languages | Limited | Yes (via OpenMRS) |
| AI Chatbot | Built-in (rule-based) | No | No |
| RBAC | 5 roles, JWT-based | Yes (ACL) | Yes |
| Deployment | No-Docker, plain processes | Docker / LAMP | Docker / Tomcat |
| Cloud DB | Supabase / PostgreSQL | MySQL/MariaDB | MySQL |
| Frontend | React 19 SPA | Legacy PHP views | React (partial) |
| License | Proprietary / Academic | GPL v3 | MPL 2.0 |
| Target Scale | Single clinic | Multi-clinic enterprise | District hospital |

---

## 💡 USAGE TIPS

| AI Tool | How to Use |
|---|---|
| ChatGPT (GPT-4o) | New chat → paste entire prompt above |
| Google Gemini Advanced | New chat → paste entire prompt above |
| Claude (Anthropic) | New conversation → paste entire prompt above |
| Perplexity AI | Writing mode → paste entire prompt above |

**Tip:** If the paper gets cut off, follow up with: "Continue from Section 7 onwards."

**Tip:** To get citations, add at the end of the prompt: "Also generate 15 realistic IEEE-format references relevant to these topics."

**Tip:** For a shorter version (conference abstract + 4-page paper), add: "Shorten this to a 4-page IEEE format short paper with abstract, introduction, architecture, and conclusion only."
