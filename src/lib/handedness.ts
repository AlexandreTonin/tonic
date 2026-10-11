const KEY = 'tonic.left-handed';
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}

let current = read();

export const getLeftHanded = () => current;

export function setLeftHanded(value: boolean) {
  current = value;
  listeners.forEach((listener) => listener());
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    return;
  }
}

export function subscribeLeftHanded(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
