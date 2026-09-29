export const TONE_IDS = ["clean", "muted", "drive", "acoustic"] as const;
export type ToneId = (typeof TONE_IDS)[number];

export const DEFAULT_TONE: ToneId = "clean";

export const TONE_LABELS: Record<ToneId, string> = {
  clean: "Guitarra limpa",
  muted: "Guitarra abafada",
  drive: "Guitarra com drive",
  acoustic: "Violão",
};

export const TONE_INSTRUMENTS: Record<ToneId, string> = {
  clean: "electric_guitar_clean",
  muted: "electric_guitar_muted",
  drive: "overdriven_guitar",
  acoustic: "acoustic_guitar_steel",
};

const KEY = "tonic.tone";
const listeners = new Set<() => void>();

function read(): ToneId {
  try {
    const saved = localStorage.getItem(KEY);
    return TONE_IDS.includes(saved as ToneId) ? (saved as ToneId) : DEFAULT_TONE;
  } catch {
    return DEFAULT_TONE; 
  }
}

let current = read();

export const getTone = () => current;

export function setTone(tone: ToneId) {
  current = tone;
  localStorage.setItem(KEY, tone);
  listeners.forEach((listener) => listener());
}

export function subscribeTone(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
