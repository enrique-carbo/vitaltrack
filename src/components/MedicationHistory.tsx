// src/components/MedicationHistory.tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pill,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function MedicationHistory() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener todos los medicamentos
  const medications = useLiveQuery(() => db.medications.toArray(), []);

  // Obtener logs del mes actual
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  const logs = useLiveQuery(async () => {
    return await db.logs
      .where("timestamp")
      .between(startOfMonth.getTime(), endOfMonth.getTime())
      .toArray();
  }, [currentDate]);

  // Calcular estadísticas con valores por defecto
  const calculateStats = () => {
    // Valores por defecto cuando no hay datos
    if (!medications || medications.length === 0) {
      return { adherence: 0, total: 0, taken: 0, days: 0, medsCount: 0 };
    }

    if (!logs) {
      return {
        adherence: 0,
        total: 0,
        taken: 0,
        days: 0,
        medsCount: medications.length,
      };
    }

    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const medsCount = medications.length;
    const totalPossible = daysInMonth * medsCount;
    const totalTaken = logs.length;

    return {
      adherence:
        totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0,
      total: totalTaken,
      taken: totalTaken,
      days: daysInMonth,
      medsCount: medsCount,
    };
  };

  const stats = calculateStats();

  // Navegación entre meses
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // Obtener días del mes
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLogs =
        logs?.filter(
          (log) => format(new Date(log.timestamp), "yyyy-MM-dd") === dateStr,
        ) || [];

      days.push({
        date,
        dateStr,
        day: i,
        logs: dayLogs,
        count: dayLogs.length,
      });
    }

    return days;
  };

  if (medications === undefined || logs === undefined) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-400">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        <span className="ml-2">Cargando historial...</span>
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <Pill className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-500 text-sm">
          No hay medicamentos registrados
        </p>
        <p className="text-slate-400 text-xs mt-1">
          Agrega medicamentos para ver el historial
        </p>
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header con navegación */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-800">Historial</h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-slate-100 rounded transition"
            >
              <ChevronLeft size={18} className="text-slate-500" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-18 text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-slate-100 rounded transition"
            >
              <ChevronRight size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas - AHORA CON VALORES SEGUROS */}
        <div className="flex gap-4 mt-3 pt-2 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-slate-600">
              Adherencia:{" "}
              <strong className="text-slate-800">{stats.adherence}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Pill size={12} className="text-blue-500" />
            <span className="text-slate-600">
              {stats.total} de {stats.days * stats.medsCount} tomas
            </span>
          </div>
        </div>
      </div>

      {/* Grid de días - Solo mostrar si hay días */}
      <div className="p-4">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-slate-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1">
          {/* Espacios en blanco para días anteriores al 1er día */}
          {Array.from({
            length: startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1,
          }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-slate-50 rounded-lg"
            />
          ))}

          {days.map((day) => (
            <div
              key={day.dateStr}
              className={`aspect-square p-1 rounded-lg transition ${
                day.count > 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-slate-50 border border-slate-100"
              }`}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-xs font-medium ${
                    day.count > 0 ? "text-green-700" : "text-slate-500"
                  }`}
                >
                  {day.day}
                </span>
                {day.count > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {day.logs.slice(0, 3).map((log, idx) => {
                      const med = medications.find(
                        (m) => m.id === log.medicationId,
                      );
                      return (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: med?.color || "#3b82f6" }}
                          title={med?.name}
                        />
                      );
                    })}
                    {day.logs.length > 3 && (
                      <span className="text-[8px] text-slate-400">
                        +{day.logs.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="px-4 pb-4 pt-0">
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200" />
            <span>Día con medicamentos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" />
            <span>Sin registros</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Medicamento tomado</span>
          </div>
        </div>
      </div>

      {/* Lista compacta de últimos registros */}
      {logs && logs.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500 mb-2">
            📋 Últimas tomas
          </p>
          <div className="flex flex-wrap gap-2">
            {logs
              .slice(-5)
              .reverse()
              .map((log) => {
                const med = medications.find((m) => m.id === log.medicationId);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded-full shadow-sm"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: med?.color || "#3b82f6" }}
                    />
                    <span className="font-medium text-slate-700">
                      {med?.name || "Medicamento"}
                    </span>
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-slate-500">
                      {format(new Date(log.timestamp), "HH:mm")}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
