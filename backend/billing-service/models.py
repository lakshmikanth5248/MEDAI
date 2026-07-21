from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

BillStatus = ENUM("paid", "pending", "unpaid", name="bill_status", schema="billing", create_type=False)
DiscountType = ENUM("fixed", "percent", name="discount_type", schema="billing", create_type=False)
PaymentMethod = ENUM("cash", "card", "upi", "insurance", name="payment_method", schema="billing", create_type=False)


def utcnow():
    return datetime.now(timezone.utc)


class Bill(Base):
    __tablename__ = "bills"
    __table_args__ = {"schema": "billing"}

    id = Column(BigInteger, primary_key=True)
    bill_code = Column(String, unique=True, nullable=False)
    patient_id = Column(BigInteger, nullable=False)
    bill_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    status = Column(BillStatus, nullable=False, default="pending")
    discount = Column(Numeric(10, 2), nullable=False, default=0)
    discount_type = Column(DiscountType, nullable=False, default="fixed")
    tax_percent = Column(Numeric(5, 2), nullable=False, default=5)
    payment_method = Column(PaymentMethod)
    notes = Column(Text)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    discount_amt = Column(Numeric(10, 2), nullable=False, default=0)
    tax_amt = Column(Numeric(10, 2), nullable=False, default=0)
    grand_total = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    items = relationship("BillItem", backref="bill", cascade="all, delete-orphan")

    def to_dict(self, include_items=True):
        d = {
            "id": self.id, "billId": self.bill_code, "patientId": self.patient_id,
            "date": self.bill_date.isoformat() if self.bill_date else None,
            "status": self.status,
            "discount": float(self.discount), "discountType": self.discount_type,
            "tax": float(self.tax_percent), "paymentMethod": self.payment_method, "notes": self.notes,
            "subtotal": float(self.subtotal), "discountAmt": float(self.discount_amt),
            "taxAmt": float(self.tax_amt), "grandTotal": float(self.grand_total),
        }
        if include_items:
            d["items"] = [i.to_dict() for i in self.items]
        return d


class BillItem(Base):
    __tablename__ = "bill_items"
    __table_args__ = {"schema": "billing"}

    id = Column(BigInteger, primary_key=True)
    bill_id = Column(BigInteger, ForeignKey("billing.bills.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    rate = Column(Numeric(10, 2), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "description": self.description, "quantity": self.quantity,
            "rate": float(self.rate), "amount": float(self.amount),
        }
