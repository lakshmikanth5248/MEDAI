-- =====================================================================
-- doctor-clinic-management — full Postgres schema (schema-per-service)
-- Run this ONCE against the Supabase database before starting any service
-- or running Alembic migrations (Alembic will detect these tables already
-- exist; see backend/README.md for the recommended order).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================================
-- SCHEMAS
-- =====================================================================
CREATE SCHEMA IF NOT EXISTS clinic_auth;
CREATE SCHEMA IF NOT EXISTS clinical;
CREATE SCHEMA IF NOT EXISTS prescription;
CREATE SCHEMA IF NOT EXISTS pharmacy;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS core;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================
CREATE TYPE clinic_auth.user_role AS ENUM ('admin','doctor','reception','patient','medical_store');
CREATE TYPE clinic_auth.user_status AS ENUM ('active','inactive');

CREATE TYPE clinical.gender AS ENUM ('male','female','other');
CREATE TYPE clinical.entity_status AS ENUM ('active','inactive');
CREATE TYPE clinical.appointment_status AS ENUM
  ('scheduled','confirmed','arrived','completed','cancelled','rescheduled');
CREATE TYPE clinical.blood_group AS ENUM
  ('a_pos','a_neg','b_pos','b_neg','ab_pos','ab_neg','o_pos','o_neg');

CREATE TYPE prescription.status AS ENUM ('pending','active','dispensed','cancelled');
CREATE TYPE prescription.duration_type AS ENUM ('days','weeks','months');

CREATE TYPE billing.bill_status AS ENUM ('paid','pending','unpaid');
CREATE TYPE billing.discount_type AS ENUM ('fixed','percent');
CREATE TYPE billing.payment_method AS ENUM ('cash','card','upi','insurance');

CREATE TYPE notification.notif_type AS ENUM ('info','success','warning','error');
CREATE TYPE notification.recipient_role AS ENUM ('all','doctor','reception','medical_store','patient');
CREATE TYPE notification.sms_status AS ENUM ('sent','failed','pending');

CREATE TYPE core.activity_action_type AS ENUM
  ('registration','appointment','payment','prescription','doctor','other');

-- =====================================================================
-- SCHEMA: auth   (owned by auth-service)
-- =====================================================================
CREATE SEQUENCE clinic_auth.doctor_uid_seq START WITH 1;
CREATE SEQUENCE clinic_auth.reception_uid_seq START WITH 1;
CREATE SEQUENCE clinic_auth.patient_uid_seq START WITH 1;
CREATE SEQUENCE clinic_auth.store_uid_seq START WITH 1;
CREATE SEQUENCE clinic_auth.admin_uid_seq START WITH 1;

