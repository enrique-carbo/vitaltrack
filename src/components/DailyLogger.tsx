import { useState, useEffect } from "react";
import { db } from "@/db/db";
import { CLINICAL_VARIABLES } from "@/config/variables";
import { Toast } from "@/components/ui/Toast";
import {
  Plus,
  Activity,
  Droplets,
  HeartPulse,
  Weight,
  CheckCircle2,
} from "lucide-react";
import {
  toLocalISODate,
  getCurrentLocalTime,
  localDateTimeToTimestamp,
} from "@/utils/date";

type FormValues = Record<string, number | Record<string, number>>;

// Definimos las categorías para las pestañas
// IMPORTANTE: Los 'id' deben coincidir exactamente con 'category' en variables.ts
const CATEGORIES = [
  { id: "all", label: "Todos", icon: CheckCircle2 },
  { id: "metabolic", label: "Metabólico", icon: Droplets },
  { id: "cardiology", label: "Cardiológico", icon: HeartPulse },
  { id: "anthropometric", label: "Antropométrico", icon: Weight },
  { id: "pulmonology", label: "Pulmonar", icon: Activity },
];

export default function DailyLogger() {
  const [date, setDate] = useState(toLocalISODate());
  const [time, setTime] = useState(getCurrentLocalTime());
  const [values, setValues] = useState<FormValues>({});
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("all");

  // Estado para controlar el Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Función helper para mostrar el toast
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
  };

  // Efecto para ocultar el toast automáticamente después de 3 segundos
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (varId: string, val: number) => {
    setValues((prev) => ({ ...prev, [varId]: val }));
  };

  const handleCompositeChange = (
    varId: string,
    subKey: string,
    val: number,
  ) => {
    setValues((prev) => ({
      ...prev,
      [varId]: {
        ...((prev[varId] as Record<string, number>) || {}),
        [subKey]: val,
      },
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const timestamp = localDateTimeToTimestamp(date, time);

      // FILTRADO CLAVE: Solo enviamos entradas que tienen un valor definido
      const entries = Object.entries(values)
        .filter(([_, value]) => {
          // Si es número, chequeamos que no sea NaN
          if (typeof value === "number") return !isNaN(value);
          // Si es objeto (compuesto), chequeamos que al menos una propiedad tenga valor
          if (typeof value === "object") {
            return Object.values(value).some(
              (v) => v !== undefined && !isNaN(v),
            );
          }
          return false;
        })
        .map(([variableId, value]) => ({
          timestamp,
          variableId,
          value,
          notes: notes.trim() || undefined,
        }));

      if (entries.length === 0) {
        showToast(
          "⚠️ Por favor ingresa al menos un dato antes de guardar.",
          "error",
        );
        setIsSaving(false);
        return;
      }

      await db.measurements.bulkAdd(entries);

      // Éxito: Mostramos Toast
      showToast(`✅ ${entries.length} registro(s) guardado(s) con éxito.`);

      // Resetear solo valores, mantener fecha/hora
      setValues({});
      setNotes("");
    } catch (error) {
      console.error("Error guardando:", error);
      showToast("❌ Error al guardar datos.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA CORREGIDA DE PESTAÑAS ---
  const visibleVariables = CLINICAL_VARIABLES.filter((variable) => {
    if (activeTab === "all") return true;
    return variable.category === activeTab;
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      {/* Header con Fecha y Hora */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Registro Diario</h2>

        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <span className="absolute left-3 top-2 text-gray-400 text-xs">
              📅
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              required
            />
          </div>
          <div className="relative group">
            <span className="absolute left-3 top-2 text-gray-400 text-xs">
              ⏰
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              required
            />
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS (CATEGORÍAS) */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px focus:outline-none whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ÁREA DE FORMULARIO DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {visibleVariables.map((variable) => (
          <div key={variable.id} className="space-y-2 block">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <variable.icon size={16} className="text-blue-600" />
              {variable.label}
            </label>

            {variable.inputType === "number" && (
              <div className="relative">
                <input
                  type="number"
                  step={variable.validation?.step || 1}
                  min={variable.validation?.min}
                  max={variable.validation?.max}
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  // Control seguro de valor para evitar "undefined" en el input
                  value={
                    values[variable.id] !== undefined
                      ? String(values[variable.id])
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(variable.id, parseFloat(e.target.value))
                  }
                />
                {variable.unit && (
                  <span className="absolute right-3 top-3 text-gray-400 text-sm">
                    {variable.unit}
                  </span>
                )}
              </div>
            )}

            {variable.inputType === "composite" && variable.subFields && (
              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg border border-gray-100">
                {variable.subFields.map((sub) => {
                  // Aseguramos que currentComposite sea siempre un objeto
                  const currentComposite =
                    (values[variable.id] as Record<string, number>) || {};

                  return (
                    <div key={sub.key} className="relative w-full">
                      <input
                        type="number"
                        min={sub.validation?.min}
                        max={sub.validation?.max}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none mb-1"
                        placeholder="0"
                        value={
                          currentComposite[sub.key] !== undefined
                            ? String(currentComposite[sub.key])
                            : ""
                        }
                        onChange={(e) =>
                          handleCompositeChange(
                            variable.id,
                            sub.key,
                            parseFloat(e.target.value),
                          )
                        }
                      />

                      {/* Contenedor inferior: Label (izquierda) + Unidad (derecha) */}
                      <div className="flex justify-between items-center w-full text-xs text-gray-500 h-4">
                        <span>{sub.label}</span>

                        {sub.unit && (
                          <span className="text-gray-400 font-medium">
                            {sub.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notas y Botón Submit */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (Opcional)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            rows={2}
            placeholder="Ej: Me sentí mareado antes de medir..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Plus size={18} />
            {isSaving ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </div>

      {/* Renderizado del Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </form>
  );
}
