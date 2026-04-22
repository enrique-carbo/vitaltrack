import { useState, useEffect } from "react";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { saveHeight, getHeight } from "@/utils/settings";
import { Scale, User, AlertTriangle } from "lucide-react";

export default function UserProfile() {
  const [height, setHeight] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Obtener el último registro de Peso
  const latestWeight = useLiveQuery(
    () =>
      db.measurements
        .where("variableId")
        .equals("weight")
        .reverse() // Último primero
        .limit(1)
        .first(),
    [],
  );

  // 2. Cargar altura guardada al inicio
  useEffect(() => {
    getHeight().then((savedHeight) => {
      if (savedHeight) {
        setHeight(savedHeight);
        setIsEditing(false); // Si ya tiene altura, no mostramos el input por defecto
      } else {
        setIsEditing(true); // Si no tiene, mostramos el input
      }
    });
  }, []);

  // 3. Calcular IMC
  let bmi = null;
  let bmiStatus = "";
  let bmiColor = "";

  if (height > 0 && latestWeight && typeof latestWeight.value === "number") {
    const heightInMeters = height / 100;
    bmi = latestWeight.value / (heightInMeters * heightInMeters);
    bmi = Math.round(bmi * 10) / 10; // Redondear a 1 decimal

    if (bmi < 18.5) {
      bmiStatus = "Bajo peso";
      bmiColor = "text-blue-600 bg-blue-50";
    } else if (bmi < 25) {
      bmiStatus = "Normal";
      bmiColor = "text-green-600 bg-green-50";
    } else if (bmi < 30) {
      bmiStatus = "Sobrepeso";
      bmiColor = "text-orange-600 bg-orange-50";
    } else {
      bmiStatus = "Obesidad";
      bmiColor = "text-red-600 bg-red-50";
    }
  }

  const handleSaveHeight = async () => {
    await saveHeight(height);
    setIsEditing(false);
  };

  const handleResetDatabase = async () => {
    const confirmation = window.confirm(
      "⚠️ ¡PELIGRO! \n\nEsto borrará TODOS tus registros, medicamentos y configuraciones de forma permanente. \n\n¿Estás seguro de continuar?",
    );

    if (confirmation) {
      try {
        // Dexie borra todo el archivo IndexedDB
        await db.delete();

        // Recargamos la página para que la app se reinicie y cree una DB limpia
        window.location.reload();
      } catch (err) {
        console.error("Error al borrar DB:", err);
        alert("No se pudo borrar la base de datos.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <User className="text-slate-500" size={20} />
        <h3 className="font-bold text-slate-800">Perfil de Salud</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* SECCIÓN: PESO ACTUAL (Lectura) */}
        <div className="text-center md:text-left p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Último Peso
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <Scale size={18} className="text-slate-400" />
            <span className="text-2xl font-bold text-slate-900">
              {/* Usamos una guarda de tipo (type guard) para asegurar que sea number */}
              {typeof latestWeight?.value === "number" ? (
                <>
                  <span className="text-2xl font-bold text-slate-900">
                    {latestWeight.value}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      kg
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-slate-300">--</span>
              )}
            </span>
          </div>
          {!latestWeight && (
            <p className="text-xs text-slate-400 mt-1">Sin registros</p>
          )}
        </div>

        {/* SECCIÓN: ALTURA (Input fijo) */}
        <div className="p-4 bg-slate-50 rounded-lg flex flex-col items-center justify-center">
          {isEditing ? (
            <div className="flex flex-col items-center w-full gap-2">
              <label className="text-xs text-slate-500 font-bold uppercase">
                Altura (cm)
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="number"
                  value={height || ""}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder="175"
                  className="w-full p-2 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSaveHeight}
                  className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <div
              className="text-center group cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <p className="text-xs text-slate-500 uppercase font-bold group-hover:text-blue-500 transition">
                Altura
              </p>
              <p className="text-xl font-bold text-slate-700 mt-1 group-hover:text-blue-600 transition">
                {height} <span className="text-sm font-normal">cm</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition">
                Click para editar
              </p>
            </div>
          )}
        </div>

        {/* SECCIÓN: RESULTADO IMC (Calculado) */}
        <div
          className={`p-4 rounded-lg text-center transition-all ${bmi ? bmiColor : "bg-slate-100"}`}
        >
          <p className="text-xs uppercase font-bold opacity-70">
            Índice Masa Corporal (IMC)
          </p>
          {bmi ? (
            <div className="mt-1">
              <div className="text-3xl font-extrabold">{bmi}</div>
              <div className="text-sm font-bold mt-1">{bmiStatus}</div>
            </div>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-1 text-slate-400">
              <AlertTriangle size={16} />
              <span className="text-xs">Faltan datos</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-center">
        <button
          onClick={handleResetDatabase}
          className="text-xs text-red-400 hover:text-red-600 underline transition"
        >
          Borrar todos los datos (Resetear App)
        </button>
      </div>
    </div>
  );
}
