from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import declarative_base

Base = declarative_base()

NotifType = ENUM("info", "success", "warning", "error", name="notif_type", schema="notification", create_type=False)
RecipientRole = ENUM(
    "all", "doctor", "reception", "medical_store", "patient",
    name="recipient_role", schema="notification", create_type=False,
)
SmsStatus = ENUM("sent", "failed", "pending", name="sms_status", schema="notification", create_type=False)
EmailStatus = ENUM("sent", "failed", "pending", name="email_status", schema="notification", create_type=False)


def utcnow():
    return datetime.now(timezone.utc)


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"schema": "notification"}

    id = Column(BigInteger, primary_key=True)
    message = Column(Text, nullable=False)
    type = Column(NotifType, nullable=False, default="info")
    recipient_role = Column(RecipientRole, nullable=False, default="all")
    target_user_id = Column(BigInteger)
    from_role = Column(String)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self, read=False):
        return {
            "id": self.id, "message": self.message, "type": self.type,
            "recipientRole": self.recipient_role, "targetUserId": self.target_user_id,
            "fromRole": self.from_role,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "read": read,
        }


class NotificationRead(Base):
    __tablename__ = "notification_reads"
    __table_args__ = {"schema": "notification"}

    notification_id = Column(
        BigInteger, ForeignKey("notification.notifications.id", ondelete="CASCADE"), primary_key=True
    )
    user_id = Column(BigInteger, primary_key=True)
    read_at = Column(DateTime(timezone=True), default=utcnow)


class SmsLog(Base):
    __tablename__ = "sms_logs"
    __table_args__ = {"schema": "notification"}

    id = Column(BigInteger, primary_key=True)
    recipient = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    patient_id = Column(BigInteger)
    type = Column(String)
    status = Column(SmsStatus, nullable=False, default="pending")
    sms_date = Column(DateTime(timezone=True), default=utcnow)
    message = Column(Text)

    def to_dict(self):
        return {
            "id": self.id, "recipient": self.recipient, "phone": self.phone,
            "patientId": self.patient_id, "type": self.type, "status": self.status,
            "date": self.sms_date.isoformat() if self.sms_date else None, "message": self.message,
        }


class EmailLog(Base):
    __tablename__ = "email_logs"
    __table_args__ = {"schema": "notification"}

    id = Column(BigInteger, primary_key=True)
    recipient = Column(String, nullable=False)
    email = Column(String, nullable=False)
    patient_id = Column(BigInteger)
    subject = Column(String, nullable=False)
    type = Column(String)
    status = Column(EmailStatus, nullable=False, default="pending")
    sent_at = Column(DateTime(timezone=True), default=utcnow)
    error_message = Column(Text)

    def to_dict(self):
        return {
            "id": self.id, "recipient": self.recipient, "email": self.email,
            "patientId": self.patient_id, "subject": self.subject,
            "type": self.type, "status": self.status,
            "sentAt": self.sent_at.isoformat() if self.sent_at else None,
            "errorMessage": self.error_message,
        }
