import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
// Asegúrate de tener esta utilidad en src/utils/date.ts
import { getStartOfToday } from "@/utils/date";
import { Pill, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";

export default function MedicationLog() {
  // 1. Traer todos los medicamentos configurados
  const medications = useLiveQuery(() => db.medications.toArray());

  // 2. Traer los logs de HOY
  // Filtramos por timestamp >= Inicio del día de hoy
  const logs = useLiveQuery(
    () => db.logs.where("timestamp").aboveOrEqual(getStartOfToday()).toArray(),
    [], // Valor inicial vacío
  );

  // --- ESTADOS DE CARGA ---

  // Si la BD está cargando medications
  if (medications === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={32} />
        <p>Cargando registro...</p>
      </div>
    );
  }

  // Si no hay medicamentos configurados
  if (medications.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <p className="text-slate-500 italic">
          No hay medicamentos configurados para hoy.
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Agrega uno en el formulario superior.
        </p>
      </div>
    );
  }

  // Crear un mapa rápido de búsqueda: { medicationId: boolean }
  // Usamos un Set para IDs de tomados para acceso O(1)
  const takenIds = new Set<number>();

  if (logs) {
    logs.forEach((log) => {
      // Aseguramos que el ID sea número para comparar
      if (log.medicationId && log.taken) {
        takenIds.add(Number(log.medicationId));
      }
    });
  }

  const handleToggle = async (medId: number) => {
    const isTaken = takenIds.has(medId);

    if (isTaken) {
      // Si ya está tomado, buscamos el log específico para eliminarlo
      // Nota: En una app real podríamos querer guardar un historial,
      // pero aquí asumimos "desmarcar" como borrar el log del día.
      const logToDelete = logs?.find((l) => l.medicationId === medId);
      if (logToDelete?.id) {
        await db.logs.delete(logToDelete.id);
      }
    } else {
      // Si no está tomado, creamos el log
      await db.logs.add({
        medicationId: medId,
        timestamp: Date.now(),
        taken: true,
        skipped: false,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {medications.map((med) => {
        const isTaken = takenIds.has(Number(med.id));

        return (
          <div
            key={med.id}
            className={`group relative p-4 rounded-xl border transition-all duration-300 ${
              isTaken
                ? "bg-green-50 border-green-200 shadow-sm"
                : "bg-white border-slate-200 hover:shadow-md hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {/* Icono pastilla con color dinámico */}
                <div
                  className="p-2 rounded-full text-white mt-1 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: med.color }}
                >
                  <Pill size={18} />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">
                    {med.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span>{med.dosage}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-medium text-slate-700">
                      {med.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de acción (Marcar/Desmarcar) */}
              <button
                onClick={() => handleToggle(Number(med.id))}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isTaken
                    ? "text-green-600 hover:bg-green-200"
                    : "text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
                aria-label={
                  isTaken ? "Marcar como no tomado" : "Marcar como tomado"
                }
              >
                {isTaken ? <CheckCircle2 size={28} /> : <Circle size={28} />}
              </button>
            </div>

            {/* Feedback de "Tomado hoy" */}
            {isTaken && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-green-700 ml-11 animate-in fade-in slide-in-from-bottom-1">
                <Clock size={12} className="fill-current" />
                <span>Completado</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