CREATE TABLE clinic_auth.users (
  id                    BIGSERIAL PRIMARY KEY,
  email                 CITEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,
  role                  clinic_auth.user_role NOT NULL,
  uid                   TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  status                clinic_auth.user_status NOT NULL DEFAULT 'active',
  must_change_password  BOOLEAN NOT NULL DEFAULT false,
  last_login            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON clinic_auth.users(role);
CREATE INDEX idx_users_status ON clinic_auth.users(status);

CREATE TABLE clinic_auth.staff_profiles (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL UNIQUE REFERENCES clinic_auth.users(id) ON DELETE CASCADE,
  role          clinic_auth.user_role NOT NULL,
  phone         TEXT,
  floor         TEXT,
  shift         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinic_auth.password_reset_tokens (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES clinic_auth.users(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prt_user ON clinic_auth.password_reset_tokens(user_id);
CREATE INDEX idx_prt_token ON clinic_auth.password_reset_tokens(token);

-- =====================================================================
-- SCHEMA: clinical   (owned by clinical-service)
-- =====================================================================
CREATE SEQUENCE clinical.doctor_id_seq START WITH 100001;
CREATE SEQUENCE clinical.patient_id_seq START WITH 100001;
CREATE SEQUENCE clinical.appointment_id_seq START WITH 100001;

CREATE TABLE clinical.departments (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  icon          TEXT,
  color         TEXT,
  description   TEXT,
  status        clinical.entity_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinical.doctors (
  id                BIGSERIAL PRIMARY KEY,
  doctor_code       TEXT UNIQUE NOT NULL DEFAULT ('DOC-' || nextval('clinical.doctor_id_seq')),
  user_id           BIGINT UNIQUE,
  department_id     BIGINT NOT NULL REFERENCES clinical.departments(id),
  name              TEXT NOT NULL,
  specialization    TEXT,
  qualification     TEXT,
  experience_years  INTEGER,
  fee               NUMERIC(10,2) NOT NULL DEFAULT 0,
  availability_days  TEXT,
  availability_hours TEXT,
  rating            NUMERIC(2,1),
  image_url         TEXT,
  phone             TEXT,
  address           TEXT,
  license_no        TEXT UNIQUE,
  email             CITEXT,
  gender            clinical.gender,
  age               INTEGER,
  status            clinical.entity_status NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES clinic_auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_doctors_department ON clinical.doctors(department_id);
CREATE INDEX idx_doctors_status ON clinical.doctors(status);
CREATE INDEX idx_doctors_user ON clinical.doctors(user_id);

CREATE TABLE clinical.patients (
  id              BIGSERIAL PRIMARY KEY,
  patient_code    TEXT UNIQUE NOT NULL DEFAULT ('PAT-' || nextval('clinical.patient_id_seq')),
  user_id         BIGINT UNIQUE,
  name            TEXT NOT NULL,
  email           CITEXT,
  phone           TEXT,
  gender          clinical.gender,
  dob             DATE,
  blood_group     clinical.blood_group,
  address         TEXT,
  insurance       JSONB,
  registered_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES clinic_auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_patients_user ON clinical.patients(user_id);
CREATE INDEX idx_patients_phone ON clinical.patients(phone);

CREATE TABLE clinical.appointments (
  id                BIGSERIAL PRIMARY KEY,
  appointment_code  TEXT UNIQUE NOT NULL DEFAULT ('APT-' || nextval('clinical.appointment_id_seq')),
  patient_id        BIGINT NOT NULL REFERENCES clinical.patients(id),
  doctor_id         BIGINT NOT NULL REFERENCES clinical.doctors(id),
  department_id     BIGINT REFERENCES clinical.departments(id),
  appt_date         DATE NOT NULL,
  appt_time         TIME NOT NULL,
  status            clinical.appointment_status NOT NULL DEFAULT 'scheduled',
  type              TEXT,
  reason            TEXT,
  previous_date     DATE,
  previous_time     TIME,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appt_patient ON clinical.appointments(patient_id);
CREATE INDEX idx_appt_doctor ON clinical.appointments(doctor_id);
CREATE INDEX idx_appt_date ON clinical.appointments(appt_date);
CREATE INDEX idx_appt_status ON clinical.appointments(status);

CREATE TABLE clinical.consultations (
  id              BIGSERIAL PRIMARY KEY,
  appointment_id  BIGINT NOT NULL REFERENCES clinical.appointments(id),
  doctor_id       BIGINT NOT NULL REFERENCES clinical.doctors(id),
  patient_id      BIGINT NOT NULL REFERENCES clinical.patients(id),
  prescription_id BIGINT,
  consult_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  vitals          JSONB,
  symptoms        TEXT,
  diagnosis       TEXT,
  tests           TEXT[],
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_consult_appt ON clinical.consultations(appointment_id);
CREATE INDEX idx_consult_doctor ON clinical.consultations(doctor_id);
CREATE INDEX idx_consult_patient ON clinical.consultations(patient_id);

-- =====================================================================
-- SCHEMA: pharmacy   (owned by pharmacy-service)
-- created BEFORE prescription schema so prescription's cross-schema FKs
-- to pharmacy.medical_stores / pharmacy.medicine_inventory resolve.
-- =====================================================================
CREATE SEQUENCE pharmacy.store_id_seq START WITH 100001;

CREATE TABLE pharmacy.medical_stores (
  id            BIGSERIAL PRIMARY KEY,
  store_code    TEXT UNIQUE NOT NULL DEFAULT ('STORE-' || nextval('pharmacy.store_id_seq')),
  user_id       BIGINT UNIQUE,
  name          TEXT NOT NULL,
  address       TEXT,
  phone         TEXT,
  email         CITEXT,
  status        clinical.entity_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_store_user FOREIGN KEY (user_id) REFERENCES clinic_auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_store_user ON pharmacy.medical_stores(user_id);

CREATE TABLE pharmacy.medicine_inventory (
  id              BIGSERIAL PRIMARY KEY,
  store_id        BIGINT NOT NULL REFERENCES pharmacy.medical_stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT,
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price           NUMERIC(10,2) NOT NULL,
  expiry_date     DATE,
  manufacturer    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_store ON pharmacy.medicine_inventory(store_id);
CREATE INDEX idx_inventory_stock ON pharmacy.medicine_inventory(stock);
CREATE INDEX idx_inventory_name ON pharmacy.medicine_inventory(store_id, name);

-- =====================================================================
-- SCHEMA: prescription   (owned by prescription-service)
-- =====================================================================
CREATE SEQUENCE prescription.rx_id_seq START WITH 100001;

CREATE TABLE prescription.prescriptions (
  id              BIGSERIAL PRIMARY KEY,
  rx_code         TEXT UNIQUE NOT NULL DEFAULT ('RX-' || nextval('prescription.rx_id_seq')),
  appointment_id  BIGINT,
  consultation_id BIGINT,
  patient_id      BIGINT NOT NULL,
  doctor_id       BIGINT NOT NULL,
  store_id        BIGINT,
  rx_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  status          prescription.status NOT NULL DEFAULT 'pending',
  total_cost      NUMERIC(10,2),
  dispensed_by    BIGINT,
  dispensed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_rx_appointment FOREIGN KEY (appointment_id) REFERENCES clinical.appointments(id),
  CONSTRAINT fk_rx_consultation FOREIGN KEY (consultation_id) REFERENCES clinical.consultations(id),
  CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES clinical.patients(id),
  CONSTRAINT fk_rx_doctor FOREIGN KEY (doctor_id) REFERENCES clinical.doctors(id),
  CONSTRAINT fk_rx_store FOREIGN KEY (store_id) REFERENCES pharmacy.medical_stores(id),
  CONSTRAINT fk_rx_dispensed_by FOREIGN KEY (dispensed_by) REFERENCES pharmacy.medical_stores(id)
);
CREATE INDEX idx_rx_patient ON prescription.prescriptions(patient_id);
CREATE INDEX idx_rx_doctor ON prescription.prescriptions(doctor_id);
CREATE INDEX idx_rx_store ON prescription.prescriptions(store_id);
CREATE INDEX idx_rx_status ON prescription.prescriptions(status);
CREATE INDEX idx_rx_date ON prescription.prescriptions(rx_date);

CREATE TABLE prescription.prescription_items (
  id                BIGSERIAL PRIMARY KEY,
  prescription_id   BIGINT NOT NULL REFERENCES prescription.prescriptions(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  dosage            TEXT,
  frequency         TEXT,
  duration          INTEGER,
  duration_type     prescription.duration_type,
  quantity          INTEGER NOT NULL,
  instructions      TEXT,
  inventory_item_id BIGINT,
  unit_price        NUMERIC(10,2),
  CONSTRAINT fk_item_inventory FOREIGN KEY (inventory_item_id) REFERENCES pharmacy.medicine_inventory(id)
);
CREATE INDEX idx_rxitem_prescription ON prescription.prescription_items(prescription_id);

-- now that prescription.prescriptions exists, add the cross-schema back-reference
-- from clinical.consultations -> prescription.prescriptions
ALTER TABLE clinical.consultations
  ADD CONSTRAINT fk_consult_prescription FOREIGN KEY (prescription_id) REFERENCES prescription.prescriptions(id);

-- =====================================================================
-- SCHEMA: billing   (owned by billing-service)
-- =====================================================================
CREATE SEQUENCE billing.bill_id_seq START WITH 100001;

CREATE TABLE billing.bills (
  id              BIGSERIAL PRIMARY KEY,
  bill_code       TEXT UNIQUE NOT NULL DEFAULT ('BILL-' || nextval('billing.bill_id_seq')),
  patient_id      BIGINT NOT NULL,
  bill_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status          billing.bill_status NOT NULL DEFAULT 'pending',
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_type   billing.discount_type NOT NULL DEFAULT 'fixed',
  tax_percent     NUMERIC(5,2) NOT NULL DEFAULT 5,
  payment_method  billing.payment_method,
  notes           TEXT,
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amt    NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amt         NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total     NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES clinical.patients(id)
);
CREATE INDEX idx_bill_patient ON billing.bills(patient_id);
CREATE INDEX idx_bill_status ON billing.bills(status);
CREATE INDEX idx_bill_date ON billing.bills(bill_date);

CREATE TABLE billing.bill_items (
  id            BIGSERIAL PRIMARY KEY,
  bill_id       BIGINT NOT NULL REFERENCES billing.bills(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  rate          NUMERIC(10,2) NOT NULL,
  amount        NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_billitem_bill ON billing.bill_items(bill_id);

-- =====================================================================
-- SCHEMA: notification   (owned by notification-service)
-- =====================================================================
CREATE TABLE notification.notifications (
  id              BIGSERIAL PRIMARY KEY,
  message         TEXT NOT NULL,
  type            notification.notif_type NOT NULL DEFAULT 'info',
  recipient_role  notification.recipient_role NOT NULL DEFAULT 'all',
  target_user_id  BIGINT,
  from_role       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_recipient ON notification.notifications(recipient_role);
CREATE INDEX idx_notif_target_user ON notification.notifications(target_user_id);
CREATE INDEX idx_notif_created ON notification.notifications(created_at DESC);

CREATE TABLE notification.notification_reads (
  notification_id BIGINT NOT NULL REFERENCES notification.notifications(id) ON DELETE CASCADE,
  user_id         BIGINT NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);
CREATE INDEX idx_notifread_user ON notification.notification_reads(user_id);

CREATE TABLE notification.sms_logs (
  id            BIGSERIAL PRIMARY KEY,
  recipient     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  patient_id    BIGINT,
  type          TEXT,
  status        notification.sms_status NOT NULL DEFAULT 'pending',
  sms_date      TIMESTAMPTZ NOT NULL DEFAULT now(),
  message       TEXT,
  CONSTRAINT fk_sms_patient FOREIGN KEY (patient_id) REFERENCES clinical.patients(id)
);
CREATE INDEX idx_sms_patient ON notification.sms_logs(patient_id);
CREATE INDEX idx_sms_status ON notification.sms_logs(status);
CREATE INDEX idx_sms_date ON notification.sms_logs(sms_date DESC);

-- =====================================================================
-- SCHEMA: core   (owned by core-service)
-- =====================================================================
CREATE TABLE core.clinics (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  address         TEXT,
  phone           TEXT,
  email           CITEXT,
  working_hours   TEXT,
  status          clinical.entity_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE core.clinic_settings (
  id              BIGSERIAL PRIMARY KEY,
  setting_key     TEXT UNIQUE NOT NULL,
  setting_value   JSONB NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE core.activity_log (
  id                  BIGSERIAL PRIMARY KEY,
  actor_user_id       BIGINT,
  actor_name          TEXT NOT NULL,
  action_type         core.activity_action_type NOT NULL DEFAULT 'other',
  target_description  TEXT,
  entity_type         TEXT,
  entity_id           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_created ON core.activity_log(created_at DESC);
CREATE INDEX idx_activity_actor ON core.activity_log(actor_user_id);

-- =====================================================================
-- Done. Verify with:  \dn   and   \dt clinical.*  (etc.) in psql
-- =====================================================================
