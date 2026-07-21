from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import CITEXT, ENUM
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# entity_status is defined once in the `clinical` schema (schema.sql) and
# reused here by qualified reference - see plan §3 note on shared enum types.
EntityStatus = ENUM("active", "inactive", name="entity_status", schema="clinical", create_type=False)


def utcnow():
    return datetime.now(timezone.utc)


class MedicalStore(Base):
    __tablename__ = "medical_stores"
    __table_args__ = {"schema": "pharmacy"}

    id = Column(BigInteger, primary_key=True)
    store_code = Column(String, unique=True, nullable=False)
    user_id = Column(BigInteger, unique=True)
    name = Column(String, nullable=False)
    manager_name = Column(String)
    phone = Column(String)
    email = Column(CITEXT)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    pin_code = Column(String)
    floor_no = Column(String)
    store_no = Column(String)
    license_no = Column(String)
    gst_no = Column(String)
    status = Column(EntityStatus, nullable=False, default="active")
    created_by = Column(BigInteger)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "storeCode": self.store_code, "userId": self.user_id,
            "name": self.name, "managerName": self.manager_name,
            "phone": self.phone, "email": self.email,
            "address": self.address, "city": self.city, "state": self.state,
            "pinCode": self.pin_code, "floorNo": self.floor_no,
            "storeNo": self.store_no, "licenseNo": self.license_no,
            "gstNo": self.gst_no, "status": self.status,
        }


class MedicineInventory(Base):
    __tablename__ = "medicine_inventory"
    __table_args__ = (
        CheckConstraint("stock >= 0", name="ck_inventory_stock_nonneg"),
        {"schema": "pharmacy"},
    )

    id = Column(BigInteger, primary_key=True)
    store_id = Column(BigInteger, ForeignKey("pharmacy.medical_stores.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String)
    stock = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False)
    expiry_date = Column(Date)
    manufacturer = Column(String)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    store = relationship("MedicalStore")

    def to_dict(self):
        return {
            "id": self.id, "storeId": self.store_id, "name": self.name, "category": self.category,
            "stock": self.stock, "price": float(self.price) if self.price is not None else None,
            "expiryDate": self.expiry_date.isoformat() if self.expiry_date else None,
            "manufacturer": self.manufacturer,
        }
