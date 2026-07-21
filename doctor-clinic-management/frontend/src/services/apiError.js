// Every backend service returns errors as { error: "<code>", message: "<text>" }
// (see backend/shared/clinic_shared/errors.py). This pulls a display-ready
// message out of any axios error, falling back gracefully if the network
// itself failed (no response at all).
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}
