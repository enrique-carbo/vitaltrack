import { useState, useEffect } from "react";
import { db } from "@/db/db";
import { CLINICAL_VARIABLES, getVariableById } from "@/config/variables";
import { Toast } from "@/components/ui/Toast";
import {
  Plus,
  Activity,
  Droplets,
  HeartPulse,
  Weight,
  CheckCircle2,
  Brain,
  Frown,
} from "lucide-react";
import {
  toLocalISODate,
  getCurrentLocalTime,
  localDateTimeToTimestamp,
} from "@/utils/date";

type FormValues = Record<string, number | Record<string, number>>;

// Definimos las categorías para las pestañas
const CATEGORIES = [
  { id: "all", label: "Todos", icon: CheckCircle2 },
  { id: "metabolic", label: "Metabólico", icon: Droplets },
  { id: "cardiology", label: "Cardiológico", icon: HeartPulse },
  { id: "anthropometric", label: "Antropométrico", icon: Weight },
  { id: "pulmonology", label: "Pulmonar", icon: Activity },
  { id: "subjective", label: "Subjetivas", icon: Brain },
];

export default function DailyLogger() {
  const [date, setDate] = useState(toLocalISODate());
  const [time, setTime] = useState(getCurrentLocalTime());
  const [values, setValues] = useState<FormValues>({});
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleNumberChange = (varId: string, val: number) => {
    setValues((prev) => ({ ...prev, [varId]: val }));
  };

  const handleRangeChange = (varId: string, val: number) => {
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

      const entries = Object.entries(values)
        .filter(([_, value]) => {
          if (typeof value === "number") return !isNaN(value);
          if (typeof value === "object" && value !== null) {
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
      showToast(`✅ ${entries.length} registro(s) guardado(s) con éxito.`);
      setValues({});
      setNotes("");
    } catch (error) {
      console.error("Error guardando:", error);
      showToast("❌ Error al guardar datos.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const visibleVariables = CLINICAL_VARIABLES.filter((variable) => {
    if (activeTab === "all") return true;
    return variable.category === activeTab;
  });

  // Obtener el valor actual para range
  const getRangeValue = (varId: string): number => {
    const val = values[varId];
    return typeof val === "number" ? val : 0;
  };

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

      {/* Navegación por pestañas */}
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

      {/* Área de formulario dinámico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {visibleVariables.map((variable) => (
          <div key={variable.id} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <variable.icon size={16} className="text-blue-600" />
              {variable.label}
            </label>

            {/* Input tipo número */}
            {variable.inputType === "number" && (
              <div className="relative">
                <input
                  type="number"
                  step={variable.validation?.step || 1}
                  min={variable.validation?.min}
                  max={variable.validation?.max}
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={
                    values[variable.id] !== undefined
                      ? String(values[variable.id])
                      : ""
                  }
                  onChange={(e) =>
                    handleNumberChange(variable.id, parseFloat(e.target.value))
                  }
                />
                {variable.unit && (
                  <span className="absolute right-3 top-3 text-gray-400 text-sm">
                    {variable.unit}
                  </span>
                )}
              </div>
            )}

            {/* Input tipo rango (Escala de Dolor) */}
            {variable.inputType === "range" && (
              <div className="space-y-3">
                <input
                  type="range"
                  min={variable.validation?.min || 0}
                  max={variable.validation?.max || 10}
                  step={variable.validation?.step || 1}
                  value={getRangeValue(variable.id)}
                  onChange={(e) =>
                    handleRangeChange(variable.id, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Sin dolor</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {getRangeValue(variable.id)}
                  </span>
                  <span className="text-xs text-gray-400">Dolor máximo</span>
                </div>
                {/* Emojis según nivel de dolor */}
                <div className="flex justify-between text-xl">
                  <span>😊</span>
                  <span>😌</span>
                  <span>😐</span>
                  <span>😕</span>
                  <span>😟</span>
                  <span>😣</span>
                  <span>😖</span>
                  <span>😩</span>
                  <span>😫</span>
                  <span>😢</span>
                  <span>😭</span>
                </div>
              </div>
            )}

            {/* Input tipo compuesto (Presión Arterial) */}
            {variable.inputType === "composite" && variable.subFields && (
              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg border border-gray-100 p-2">
                {variable.subFields.map((sub) => {
                  const currentComposite =
                    (values[variable.id] as Record<string, number>) || {};
                  return (
                    <div key={sub.key} className="relative">
                      <input
                        type="number"
                        min={sub.validation?.min}
                        max={sub.validation?.max}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
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
                      <div className="flex justify-between items-center w-full text-xs text-gray-500 mt-1">
                        <span>{sub.label}</span>
                        {sub.unit && (
                          <span className="text-gray-400">{sub.unit}</span>
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

      {/* Toast */}
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
