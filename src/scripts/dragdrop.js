import { store, DIAS } from "./store.js";
import { showToast } from "./ui.js";

let dragState = null; // { di, ei, nombre }

/** Inicializa drag en una fila de empleado. */
export function initDragRow(tr, di, ei) {
  tr.draggable = true;

  tr.addEventListener("dragstart", (e) => {
    dragState = {
      di,
      ei,
      nombre: store.getDay(di).empleados[ei]?.nombre ?? "",
    };
    tr.classList.add("opacity-40");
    e.dataTransfer.effectAllowed = "move";
  });

  tr.addEventListener("dragend", () => {
    tr.classList.remove("opacity-40");
    document.querySelectorAll(".drag-over-row").forEach((r) => {
      r.classList.remove("drag-over-row");
      r.style.borderTop = "";
    });
    dragState = null;
  });

  tr.addEventListener("dragover", (e) => {
    e.preventDefault();
    document.querySelectorAll(".drag-over-row").forEach((r) => {
      r.classList.remove("drag-over-row");
      r.style.borderTop = "";
    });
    tr.classList.add("drag-over-row");
    tr.style.borderTop = "2px solid #7c6af7";
  });

  tr.addEventListener("dragleave", () => {
    tr.classList.remove("drag-over-row");
    tr.style.borderTop = "";
  });

  tr.addEventListener("drop", (e) => {
    e.preventDefault();
    tr.style.borderTop = "";
    if (!dragState || dragState.ei === ei) return;
    store.moveEmpleado(dragState.di, dragState.ei, di, ei);
    showToast(`${dragState.nombre} movido`, "success");
    document.dispatchEvent(new CustomEvent("store:changed"));
  });
}

/** Drop zone para el tbody (mover a día vacío). */
export function initDropZone(tbody, di) {
  tbody.addEventListener("dragover", (e) => {
    e.preventDefault();
    tbody.style.outline = "2px dashed #7c6af7";
  });
  tbody.addEventListener("dragleave", () => {
    tbody.style.outline = "";
  });
  tbody.addEventListener("drop", (e) => {
    e.preventDefault();
    tbody.style.outline = "";
    if (!dragState) return;
    const targetIdx = store.getDay(di).empleados.length;
    store.moveEmpleado(dragState.di, dragState.ei, di, targetIdx);
    showToast(`${dragState.nombre} movido a ${DIAS[di]}`, "success");
    document.dispatchEvent(new CustomEvent("store:changed"));
  });
}
