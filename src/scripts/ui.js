import { store, DIAS, SECTORES } from "./store.js";
import { horasSemanales, diasTrabajados } from "./estadisticas.js";
import { calcHoras, formatHoras } from "./tiempo.js";
import { claseHoras } from "./colores.js";

// ── Toast ─────────────────────────────────────────────────────────────────────

export function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2";
    document.body.appendChild(container);
  }

  const colors = {
    success: "border-l-grn",
    warning: "border-l-amb",
    error: "border-l-red",
  };
  const icons = { success: "✔", warning: "⚠️", error: "✖" };

  const t = document.createElement("div");
  t.className = `flex items-center gap-2 bg-bg3 border border-border2 border-l-4
                 ${colors[type]} rounded-lg px-4 py-2.5 text-xs text-tx1 shadow-xl`;
  t.style.animation = "slideIn .2s ease";
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity .3s";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ── Modal empleado ────────────────────────────────────────────────────────────

export function openEmpleadoModal(nombre, sid = null) {
  const state = store.getAll();
  const hs = horasSemanales(nombre, sid);
  const dias = diasTrabajados(nombre, sid);
  const sector = sid ? SECTORES.find((s) => s.id === sid) : null;
  const cls = claseHoras(hs);

  const labels = {
    "hs-ok": "✅ Completó las 40hs",
    "hs-low": "🟡 Faltan horas para las 40hs",
    "hs-over": "🔴 Supera las 40hs",
  };

  const $ = (id) => document.getElementById(id);
  $("m-name").textContent = nombre;
  $("m-sub").textContent =
    `${sector ? sector.label + " · " : "Cajas · "}Semana del ${store.getWeekStart()}`;
  $("m-hs").textContent = formatHoras(hs) || "—";
  $("m-dias").textContent = String(dias || "—");
  $("m-prom").textContent = dias ? formatHoras(hs / dias) : "—";
  $("m-pill").innerHTML = cls
    ? `<span class="hs-pill ${cls}">${labels[cls]}</span>`
    : "";

  $("m-tbody").innerHTML = DIAS.map((dia, i) => {
    const emps = sid
      ? (state[i].sectores[sid]?.empleados ?? [])
      : state[i].empleados;
    const emp = emps.find((e) => e.nombre === nombre);

    if (!emp)
      return `<tr><td class="py-2 pr-3 font-medium text-sm">${dia}</td><td colspan="3" class="text-tx3 text-center text-xs">—</td></tr>`;
    if (emp.libre)
      return `<tr><td class="py-2 pr-3 font-medium text-sm">${dia}</td><td colspan="3" class="text-center"><span class="pill-free">🔵 Franco</span></td></tr>`;
    if (!emp.entrada)
      return `<tr><td class="py-2 pr-3 font-medium text-sm">${dia}</td><td colspan="3" class="text-tx3 text-center text-xs">Sin horario</td></tr>`;

    const h = calcHoras(emp.entrada, emp.salida);
    return `<tr class="border-b border-border1/30 last:border-0">
      <td class="py-2 pr-3 font-medium text-sm">${dia}</td>
      <td class="text-tx2 text-xs text-center">${emp.entrada}</td>
      <td class="text-tx2 text-xs text-center">${emp.salida}</td>
      <td class="text-center"><span class="hs-pill ${h > 9 ? "hs-over" : ""}">${formatHoras(h)}</span></td>
    </tr>`;
  }).join("");

  document.getElementById("modal-overlay").classList.add("open");
}

export function closeModal() {
  document.getElementById("modal-overlay")?.classList.remove("open");
}
