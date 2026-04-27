import { store, DIAS, SECTORES } from "./store.js";
import { horasSemanales, allEmpleados } from "./estadisticas.js";
import { formatHoras } from "./tiempo.js";

export function exportarPDF() {
  window.print();
}

export function exportarJSON() {
  const data = store.getAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `atomo_planilla_${data.weekStart || "semana"}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function compartirWhatsApp() {
  const state = store.getAll();
  let txt = `📋 *PLANILLA SEMANAL – ÁTOMO*\n📅 Semana del ${store.getWeekStart() || "—"}\n\n`;

  DIAS.forEach((dia, i) => {
    const d = state[i];
    const act = d.empleados.filter((e) => !e.libre && e.entrada);
    const fr = d.empleados.filter((e) => e.libre);
    txt += `*${dia.toUpperCase()}*\n`;
    if (act.length) {
      txt += `  🕐 *Cajas:*\n`;
      act.forEach((e) => {
        txt += `    • ${e.nombre}: ${e.entrada}–${e.salida}\n`;
      });
    }
    if (fr.length)
      txt += `  🔵 Franco cajas: ${fr.map((e) => e.nombre).join(", ")}\n`;

    SECTORES.forEach((s) => {
      const se = d.sectores?.[s.id]?.empleados ?? [];
      const sa = se.filter((e) => !e.libre && e.entrada);
      const sf = se.filter((e) => e.libre);
      if (sa.length) {
        txt += `  ${s.icon} *${s.label}:*\n`;
        sa.forEach((e) => {
          txt += `    • ${e.nombre}: ${e.entrada}–${e.salida}\n`;
        });
      }
      if (sf.length)
        txt += `  🔵 Franco ${s.label}: ${sf.map((e) => e.nombre).join(", ")}\n`;
    });
    txt += "\n";
  });

  txt += `*HORAS SEMANALES*\n`;
  allEmpleados(null).forEach((n) => {
    const hs = horasSemanales(n);
    if (hs > 0)
      txt += `  ${hs > 40 ? "🔴" : hs < 40 ? "🟡" : "🟢"} ${n} (Cajas): ${formatHoras(hs)}\n`;
  });
  SECTORES.forEach((s) => {
    allEmpleados(s.id).forEach((n) => {
      const hs = horasSemanales(n, s.id);
      if (hs > 0)
        txt += `  ${hs > 40 ? "🔴" : hs < 40 ? "🟡" : "🟢"} ${n} (${s.label}): ${formatHoras(hs)}\n`;
    });
  });

  window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
}
