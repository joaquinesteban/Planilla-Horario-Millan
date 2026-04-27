// src/scripts/store.js
// Estado global con localStorage.
// ─────────────────────────────────────────────────────────────────────────────
// LISTO PARA BASE DE DATOS:
// Cuando agregues DB (Supabase, Firebase, etc.) solo cambiás _load() y _save()
// para que llamen a tu API. El resto de la app no toca nada.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "atomo_v3";

export const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const TURNOS = ["Mañana", "Siesta", "Tarde"];

export const MAX_CAJAS = 6;

export const SECTORES = [
  {
    id: "qiaro",
    label: "Qiaro (Textil)",
    icon: "👕",
    color: "pink",
    empDef: ["Agustina", "Bruno"],
  },
  {
    id: "lacteos",
    label: "Lácteos / Fiambrería",
    icon: "🧀",
    color: "cyn",
    empDef: ["Romina", "Diego"],
  },
  {
    id: "carnice",
    label: "Carnicería",
    icon: "🥩",
    color: "red",
    empDef: ["Marcos", "Silvana"],
  },
  {
    id: "deposito",
    label: "Depósito",
    icon: "📦",
    color: "lim",
    empDef: ["Ramiro", "Claudia"],
  },
];

const EMP_DEFAULT = [
  "Luca",
  "Etel",
  "Oriana",
  "Martina",
  "Paula",
  "Fernando",
  "Fiorella",
  "Hernán",
  "Isabela",
  "Germán",
];

// ── Helpers internos ──────────────────────────────────────────────────────────

function getLunes() {
  const t = new Date(),
    d = t.getDay();
  const diff = d === 0 ? -6 : 1 - d;
  const m = new Date(t);
  m.setDate(t.getDate() + diff);
  return m.toISOString().split("T")[0];
}

function emptyDay() {
  return {
    empleados: EMP_DEFAULT.map((n) => ({
      nombre: n,
      entrada: "",
      salida: "",
      libre: false,
    })),
    cajas: Object.fromEntries(
      TURNOS.map((t) => [t, Array(MAX_CAJAS).fill("")]),
    ),
    sectores: Object.fromEntries(
      SECTORES.map((s) => [
        s.id,
        {
          empleados: s.empDef.map((n) => ({
            nombre: n,
            entrada: "",
            salida: "",
            libre: false,
          })),
        },
      ]),
    ),
  };
}

// ── Persistencia (acá swappeás por tu DB) ────────────────────────────────────

function _load() {
  // 🔄 DB SWAP → reemplazá con: return await fetch('/api/semana').then(r => r.json())
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _save(state) {
  // 🔄 DB SWAP → reemplazá con: fetch('/api/semana', { method: 'PUT', body: JSON.stringify(state) })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

// ── Store singleton ───────────────────────────────────────────────────────────

function createStore() {
  let _state = _load() ?? { weekStart: getLunes() };

  // Garantizar los 7 días y sectores
  for (let i = 0; i < 7; i++) {
    if (!_state[i]) _state[i] = emptyDay();
    if (!_state[i].sectores) _state[i].sectores = emptyDay().sectores;
  }

  const save = () => _save(_state);

  return {
    // Lectura
    getDay: (i) => _state[i],
    getAll: () => _state,
    getWeekStart: () => _state.weekStart,

    // Semana
    setWeekStart(v) {
      _state.weekStart = v;
      save();
    },

    // Empleados (cajas)
    setEmpleado(di, ei, field, val) {
      _state[di].empleados[ei][field] = val;
      save();
    },
    addEmpleado(di) {
      _state[di].empleados.push({
        nombre: "",
        entrada: "",
        salida: "",
        libre: false,
      });
      save();
    },
    removeEmpleado(di, ei) {
      _state[di].empleados.splice(ei, 1);
      save();
    },
    moveEmpleado(fd, fe, td, te) {
      const emp = { ..._state[fd].empleados[fe] };
      _state[fd].empleados.splice(fe, 1);
      _state[td].empleados.splice(te, 0, emp);
      save();
    },

    // Cajas
    setCaja(di, turno, ci, val) {
      _state[di].cajas[turno][ci] = val;
      save();
    },

    // Sectores
    setSectorEmpleado(di, sid, ei, field, val) {
      _state[di].sectores[sid].empleados[ei][field] = val;
      save();
    },
    addSectorEmpleado(di, sid) {
      _state[di].sectores[sid].empleados.push({
        nombre: "",
        entrada: "",
        salida: "",
        libre: false,
      });
      save();
    },
    removeSectorEmpleado(di, sid, ei) {
      _state[di].sectores[sid].empleados.splice(ei, 1);
      save();
    },

    // Reset
    reset() {
      _state = { weekStart: getLunes() };
      for (let i = 0; i < 7; i++) _state[i] = emptyDay();
      save();
    },
  };
}

export const store = createStore();
