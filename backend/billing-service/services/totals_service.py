from decimal import Decimal, ROUND_HALF_UP


def _money(value):
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_totals(items, discount, discount_type, tax_percent):
    """Server-side invoice math, computed and frozen once at bill creation
    (see plan §"business logic to preserve"): subtotal = sum(item amounts),
    discountAmt = percent-of-subtotal or a flat amount, taxAmt is applied
    AFTER discount, grandTotal = subtotal - discountAmt + taxAmt.
    """
    subtotal = sum((_money(i["quantity"]) * _money(i["rate"]) for i in items), Decimal("0.00"))

    discount = _money(discount or 0)
    if discount_type == "percent":
        discount_amt = (subtotal * discount / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    else:
        discount_amt = discount

    tax_percent = _money(tax_percent or 0)
    taxable_base = subtotal - discount_amt
    tax_amt = (taxable_base * tax_percent / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    grand_total = taxable_base + tax_amt

    return {
        "subtotal": float(subtotal),
        "discountAmt": float(discount_amt),
        "taxAmt": float(tax_amt),
        "grandTotal": float(grand_total),
    }
