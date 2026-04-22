import { type VariableDefinition } from "@/types";
import {
  Activity,
  Droplets,
  HeartPulse,
  Weight,
  CandyOff,
  Wind,
  CircleSmall,
} from "lucide-react";

export const CLINICAL_VARIABLES: VariableDefinition[] = [
  {
    id: "glucose",
    label: "Glucemia",
    category: "metabolic",
    inputType: "number",
    unit: "mg/dL",
    icon: CandyOff,
    validation: { min: 20, max: 600, step: 1 },
  },
  {
    id: "blood_pressure",
    label: "Presión Arterial",
    category: "cardiology",
    inputType: "composite",
    icon: HeartPulse,
    subFields: [
      {
        key: "sys",
        label: "Sistólica",
        unit: "mmHg",
        validation: { min: 50, max: 250 },
      },
      {
        key: "dia",
        label: "Diastólica",
        unit: "mmHg",
        validation: { min: 30, max: 150 },
      },
    ],
  },
  {
    id: "weight",
    label: "Peso",
    category: "anthropometric",
    inputType: "number",
    unit: "kg",
    icon: Weight,
    validation: { min: 10, max: 200, step: 0.1 },
  },
  {
    id: "heart_rate",
    label: "Frecuencia Cardíaca",
    category: "cardiology",
    inputType: "number",
    unit: "lpm",
    icon: Activity,
    validation: { min: 30, max: 250 },
  },
  {
    id: "respiratory_rate",
    label: "Frecuencia Respiratoria",
    category: "pulmonology",
    inputType: "number",
    unit: "rpm",
    icon: Wind,
    validation: { min: 8, max: 60 },
  },
  {
    id: "oxygen_saturation",
    label: "Saturación de Oxígeno",
    category: "pulmonology",
    inputType: "number",
    unit: "%",
    icon: CircleSmall,
    validation: { min: 50, max: 100 },
  },
];

// Helper para obtener una variable por ID
export const getVariableById = (id: string) =>
  CLINICAL_VARIABLES.find((v) => v.id === id);
