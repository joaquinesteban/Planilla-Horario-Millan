import { SECTORES } from "./store.js";
import { horasSemanales, allEmpleados } from "./estadisticas.js";
import { formatHoras } from "./tiempo.js";
import { claseHoras } from "./colores.js";

export async function getSugerenciasIA(apiKey) {
  const lines = [
    ...allEmpleados(null).map(
      (n) =>
        `- ${n} (Cajas): ${formatHoras(horasSemanales(n))} [${claseHoras(horasSemanales(n)) || "sin datos"}]`,
    ),
    ...SECTORES.flatMap((s) =>
      allEmpleados(s.id).map(
        (n) =>
          `- ${n} (${s.label}): ${formatHoras(horasSemanales(n, s.id))} [${claseHoras(horasSemanales(n, s.id)) || "sin datos"}]`,
      ),
    ),
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `Sos asistente de RRHH de un supermercado argentino con múltiples sectores.
Respondé SOLO con JSON válido, sin texto extra ni backticks:
{"sugerencias":[{"tipo":"critica|atencion|positiva","titulo":"...","detalle":"..."}],"resumen_ejecutivo":"..."}`,
      messages: [
        { role: "user", content: `Analizá la planilla semanal:\n${lines}` },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Error ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.find((b) => b.type === "text")?.text ?? "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
