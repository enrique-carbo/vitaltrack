import { useState, useEffect } from "react";
import { db } from "@/db/db";
import { Pill, X, Plus, Trash2, Edit } from "lucide-react";

// Definimos el tipo para TypeScript (asegúrate de que coincida con tu db.ts)
type Medication = {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  color: string;
  createdAt: number;
};

const COLOR_OPTIONS = [
  // Colores Primarios y Neutros
  { name: "Rojo", value: "#ef4444", bg: "bg-red-100" },
  { name: "Azul", value: "#3b82f6", bg: "bg-blue-100" },
  { name: "Verde", value: "#22c55e", bg: "bg-green-100" },
  { name: "Naranja", value: "#f97316", bg: "bg-orange-100" },
  { name: "Púrpura", value: "#a855f7", bg: "bg-purple-100" },

  // Tonos Pasteles y Suaves (Útiles para medicamentos de soporte)
  { name: "Rosa", value: "#ec4899", bg: "bg-pink-100" },
  { name: "Cian", value: "#06b6d4", bg: "bg-cyan-100" },
  { name: "Lima", value: "#84cc16", bg: "bg-lime-100" }, // Verde más amarillento
  { name: "Ambar", value: "#f59e0b", bg: "bg-amber-100" }, // Amarillo/Naranja suave

  // Tonos Oscuros/Neutros (Para diferenciar claramente)
  { name: "Índigo", value: "#6366f1", bg: "bg-indigo-100" }, // Azul violáceo
  { name: "Slate", value: "#64748b", bg: "bg-slate-100" }, // Gris azulado
  { name: "Teal", value: "#14b8a6", bg: "bg-teal-100" }, // Verde azulado
];

export default function MedManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [medsList, setMedsList] = useState<Medication[]>([]);

  // Estado del formulario
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("24h");
  const [time, setTime] = useState("08:00");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  // Cargar medicamentos al montar el componente
  useEffect(() => {
    loadMeds();
  }, []);

  const loadMeds = async () => {
    const allMeds = await db.medications.toArray();
    setMedsList(allMeds);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await db.medications.add({
        name,
        dosage,
        frequency,
        time,
        color: selectedColor,
        createdAt: Date.now(),
      });

      // Recargar lista y limpiar formulario
      await loadMeds();
      resetForm();
      setIsOpen(false);

      // Feedback visual opcional (podrías usar un toast en el futuro)
      // alert("Medicamento agregado");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar medicamento");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmDelete = confirm(`¿Estás seguro de eliminar "${name}"?`);
    if (!confirmDelete) return;

    try {
      await db.medications.delete(id);
      await loadMeds(); // Actualizar la lista local
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar medicamento");
    }
  };

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("24h");
    setTime("08:00");
    setSelectedColor(COLOR_OPTIONS[1].value);
  };

  return (
    <div className="space-y-6">
      {/* Lista de Medicamentos Existentes */}
      {medsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medsList.map((med) => (
            <div
              key={med.id}
              className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-3 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: med.color }}
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">
                    {med.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex gap-2">
                    <span>{med.dosage}</span>
                    <span>•</span>
                    <span>{med.time}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => med.id && handleDelete(med.id, med.name)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"
                title="Eliminar medicamento"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón para abrir el formulario o el Formulario mismo */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2 font-medium bg-slate-50"
        >
          <Plus size={20} />
          Agregar Nuevo Medicamento
        </button>
      ) : (
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6 relative animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>

          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Pill size={20} className="text-blue-600" />
            Nuevo Medicamento
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Omeprazol"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dosis
                </label>
                <input
                  type="text"
                  placeholder="Ej. 20mg"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Color de Etiqueta
              </label>
              <div className="flex flex-wrap gap-3 justify-start">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedColor(opt.value)}
                    className={`w-8 h-8 rounded-full transition transform hover:scale-110 ${
                      selectedColor === opt.value
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: opt.value }}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition mt-2"
            >
              Guardar Medicamento
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
