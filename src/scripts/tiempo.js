/** "HH:MM" → minutos desde medianoche. null si inválido. */
export function toMinutes(s) {
  if (!s || !/^\d{2}:\d{2}$/.test(s)) return null;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/** Horas entre entrada y salida. Soporta turno nocturno. */
export function calcHoras(entrada, salida) {
  const e = toMinutes(entrada),
    s = toMinutes(salida);
  if (e === null || s === null) return 0;
  let diff = s - e;
  if (diff < 0) diff += 1440; // cruce de medianoche
  return Math.max(0, diff / 60);
}

/** 7.5 → "7h 30m" | 8 → "8h" | 0 → "—" */
export function formatHoras(h) {
  if (!h || h <= 0) return "—";
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
}

/** Fecha legible del día idx según weekStart. */
export function getDayDate(weekStart, idx) {
  if (!weekStart) return "";
  const b = new Date(`${weekStart}T00:00:00`);
  b.setDate(b.getDate() + idx);
  return b.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Lunes de la semana actual en YYYY-MM-DD. */
export function getLunes() {
  const t = new Date(),
    d = t.getDay();
  const diff = d === 0 ? -6 : 1 - d;
  const m = new Date(t);
  m.setDate(t.getDate() + diff);
  return m.toISOString().split("T")[0];
}
