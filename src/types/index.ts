import type { LucideIcon } from "lucide-react";

// Definición de cómo se configura una variable clínica
export interface VariableDefinition {
  id: string;
  label: string;
  category:
    | "vital"
    | "metabolic"
    | "anthropometric"
    | "subjective"
    | "cardiology"
    | "pulmonology";
  inputType: "number" | "range" | "composite" | "select";
  unit?: string;
  icon: any; // LucideIcon component
  validation?: {
    min: number;
    max: number;
    step?: number;
  };
  // Para variables compuestas como Presión Arterial (Sistólica/Diastólica)
  subFields?: Array<{
    key: string;
    label: string;
    unit?: string;
    validation?: { min: number; max: number };
  }>;
}

// Estructura del dato guardado en IndexedDB
export interface MeasurementRecord {
  id?: number; // Auto-incremental (Dexie)
  timestamp: number;
  variableId: string;
  value: number | Record<string, number>; // Número simple u objeto (ej: { sys: 120, dia: 80 })
  notes?: string;
}

export interface MedicationRecord {
  id?: number;
  name: string;
  dosage: string;
  frequency: string; // ej: "8h", "24h"
  time: string;
  color: string;
  createdAt: number;
}

export interface LogEntry {
  id?: number;
  medicationId: number;
  timestamp: number;
  taken: boolean;
  skipped: boolean;
}
