export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-IN', options);
}

export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

export function generatePatientId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `PAT-${num}`;
}

export function generateBillId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `BILL-${num}`;
}

export function generatePrescriptionId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `RX-${num}`;
}

export function generateAppointmentId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `APT-${num}`;
}

export function getStatusColor(status) {
  const colors = {
    scheduled: '#38BDF8',
    confirmed: '#22C55E',
    completed: '#6366F1',
    cancelled: '#EF4444',
    pending: '#F97316',
    active: '#22C55E',
    inactive: '#94A3B8',
    paid: '#22C55E',
    unpaid: '#EF4444',
    dispensed: '#6366F1',
  };
  return colors[status?.toLowerCase()] || '#64748B';
}

export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trimEnd() + '...';
}

export function calculateAge(dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function getStatusBadgeClass(status) {
  const s = (status || '').toString().toLowerCase();
  if (['scheduled', 'scheduled'.toLowerCase()].includes(s)) return 'status-scheduled';
  if (['confirmed', 'confirmed'.toLowerCase()].includes(s)) return 'status-confirmed';
  if (['completed', 'completed'.toLowerCase()].includes(s)) return 'status-completed';
  if (['cancelled', 'cancelled'.toLowerCase()].includes(s)) return 'status-cancelled';
  if (['pending', 'pending'.toLowerCase()].includes(s)) return 'status-pending';
  if (['paid', 'paid'.toLowerCase()].includes(s)) return 'status-paid';
  if (['unpaid', 'unpaid'.toLowerCase()].includes(s)) return 'status-unpaid';
  if (['dispensed', 'dispensed'.toLowerCase()].includes(s)) return 'status-dispensed';
  return 'status-default';
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function getCurrentDate() {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export function getCurrentTime() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  if (!phone) return false;
  const re = /^\d{10}$/;
  return re.test(phone.replace(/\D/g, ''));
}
