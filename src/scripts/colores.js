const LIMITE = 40;

/** Clase CSS según horas semanales acumuladas. */
export function claseHoras(h) {
  if (h <= 0) return "";
  if (h < LIMITE) return "hs-low";
  if (h === LIMITE) return "hs-ok";
  return "hs-over";
}

/** Emoji indicador rápido. */
export function emojiHoras(h) {
  if (h <= 0) return "—";
  if (h < LIMITE) return "🟡";
  if (h === LIMITE) return "🟢";
  return "🔴";
}
