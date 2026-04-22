import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, type = "success", onClose }: ToastProps) {
  // Configuración visual según el tipo
  const styles =
    type === "success"
      ? "bg-white border-l-4 border-green-500 text-gray-800 shadow-xl"
      : "bg-white border-l-4 border-red-500 text-gray-800 shadow-xl";

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className={`${styles} flex items-center gap-4 px-6 py-4 rounded-lg min-w-[320px] max-w-md pointer-events-auto animate-slide-down`}
      >
        {/* CORREGIDO: Las comillas del className ahora están bien separadas */}
        <Icon
          size={24}
          className={type === "success" ? "text-green-600" : "text-red-600"}
        />

        <span className="text-sm font-semibold text-gray-700 flex-1">
          {message}
        </span>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition p-1"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
