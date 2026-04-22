import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { getVariableById } from "@/config/variables";
import { formatTimestamp } from "@/utils/date";

export default function PrintReportData() {
  // Traer todas las mediciones
  const allRecords = useLiveQuery(
    () => db.measurements.orderBy("timestamp").reverse().toArray(),
    [],
  );

  if (!allRecords)
    return <p className="text-gray-500 italic">Cargando datos...</p>;

  return (
    <table className="print-table">
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Variable</th>
          <th>Valor Registrado</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
        {allRecords.map((record) => {
          const config = getVariableById(record.variableId);

          let displayValue = "";
          if (typeof record.value === "number") {
            displayValue = `${record.value} ${config?.unit || ""}`;
          } else {
            // Caso compuesto (Presión Arterial)
            displayValue = Object.entries(record.value)
              .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
              .join(" / ");
          }

          return (
            <tr key={record.id}>
              <td className="font-mono text-xs">
                {formatTimestamp(record.timestamp)}
              </td>
              <td className="font-semibold text-gray-700">
                {config?.label || record.variableId}
              </td>
              <td className="font-bold text-black">{displayValue}</td>
              <td className="text-gray-600 text-xs italic">
                {record.notes || "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
