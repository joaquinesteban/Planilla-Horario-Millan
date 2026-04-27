import { store, DIAS, SECTORES } from "./store.js";
import { calcHoras, formatHoras } from "./tiempo.js";
import { claseHoras } from "./colores.js";

const LIMITE_HS = 40;

/** Todos los nombres únicos de un sector. sid=null → cajas. */
export function allEmpleados(sid = null) {
  return [
    ...new Set(
      DIAS.flatMap((_, i) => {
        const day = store.getDay(i);
        const arr = sid ? (day.sectores[sid]?.empleados ?? []) : day.empleados;
        return arr.map((e) => e.nombre).filter(Boolean);
      }),
    ),
  ];
}

/** Horas totales de un empleado en la semana. */
export function horasSemanales(nombre, sid = null) {
  return DIAS.reduce((acc, _, i) => {
    const day = store.getDay(i);
    const emps = sid ? (day.sectores[sid]?.empleados ?? []) : day.empleados;
    const emp = emps.find((e) => e.nombre === nombre);
    return acc + (emp && !emp.libre ? calcHoras(emp.entrada, emp.salida) : 0);
  }, 0);
}

/** Días con horario completo de un empleado. */
export function diasTrabajados(nombre, sid = null) {
  return DIAS.reduce((acc, _, i) => {
    const day = store.getDay(i);
    const emps = sid ? (day.sectores[sid]?.empleados ?? []) : day.empleados;
    const emp = emps.find((e) => e.nombre === nombre);
    return acc + (emp && !emp.libre && emp.entrada && emp.salida ? 1 : 0);
  }, 0);
}

/** Stats completas por empleado (ordenadas por horas desc). */
export function statsEmpleados(sid = null) {
  return allEmpleados(sid)
    .map((nombre) => {
      const hs = horasSemanales(nombre, sid);
      const dias = diasTrabajados(nombre, sid);
      return {
        nombre,
        horasTotales: hs,
        horasFormato: formatHoras(hs),
        diasTrabajados: dias,
        claseHs: claseHoras(hs),
        promDiario: dias > 0 ? formatHoras(hs / dias) : "—",
      };
    })
    .sort((a, b) => b.horasTotales - a.horasTotales);
}

/** Alertas automáticas para todos los sectores. */
export function generarAlertas() {
  const alertas = [];

  // Cajas
  allEmpleados(null).forEach((n) => {
    const hs = horasSemanales(n);
    if (hs > LIMITE_HS)
      alertas.push({
        tipo: "red",
        icon: "🔴",
        ttl: `${n} supera las ${LIMITE_HS}hs`,
        msg: `Lleva ${formatHoras(hs)} — exceso de ${formatHoras(hs - LIMITE_HS)}.`,
      });
    else if (hs > 0 && hs < LIMITE_HS)
      alertas.push({
        tipo: "amb",
        icon: "🟡",
        ttl: `${n} tiene menos de ${LIMITE_HS}hs`,
        msg: `Lleva ${formatHoras(hs)} — faltan ${formatHoras(LIMITE_HS - hs)}.`,
      });
  });

  // Otros sectores
  SECTORES.forEach((s) => {
    allEmpleados(s.id).forEach((n) => {
      const hs = horasSemanales(n, s.id);
      if (hs > LIMITE_HS)
        alertas.push({
          tipo: "red",
          icon: "🔴",
          ttl: `${n} (${s.label}) supera las ${LIMITE_HS}hs`,
          msg: `Lleva ${formatHoras(hs)}.`,
        });
    });
  });

  // Turnos sin cajero
  DIAS.forEach((dia, di) => {
    const cajas = store.getDay(di).cajas;
    ["Mañana", "Siesta", "Tarde"].forEach((turno) => {
      if (!cajas[turno]?.some((v) => v.trim()))
        alertas.push({
          tipo: "amb",
          icon: "⚠️",
          ttl: `Sin cajero – ${dia} / ${turno}`,
          msg: `No hay cajero asignado para este turno.`,
        });
    });
  });

  if (alertas.length === 0)
    alertas.push({
      tipo: "grn",
      icon: "✅",
      ttl: "Todo en orden",
      msg: "No hay alertas críticas esta semana.",
    });

  return alertas;
}
