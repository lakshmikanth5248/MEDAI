from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import CITEXT, ENUM, JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()

EntityStatus = ENUM("active", "inactive", name="entity_status", schema="clinical", create_type=False)
ActivityActionType = ENUM(
    "registration", "appointment", "payment", "prescription", "doctor", "other",
    name="activity_action_type", schema="core", create_type=False,
)


def utcnow():
    return datetime.now(timezone.utc)


class Clinic(Base):
    __tablename__ = "clinics"
    __table_args__ = {"schema": "core"}

    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(Text)
    phone = Column(String)
    email = Column(CITEXT)
    working_hours = Column(String)
    status = Column(EntityStatus, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "address": self.address, "phone": self.phone,
            "email": self.email, "workingHours": self.working_hours, "status": self.status,
        }


class ClinicSetting(Base):
    __tablename__ = "clinic_settings"
    __table_args__ = {"schema": "core"}

    id = Column(BigInteger, primary_key=True)
    setting_key = Column(String, unique=True, nullable=False)
    setting_value = Column(JSONB, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_log"
    __table_args__ = {"schema": "core"}

    id = Column(BigInteger, primary_key=True)
    actor_user_id = Column(BigInteger)
    actor_name = Column(String, nullable=False)
    action_type = Column(ActivityActionType, nullable=False, default="other")
    target_description = Column(Text)
    entity_type = Column(String)
    entity_id = Column(String)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "actorUserId": self.actor_user_id, "actorName": self.actor_name,
            "actionType": self.action_type, "targetDescription": self.target_description,
            "entityType": self.entity_type, "entityId": self.entity_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
