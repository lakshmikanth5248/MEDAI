from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, BigInteger
from sqlalchemy.dialects.postgresql import CITEXT, ENUM
from sqlalchemy.orm import declarative_base

Base = declarative_base()

UserRole = ENUM(
    "admin", "doctor", "reception", "patient", "medical_store",
    name="user_role", schema="clinic_auth", create_type=False,
)
UserStatus = ENUM("active", "inactive", "blocked", "deleted", name="user_status", schema="clinic_auth", create_type=False)


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "clinic_auth"}

    id = Column(BigInteger, primary_key=True)
    email = Column(CITEXT, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(UserRole, nullable=False)
    uid = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    status = Column(UserStatus, nullable=False, default="active")
    must_change_password = Column(Boolean, nullable=False, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def to_dict(self, include_email=True):
        d = {
            "id": self.id,
            "role": self.role,
            "uid": self.uid,
            "name": self.name,
            "status": self.status,
            "mustChangePassword": self.must_change_password,
            "lastLogin": self.last_login.isoformat() if self.last_login else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_email:
            d["email"] = self.email
        return d


class StaffProfile(Base):
    __tablename__ = "staff_profiles"
    __table_args__ = {"schema": "clinic_auth"}

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("clinic_auth.users.id", ondelete="CASCADE"), unique=True, nullable=False)
    role = Column(UserRole, nullable=False)
    phone = Column(String)
    floor = Column(String)
    shift = Column(String)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    def to_dict(self):
        return {
            "userId": self.user_id,
            "role": self.role,
            "phone": self.phone,
            "floor": self.floor,
            "shift": self.shift,
        }


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    __table_args__ = {"schema": "clinic_auth"}

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("clinic_auth.users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)
