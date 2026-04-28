// src/components/PrintAdherenceReport.tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Printer, TrendingUp } from "lucide-react";

// Definir tipos
interface DayStat {
  day: string;
  count: number;
}

interface MedicationStat {
  id?: number;
  name: string;
  dosage: string;
  time: string;
  color: string;
  taken: number;
  expected: number;
  adherence: number;
  missed: number;
  status: string;
  statusClass: string;
}

interface OverallStats {
  totalExpected: number;
  totalTaken: number;
  overallAdherence: number;
  bestDay: DayStat | null;
  worstDay: DayStat | null;
  daysInMonth: number;
}

export default function PrintAdherenceReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const startOfMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  );

  // Obtener datos
  const medications = useLiveQuery(() => db.medications.toArray(), []);

  const logs = useLiveQuery(async () => {
    return await db.logs
      .where("timestamp")
      .between(startOfMonth.getTime(), endOfMonth.getTime())
      .toArray();
  }, [selectedMonth]);

  // Calcular estadísticas por medicamento
  const getMedicationStats = (): MedicationStat[] => {
    if (!medications || !logs) return [];

    const daysInMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    ).getDate();

    return medications.map((med) => {
      const medLogs = logs.filter((log) => log.medicationId === med.id);
      const taken = medLogs.length;
      const expected = daysInMonth;
      const adherence = expected > 0 ? Math.round((taken / expected) * 100) : 0;

      let status = "Óptimo";
      let statusClass = "status-optimal";
      if (adherence < 50) {
        status = "Crítico";
        statusClass = "status-critical";
      } else if (adherence < 80) {
        status = "Regular";
        statusClass = "status-regular";
      }

      return {
        ...med,
        taken,
        expected,
        adherence,
        missed: expected - taken,
        status,
        statusClass,
      };
    });
  };

  // Calcular estadísticas generales
  const getOverallStats = (): OverallStats => {
    if (!medications || !logs) {
      return {
        totalExpected: 0,
        totalTaken: 0,
        overallAdherence: 0,
        bestDay: null,
        worstDay: null,
        daysInMonth: 0,
      };
    }

    const daysInMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    ).getDate();
    const totalExpected = medications.length * daysInMonth;
    const totalTaken = logs.length;
    const overallAdherence =
      totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

    // Mejor y peor día - con tipos explícitos
    const dailyCount = new Map<string, number>();
    logs.forEach((log) => {
      const day = format(new Date(log.timestamp), "yyyy-MM-dd");
      dailyCount.set(day, (dailyCount.get(day) || 0) + 1);
    });

    let bestDay: DayStat | null = null;
    let worstDay: DayStat | null = null;

    dailyCount.forEach((count, day) => {
      if (!bestDay || count > bestDay.count) {
        bestDay = { day, count };
      }
      if (!worstDay || count < worstDay.count) {
        worstDay = { day, count };
      }
    });

    return {
      totalExpected,
      totalTaken,
      overallAdherence,
      bestDay,
      worstDay,
      daysInMonth,
    };
  };

  const medicationStats = getMedicationStats();
  const overallStats = getOverallStats();

  // Navegación
  const prevMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1),
    );
  };

  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  if (medications === undefined || logs === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No hay medicamentos registrados</p>
        <p className="text-sm text-gray-400 mt-2">
          Agrega medicamentos para ver el reporte de adherencia
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Controles de navegación - no se imprimen */}
      <div className="max-w-5xl mx-auto p-6 md:p-8 no-print">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-blue-900 font-bold">
              Reporte de Adherencia al Tratamiento
            </h2>
            <p className="text-blue-700 text-sm">
              Control mensual de cumplimiento de medicamentos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de mes */}
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
              <button
                onClick={prevMonth}
                className="px-2 py-1 hover:bg-slate-100 rounded"
              >
                ←
              </button>
              <span className="font-medium text-sm min-w-25 text-center">
                {format(selectedMonth, "MMMM yyyy", { locale: es })}
              </span>
              <button
                onClick={nextMonth}
                className="px-2 py-1 hover:bg-slate-100 rounded"
              >
                →
              </button>
            </div>

            {/* Botón imprimir */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              <Printer size={18} />
              <span className="hidden md:inline">Imprimir Reporte</span>
              <span className="md:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del reporte - esto se imprime */}
      <div className="max-w-5xl mx-auto p-0 md:p-8 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* Header del Documento */}
        <div className="print-header p-6 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight">
                Reporte de Adherencia
              </h1>
              <p className="text-gray-600 mt-1">
                VitalTrack - Control de Medicamentos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Periodo:</p>
              <p className="text-sm text-gray-600 font-mono">
                {format(selectedMonth, "MMMM yyyy", {
                  locale: es,
                }).toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 font-mono mt-2">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tarjetas de estadísticas generales */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value adherence-general">
                {overallStats.overallAdherence}%
              </div>
              <div className="stat-label">Adherencia General</div>
            </div>
            <div className="stat-card">
              <div className="stat-value adherence-taken">
                {overallStats.totalTaken}
              </div>
              <div className="stat-label">Tomas Realizadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value adherence-missed">
                {overallStats.totalExpected - overallStats.totalTaken}
              </div>
              <div className="stat-label">Tomas Omitidas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value adherence-meds">
                {medications.length}
              </div>
              <div className="stat-label">Medicamentos Activos</div>
            </div>
          </div>

          {/* Tabla de medicamentos */}
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Detalle por Medicamento
          </h3>
          <table className="adherence-table">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Horario</th>
                <th>Tomas</th>
                <th>Adherencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {medicationStats.map((med) => (
                <tr key={med.id}>
                  <td className="med-name-cell">
                    <div
                      className="med-color-dot"
                      style={{ backgroundColor: med.color }}
                    />
                    {med.name}
                  </td>
                  <td>{med.dosage}</td>
                  <td className="text-center">{med.time}</td>
                  <td className="text-center">
                    {med.taken} / {med.expected}
                  </td>
                  <td className="adherence-cell">
                    <div className="bar-container">
                      <div
                        className={`bar-fill ${med.adherence >= 80 ? "bar-high" : med.adherence >= 50 ? "bar-medium" : "bar-low"}`}
                        style={{ width: `${med.adherence}%` }}
                      />
                    </div>
                    <span className="adherence-percent">{med.adherence}%</span>
                  </td>
                  <td className={`status-cell ${med.statusClass}`}>
                    {med.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Resumen de mejores/peores días - con verificación segura */}
          <div className="summary-box">
            {overallStats.bestDay && (
              <div className="summary-item">
                <TrendingUp size={16} className="text-green-500" />
                <span className="summary-label">Mejor día:</span>
                <span className="summary-value">
                  {overallStats.bestDay.day}
                </span>
                <span className="summary-count">
                  ({overallStats.bestDay.count} tomas)
                </span>
              </div>
            )}
            {overallStats.worstDay &&
              overallStats.worstDay.count !== overallStats.bestDay?.count && (
                <div className="summary-item">
                  <span className="summary-label">Día con menos tomas:</span>
                  <span className="summary-value">
                    {overallStats.worstDay.day}
                  </span>
                  <span className="summary-count">
                    ({overallStats.worstDay.count} tomas)
                  </span>
                </div>
              )}
          </div>

          {/* Leyenda */}
          <div className="adherence-legend">
            <div className="legend-item">
              <div className="legend-color legend-optimal" />
              <span>Óptimo (≥80%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-regular" />
              <span>Regular (50-79%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-critical" />
              <span>Crítico (&lt;50%)</span>
            </div>
          </div>
        </div>

        {/* Footer del Documento */}
        <div className="print-footer p-6 text-center border-t border-gray-200 mt-4 text-xs text-gray-500">
          <p>
            Este documento ha sido generado por VitalTrack - Reporte de
            Adherencia al Tratamiento. Los datos provienen del almacenamiento
            local del dispositivo.
          </p>
          <p className="mt-1">
            Solo para uso informativo. No sustituye la opinión médica
            profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
