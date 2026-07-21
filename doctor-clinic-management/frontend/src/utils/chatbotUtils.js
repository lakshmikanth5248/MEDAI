export function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

let messageIdCounter = 0;
export function createMessage(from, type, content, meta = {}) {
  return {
    id: `msg_${++messageIdCounter}_${Date.now()}`,
    from,
    type,
    content,
    timestamp: new Date(),
    ...meta,
  };
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
