const STORAGE_KEY = 'clinic_bills';

export function getBills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  return [];
}

export function saveBills(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Append a generated bill (with date/time captured at creation) and persist it.
export function addBill(bill) {
  const list = getBills();
  const record = {
    ...bill,
    createdAt: new Date().toISOString(),
  };
  list.push(record);
  saveBills(list);
  return record;
}

// Combine seed mock bills with any generated in this session.
export function getAllBills(seed = []) {
  return [...seed, ...getBills()];
}
