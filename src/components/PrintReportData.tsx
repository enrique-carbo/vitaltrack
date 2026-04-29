// src/components/PrintReportData.tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import {
  getVariableById,
  getCategoryLabel,
  getUniqueCategories,
  CATEGORIES,
} from "@/config/variables";
import { formatTimestamp } from "@/utils/date";
import { useState } from "react";

export default function PrintReportData() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allRecords = useLiveQuery(
    () => db.measurements.orderBy("timestamp").reverse().toArray(),
    [],
  );

  // Obtener categorías automáticamente desde la configuración
  const categories = [
    { id: "all", label: "📊 Todas las categorías" },
    ...getUniqueCategories().map((cat) => ({
      id: cat.id,
      label: `${cat.emoji} ${cat.label}`,
    })),
  ];

  // Filtrar registros por categoría seleccionada
  const filteredRecords = allRecords?.filter((record) => {
    if (selectedCategory === "all") return true;
    const config = getVariableById(record.variableId);
    return config?.category === selectedCategory;
  });

  // Agrupar por categoría si se muestran todas
  const getGroupedRecords = () => {
    if (selectedCategory !== "all") return null;

    const grouped: Record<string, typeof allRecords> = {};
    allRecords?.forEach((record) => {
      const config = getVariableById(record.variableId);
      const category = config?.category || "unknown";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(record);
    });
    return grouped;
  };

  const groupedRecords = getGroupedRecords();

  if (!allRecords)
    return <p className="text-gray-500 italic">Cargando datos...</p>;

  return (
    <div>
      {/* Selector de categoría - se oculta al imprimir */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg no-print">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por categoría:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        <div className="mt-3 text-sm text-gray-600">
          Mostrando: <strong>{filteredRecords?.length || 0}</strong> registros
          {selectedCategory !== "all" &&
            filteredRecords &&
            filteredRecords.length > 0 && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="ml-3 text-blue-600 hover:text-blue-800 underline"
              >
                Ver todos
              </button>
            )}
        </div>
      </div>

      {/* Vista de categoría individual */}
      {selectedCategory !== "all" && (
        <>
          {filteredRecords && filteredRecords.length > 0 ? (
            <table className="print-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Variable</th>
                  <th>Registro</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const config = getVariableById(record.variableId);
                  let displayValue = "";
                  if (typeof record.value === "number") {
                    displayValue = `${record.value} ${config?.unit || ""}`;
                  } else {
                    displayValue = Object.entries(record.value)
                      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                      .join(" / ");
                  }
                  return (
                    <tr key={record.id}>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-xs">
                        {formatTimestamp(record.timestamp)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">
                        {config?.label || record.variableId}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 font-bold text-black text-right">
                        {displayValue}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-gray-600 text-xs italic">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No hay registros en esta categoría.
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-4 text-blue-600 hover:text-blue-800 underline no-print"
              >
                Ver todas las categorías
              </button>
            </div>
          )}
        </>
      )}

      {/* Vista agrupada por categorías (cuando se muestra "Todas") */}
      {selectedCategory === "all" && groupedRecords && (
        <>
          {Object.entries(groupedRecords).map(([category, records]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
                {getCategoryLabel(category)}
              </h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Variable</th>
                    <th>Registro</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {(records || []).map((record) => {
                    const config = getVariableById(record.variableId);
                    let displayValue = "";

                    if (typeof record.value === "number") {
                      displayValue = `${record.value} ${config?.unit || ""}`;
                    } else if (
                      record.value &&
                      typeof record.value === "object"
                    ) {
                      displayValue = Object.entries(record.value)
                        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                        .join(" / ");
                    } else {
                      displayValue = "-";
                    }

                    return (
                      <tr key={record.id}>
                        <td className="border border-gray-200 px-4 py-2 font-mono text-xs">
                          {formatTimestamp(record.timestamp)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 font-semibold text-gray-700">
                          {config?.label || record.variableId}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 font-bold text-black text-right">
                          {displayValue}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600 text-xs italic">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {filteredRecords && filteredRecords.length > 0 && (
        <div className="mt-4 text-xs text-gray-400 text-center print-footer">
          Total de registros mostrados: {filteredRecords.length}
        </div>
      )}
    </div>
  );
}
