//src/db/db.ts

import { Dexie, type Table } from "dexie";
import type { MeasurementRecord, MedicationRecord, LogEntry } from "@/types";

// 1. Definimos una CLASE que extiende de Dexie
// Usamos '!' (definite assignment assertion) porque Dexie inicializa estas propiedades mágicamente
class VitalTrackDB extends Dexie {
  measurements!: Table<MeasurementRecord, number>;
  medications!: Table<MedicationRecord, number>;
  logs!: Table<LogEntry, number>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("VitalTrackDB"); // Nombre de la base de datos en el navegador

    // 2. Definición del Schema (Versión 1)
    this.version(1).stores({
      measurements: "++id, timestamp, variableId",
      medications: "++id, name, time",
      logs: "++id, medicationId, timestamp",
      settings: "key, value",
    });
  }
}

// 3. Instanciamos la base de datos
export const db = new VitalTrackDB();

// --- HOOKS DE AUDITORÍA (Opcional pero útil para debug) ---

db.on("populate", () => {
  console.log("📦 Base de datos VitalTrackDB creada por primera vez.");
});

db.on("blocked", () => {
  console.warn("⚠️ La base de datos está bloqueada por otra pestaña.");
});

export default db;
