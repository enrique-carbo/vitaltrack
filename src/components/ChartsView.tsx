import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { CLINICAL_VARIABLES } from "@/config/variables";
import { formatTimestamp } from "@/utils/date";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MAX_RECORDS = 20; // Límite fijo de registros para el gráfico

export default function ChartsView() {
  const [selectedVarId, setSelectedVarId] = useState(CLINICAL_VARIABLES[0].id);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Obtener solo los últimos MAX_RECORDS registros
  const records = useLiveQuery(async () => {
    const results = await db.measurements
      .where("variableId")
      .equals(selectedVarId)
      .reverse() // Más recientes primero
      .limit(MAX_RECORDS)
      .toArray();
    return results.reverse(); // Volver a orden cronológico (de más antiguo a más reciente)
  }, [selectedVarId]);

  const currentConfig = CLINICAL_VARIABLES.find((v) => v.id === selectedVarId);

  const chartData =
    records?.map((r) => {
      const point: any = {
        name: formatTimestamp(r.timestamp),
        fullDate: formatTimestamp(r.timestamp),
      };

      // 🔥 CORREGIDO: range ahora funciona igual que number
      if (typeof r.value === "number") {
        point[currentConfig?.label || "Valor"] = r.value;
      } else if (currentConfig?.subFields) {
        currentConfig.subFields.forEach((sub) => {
          point[sub.label] = (r.value as Record<string, number>)[sub.key];
        });
      }
      return point;
    }) || [];

  const colors = ["#2563eb", "#dc2626", "#16a34a", "#d97706"];

  // 🔥 CORREGIDO: Filtrar variables que tienen datos numéricos (number o range)
  const chartableVariables = CLINICAL_VARIABLES.filter(
    (v) =>
      v.inputType === "number" ||
      v.inputType === "range" ||
      v.inputType === "composite",
  );

  return (
    <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Tendencias</h2>

        <select
          value={selectedVarId}
          onChange={(e) => setSelectedVarId(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5"
        >
          {chartableVariables.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} {v.inputType === "range"}
            </option>
          ))}
        </select>
      </div>

      {/* Contenedor del gráfico */}
      <div className="w-full h-80 relative">
        {isMounted && isReady && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />

              {/* 🔥 CORREGIDO: range se trata como number */}
              {currentConfig?.inputType === "number" ||
              currentConfig?.inputType === "range" ? (
                <Line
                  type="monotone"
                  dataKey={currentConfig.label}
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ) : currentConfig?.inputType === "composite" &&
                currentConfig?.subFields ? (
                currentConfig.subFields.map((sub, index) => (
                  <Line
                    key={sub.key}
                    type="monotone"
                    dataKey={sub.label}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={`${currentConfig.label} - ${sub.label}`}
                  />
                ))
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>
              {!isMounted || !isReady
                ? "Cargando gráfico..."
                : chartData.length === 0
                  ? `No hay datos para ${currentConfig?.label}`
                  : "Preparando visualización..."}
            </p>
          </div>
        )}
      </div>

      {/* Info opcional: mostrar cuántos registros se están mostrando */}
      {records && records.length > 0 && (
        <div className="mt-3 text-center text-xs text-slate-400">
          Mostrando últimos {records.length} registros
        </div>
      )}
    </div>
  );
}
