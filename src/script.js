const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const TURNOS = ["Mañana", "Siesta", "Tarde"];
const MAX_CAJAS = 6;

let state = {};
let activeDia = 0;

function initState() {
  DIAS.forEach((_, i) => {
    if (state[i]) return;

    state[i] = {
      empleados: [],
      cajas: {
        Mañana: Array(MAX_CAJAS).fill(""),
        Siesta: Array(MAX_CAJAS).fill(""),
        Tarde: Array(MAX_CAJAS).fill(""),
      },
    };
  });
}

function renderTabs() {
  document.getElementById("tabsBar").innerHTML = DIAS.map(
    (d, i) => `
      <button class="tab-btn ${i === activeDia ? "active" : ""}" onclick="switchTab(${i})">
        ${d}
      </button>
    `,
  ).join("");
}

function switchTab(i) {
  activeDia = i;
  renderAll();
}

function renderAll() {
  renderTabs();

  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  DIAS.forEach((dia, i) => {
    const div = document.createElement("div");
    div.className = `day-panel ${i === activeDia ? "active" : ""}`;
    div.innerHTML = `
      <div class="card">
        <div class="card-header">${dia}</div>
        <div class="card-body">
          <button class="add-row-btn" onclick="addEmp(${i})">
            + Agregar empleado
          </button>
        </div>
      </div>
    `;
    main.appendChild(div);
  });
}

function addEmp(di) {
  state[di].empleados.push({ nombre: "", entrada: "", salida: "" });
  renderAll();
}

function exportarDatos() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "planilla.json";
  a.click();
}

document.addEventListener("DOMContentLoaded", () => {
  initState();
  renderAll();
});
