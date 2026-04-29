import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Localización española
import { getVariableById } from "@/config/variables";
import { ArrowRight, Calendar } from "lucide-react";

export default function DashboardList() {
  // Consulta reactiva: Obtiene los últimos 10 registros ordenados por fecha
  // Se actualiza automáticamente si la DB cambia
  const measurements = useLiveQuery(
    () => db.measurements.orderBy("timestamp").reverse().limit(10).toArray(),
    [],
  );

  if (!measurements || measurements.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">No hay registros aún.</p>
        <a
          href="/diario"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 font-semibold hover:underline"
        >
          Realizar primer registro <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Actividad Reciente</h2>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
          Live DB
        </span>
      </div>

      <div>
        {/* Versión Desktop - Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Variable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {measurements.map((m) => {
                const config = getVariableById(m.variableId);
                let displayValue = "";
                if (typeof m.value === "number") {
                  displayValue = `${m.value} ${config?.unit || ""}`;
                } else {
                  displayValue = Object.entries(m.value)
                    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                    .join(" / ");
                }
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(m.timestamp), "dd MMM, HH:mm", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {config?.label || m.variableId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                      {displayValue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Versión Móvil - Tarjetas */}
        <div className="md:hidden space-y-3">
          {measurements.map((m) => {
            const config = getVariableById(m.variableId);
            let displayValue = "";
            if (typeof m.value === "number") {
              displayValue = `${m.value} ${config?.unit || ""}`;
            } else {
              displayValue = Object.entries(m.value)
                .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                .join(" / ");
            }
            return (
              <div
                key={m.id}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400">
                    {format(new Date(m.timestamp), "EEEE dd MMM", {
                      locale: es,
                    })}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {format(new Date(m.timestamp), "HH:mm", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {config?.label || m.variableId}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-800">
                      {displayValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-6">
        <a
          href="/reporte"
          className="text-sm text-slate-500 hover:text-blue-600"
        >
          Ver historial completo &rarr;
        </a>
      </div>
    </div>
  );
}
