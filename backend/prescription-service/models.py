from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

PrescriptionStatus = ENUM(
    "pending", "active", "dispensed", "cancelled",
    name="status", schema="prescription", create_type=False,
)
DurationType = ENUM("days", "weeks", "months", name="duration_type", schema="prescription", create_type=False)


def utcnow():
    return datetime.now(timezone.utc)


class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = {"schema": "prescription"}

    id = Column(BigInteger, primary_key=True)
    rx_code = Column(String, unique=True, nullable=False)
    appointment_id = Column(BigInteger)
    consultation_id = Column(BigInteger)
    patient_id = Column(BigInteger, nullable=False)
    doctor_id = Column(BigInteger, nullable=False)
    store_id = Column(BigInteger)
    rx_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    notes = Column(Text)
    status = Column(PrescriptionStatus, nullable=False, default="pending")
    total_cost = Column(Numeric(10, 2))
    dispensed_by = Column(BigInteger)
    dispensed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)

    items = relationship("PrescriptionItem", backref="prescription", cascade="all, delete-orphan")

    def to_dict(self, include_items=True):
        d = {
            "id": self.id, "rxId": self.rx_code, "appointmentId": self.appointment_id,
            "consultationId": self.consultation_id, "patientId": self.patient_id,
            "doctorId": self.doctor_id, "storeId": self.store_id,
            "date": self.rx_date.isoformat() if self.rx_date else None,
            "notes": self.notes, "status": self.status,
            "totalCost": float(self.total_cost) if self.total_cost is not None else None,
            "dispensedBy": self.dispensed_by,
            "dispensedAt": self.dispensed_at.isoformat() if self.dispensed_at else None,
        }
        if include_items:
            d["medicines"] = [i.to_dict() for i in self.items]
        return d


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"
    __table_args__ = {"schema": "prescription"}

    id = Column(BigInteger, primary_key=True)
    prescription_id = Column(BigInteger, ForeignKey("prescription.prescriptions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(Integer)
    duration_type = Column(DurationType)
    quantity = Column(Integer, nullable=False)
    instructions = Column(Text)
    inventory_item_id = Column(BigInteger)
    unit_price = Column(Numeric(10, 2))

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "dosage": self.dosage, "frequency": self.frequency,
            "duration": self.duration, "durationType": self.duration_type, "quantity": self.quantity,
            "instructions": self.instructions, "inventoryItemId": self.inventory_item_id,
            "unitPrice": float(self.unit_price) if self.unit_price is not None else None,
        }
