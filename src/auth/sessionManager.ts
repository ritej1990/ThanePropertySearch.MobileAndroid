type SessionExpiredListener = () => void;

let handlingExpiry = false;
const listeners = new Set<SessionExpiredListener>();

/** Reset after a successful login so a future expiry can be handled again. */
export function resetSessionExpiryGuard(): void {
  handlingExpiry = false;
}

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Called when an authenticated API request returns 401. */
export function notifySessionExpired(): void {
  if (handlingExpiry) return;
  handlingExpiry = true;
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* listener owns recovery */
    }
  });
}
