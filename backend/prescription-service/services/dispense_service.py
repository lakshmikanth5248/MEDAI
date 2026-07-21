from datetime import datetime, timezone

from clinic_shared import APIError

from . import clients

DISPENSABLE_STATUSES = ("pending", "active")


def dispense(session, prescription, store_id):
    """Orchestrates the cross-service dispense transaction (plan §4):
    1. Decrement pharmacy-service inventory FIRST (the harder-to-reverse,
       business-critical side effect) - all-or-nothing across every item.
    2. Only after that succeeds, update this service's own row.
    3. Notify the prescribing doctor - best-effort, never blocks/rolls back
       the dispense if it fails.

    There is no distributed-transaction/saga tooling here (no message
    broker, per the confirmed architecture) - a crash between steps 1 and 2
    could leave inventory decremented but the prescription not yet marked
    dispensed. This is a documented, accepted gap (see plan §8), not a
    silent bug.
    """
    if prescription.status not in DISPENSABLE_STATUSES:
        raise APIError(
            f"Prescription is '{prescription.status}' and cannot be dispensed",
            409, "invalid_transition",
        )
    if not prescription.items:
        raise APIError("Prescription has no medicines to dispense", 400, "validation_error")

    items_payload = [{"name": item.name, "quantity": item.quantity} for item in prescription.items]
    decremented = clients.decrement_inventory(store_id, items_payload)

    price_by_name = {d["name"].strip().lower(): d for d in decremented}
    total_cost = 0.0
    for item in prescription.items:
        match = price_by_name.get(item.name.strip().lower())
        if match:
            item.inventory_item_id = match["inventoryItemId"]
            item.unit_price = match["unitPrice"]
            total_cost += match["unitPrice"] * item.quantity

    prescription.status = "dispensed"
    prescription.store_id = store_id
    prescription.dispensed_by = store_id
    prescription.dispensed_at = datetime.now(timezone.utc)
    prescription.total_cost = round(total_cost, 2)
    session.commit()

    doctor = clients.get_doctor(prescription.doctor_id)
    doctor_user_id = doctor.get("userId") if doctor else None
    clients.notify_doctor_of_dispense(doctor_user_id, prescription.rx_code)

    return prescription
