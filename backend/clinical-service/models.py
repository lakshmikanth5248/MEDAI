from datetime import datetime, timezone

from sqlalchemy import (
    ARRAY, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, BigInteger,
)
from sqlalchemy.dialects.postgresql import CITEXT, ENUM, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

Gender = ENUM("male", "female", "other", name="gender", schema="clinical", create_type=False)
EntityStatus = ENUM("active", "inactive", name="entity_status", schema="clinical", create_type=False)
AppointmentStatus = ENUM(
    "scheduled", "confirmed", "arrived", "completed", "cancelled", "rescheduled",
    name="appointment_status", schema="clinical", create_type=False,
)
BloodGroup = ENUM(
    "a_pos", "a_neg", "b_pos", "b_neg", "ab_pos", "ab_neg", "o_pos", "o_neg",
    name="blood_group", schema="clinical", create_type=False,
)

# DB stores a_pos/a_neg/... (Postgres enum labels can't start with +/-);
# the API speaks the familiar A+/A-/... - convert at the edges.
BLOOD_GROUP_TO_DISPLAY = {
    "a_pos": "A+", "a_neg": "A-", "b_pos": "B+", "b_neg": "B-",
    "ab_pos": "AB+", "ab_neg": "AB-", "o_pos": "O+", "o_neg": "O-",
}
BLOOD_GROUP_FROM_DISPLAY = {v: k for k, v in BLOOD_GROUP_TO_DISPLAY.items()}


def utcnow():
    return datetime.now(timezone.utc)


class Department(Base):
    __tablename__ = "departments"
    __table_args__ = {"schema": "clinical"}

    id = Column(BigInteger, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String)
    color = Column(String)
    description = Column(Text)
    status = Column(EntityStatus, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "icon": self.icon, "color": self.color,
            "description": self.description, "status": self.status,
        }


class Doctor(Base):
    __tablename__ = "doctors"
    __table_args__ = {"schema": "clinical"}

    id = Column(BigInteger, primary_key=True)
    doctor_code = Column(String, unique=True, nullable=False)
    user_id = Column(BigInteger, unique=True)
    department_id = Column(BigInteger, ForeignKey("clinical.departments.id"), nullable=False)
    name = Column(String, nullable=False)
    specialization = Column(String)
    qualification = Column(String)
    experience_years = Column(Integer)
    fee = Column(Numeric(10, 2), default=0)
    availability_days = Column(String)
    availability_hours = Column(String)
    rating = Column(Numeric(2, 1))
    image_url = Column(String)
    phone = Column(String)
    address = Column(Text)
    license_no = Column(String, unique=True)
    email = Column(CITEXT)
    gender = Column(Gender)
    age = Column(Integer)
    status = Column(EntityStatus, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    department = relationship("Department")

    def to_dict(self):
        return {
            "id": self.id, "doctorId": self.doctor_code, "userId": self.user_id,
            "departmentId": self.department_id,
            "department": self.department.name if self.department else None,
            "name": self.name, "specialization": self.specialization,
            "qualification": self.qualification, "education": self.qualification,
            "experience": self.experience_years, "fee": float(self.fee) if self.fee is not None else None,
            "availability": f"{self.availability_days or ''} {self.availability_hours or ''}".strip() or None,
            "rating": float(self.rating) if self.rating is not None else None,
            "image": self.image_url, "phone": self.phone, "address": self.address,
            "licenseNo": self.license_no, "email": self.email, "gender": self.gender,
            "age": self.age, "status": self.status,
        }


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "clinical"}

    id = Column(BigInteger, primary_key=True)
    patient_code = Column(String, unique=True, nullable=False)
    user_id = Column(BigInteger, unique=True)
    name = Column(String, nullable=False)
    email = Column(CITEXT)
    phone = Column(String)
    gender = Column(Gender)
    dob = Column(Date)
    blood_group = Column(BloodGroup)
    address = Column(Text)
    insurance = Column(JSONB)
    registered_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "patientId": self.patient_code, "userId": self.user_id,
            "name": self.name, "email": self.email, "phone": self.phone,
            "gender": self.gender, "dob": self.dob.isoformat() if self.dob else None,
            "bloodGroup": BLOOD_GROUP_TO_DISPLAY.get(self.blood_group) if self.blood_group else None,
            "address": self.address, "insurance": self.insurance,
            "registeredDate": self.registered_date.isoformat() if self.registered_date else None,
        }


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = {"schema": "clinical"}

    id = Column(BigInteger, primary_key=True)
    appointment_code = Column(String, unique=True, nullable=False)
    patient_id = Column(BigInteger, ForeignKey("clinical.patients.id"), nullable=False)
    doctor_id = Column(BigInteger, ForeignKey("clinical.doctors.id"), nullable=False)
    department_id = Column(BigInteger, ForeignKey("clinical.departments.id"))
    appt_date = Column(Date, nullable=False)
    appt_time = Column(Time, nullable=False)
    status = Column(AppointmentStatus, nullable=False, default="scheduled")
    type = Column(String)
    reason = Column(Text)
    previous_date = Column(Date)
    previous_time = Column(Time)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    patient = relationship("Patient")
    doctor = relationship("Doctor")
    department = relationship("Department")

    def to_dict(self):
        return {
            "id": self.id, "appointmentId": self.appointment_code,
            "patientId": self.patient_id, "doctorId": self.doctor_id,
            "department": self.department.name if self.department else None,
            "date": self.appt_date.isoformat() if self.appt_date else None,
            "time": self.appt_time.strftime("%H:%M") if self.appt_time else None,
            "status": self.status, "type": self.type, "reason": self.reason,
            "previousDate": self.previous_date.isoformat() if self.previous_date else None,
            "previousTime": self.previous_time.strftime("%H:%M") if self.previous_time else None,
        }


class Consultation(Base):
    __tablename__ = "consultations"
    __table_args__ = {"schema": "clinical"}

    id = Column(BigInteger, primary_key=True)
    appointment_id = Column(BigInteger, ForeignKey("clinical.appointments.id"), nullable=False)
    doctor_id = Column(BigInteger, ForeignKey("clinical.doctors.id"), nullable=False)
    patient_id = Column(BigInteger, ForeignKey("clinical.patients.id"), nullable=False)
    prescription_id = Column(BigInteger)
    consult_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    vitals = Column(JSONB)
    symptoms = Column(Text)
    diagnosis = Column(Text)
    tests = Column(ARRAY(String))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "appointmentId": self.appointment_id, "doctorId": self.doctor_id,
            "patientId": self.patient_id, "prescriptionId": self.prescription_id,
            "date": self.consult_date.isoformat() if self.consult_date else None,
            "vitals": self.vitals, "symptoms": self.symptoms, "diagnosis": self.diagnosis,
            "tests": self.tests or [], "notes": self.notes,
        }
