# Esquema de Base de Datos - VitalTrack

## Tecnología

La aplicación utiliza **IndexedDB** a través de **Dexie.js**. Los datos se almacenan **exclusivamente en el dispositivo del usuario**.

**Nombre de la base de datos:** `VitalTrackDB`

---

## Tablas

### 1. `measurements` - Registros clínicos

Almacena todas las mediciones del usuario (glucosa, presión arterial, peso, etc.)

| Campo | Tipo | Índice | Descripción |
|-------|------|--------|-------------|
| `id` | `number` | Auto-increment (`++id`) | Identificador único |
| `timestamp` | `number` | ✅ Indexado (`timestamp`) | Fecha/hora en milisegundos |
| `variableId` | `string` | ✅ Indexado (`variableId`) | Tipo de medición |
| `value` | `number \| Record<string, number>` | - | Valor o objeto compuesto |
| `notes` | `string` (opcional) | - | Notas adicionales |

**Ejemplos:**

```typescript
// Número simple (glucosa, peso, etc.)
{ value: 110 }

// Objeto compuesto (presión arterial)
{ value: { sys: 120, dia: 80 } }
```

---

### 2. `medications` - Medicamentos

Configuración de los medicamentos del paciente.

| Campo | Tipo | Índice | Descripción |
|-------|------|--------|-------------|
| `id` | `number` | Auto-increment (`++id`) | Identificador único |
| `name` | `string` | ✅ Indexado (`name`) | Nombre del medicamento |
| `dosage` | `string` | - | Dosis (ej: "50mg", "1 comprimido") |
| `frequency` | `string` | - | Frecuencia (ej: "24h", "8h") |
| `time` | `string` | ✅ Indexado (`time`) | Horario en formato HH:MM |
| `color` | `string` | - | Color en formato hexadecimal |
| `createdAt` | `number` | - | Fecha de creación en milisegundos |

---

### 3. `logs` - Registro de adherencia

Control diario de medicamentos tomados.

| Campo | Tipo | Índice | Descripción |
|-------|------|--------|-------------|
| `id` | `number` | Auto-increment (`++id`) | Identificador único |
| `medicationId` | `number` | ✅ Indexado (`medicationId`) | Relación con `medications.id` |
| `timestamp` | `number` | ✅ Indexado (`timestamp`) | Momento del registro |
| `taken` | `boolean` | - | `true` = medicamento tomado |
| `skipped` | `boolean` | - | `true` = medicamento omitido |

---

### 4. `settings` - Configuración global

Preferencias y datos del perfil de usuario.

| Campo | Tipo | Índice | Descripción |
|-------|------|--------|-------------|
| `key` | `string` | ✅ Indexado (`key`) | Clave de configuración |
| `value` | `any` | - | Valor almacenado |

---

## Definiciones de TypeScript

```typescript
// src/types/index.ts
export interface MeasurementRecord {
  id?: number;
  timestamp: number;
  variableId: string;
  value: number | Record<string, number>;
  notes?: string;
}

export interface MedicationRecord {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
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
```

### Categorías de variables clínicas

Las `variableId` se agrupan por categoría:

| Categoría | ID | Variables incluidas |
|-----------|-----|---------------------|
| Cardiología | `cardiology` | Presión arterial, Frecuencia cardíaca |
| Metabólicas | `metabolic` | Glucemia |
| Antropométricas | `anthropometric` | Peso |
| Pulmonología | `pulmonology` | Frecuencia respiratoria, Saturación de oxígeno |

---

## Schema en Dexie

```typescript
// Versión 1 del schema
this.version(1).stores({
  measurements: "++id, timestamp, variableId",
  medications: "++id, name, time",
  logs: "++id, medicationId, timestamp",
  settings: "key, value",
});
```

### Claves e índices

| Tabla | Clave primaria | Índices secundarios |
|-------|----------------|---------------------|
| `measurements` | `id` | `timestamp`, `variableId` |
| `medications` | `id` | `name`, `time` |
| `logs` | `id` | `medicationId`, `timestamp` |
| `settings` | Ninguna | `key` |

---

## Relaciones

```
medications.id ─────< logs.medicationId
                    (relación uno a muchos, no definida a nivel de DB)
                    
measurements (independiente)
settings (independiente)
```

---

## Consultas útiles

### Últimos 30 registros clínicos

```typescript
const recent = await db.measurements
  .orderBy("timestamp")
  .reverse()
  .limit(30)
  .toArray();
```

### Registros por variable

```typescript
const glucose = await db.measurements
  .where("variableId")
  .equals("glucose")
  .toArray();
```

### Todos los medicamentos

```typescript
const allMeds = await db.medications.toArray();
```

### Logs de hoy

```typescript
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const logsHoy = await db.logs
  .where("timestamp")
  .aboveOrEqual(hoy.getTime())
  .toArray();
```

### Medicamentos con logs del día

```typescript
const todosLosLogs = await db.logs
  .where("timestamp")
  .aboveOrEqual(inicioDelDia)
  .toArray();

const tomadosIds = new Set(todosLosLogs.map(l => l.medicationId));
```

---

## Versionado

| Versión de DB | Cambios |
|---------------|---------|
| 1 (actual) | Schema inicial con 4 tablas |

---

## Eventos de ciclo de vida

```typescript
db.on("populate", () => {
  console.log("📦 Base de datos creada por primera vez.");
});

db.on("blocked", () => {
  console.warn("⚠️ Base de datos bloqueada por otra pestaña.");
});
```

---

## Archivo fuente

La definición del schema se encuentra en:

```
src/db/db.ts
```

Las definiciones de tipos en:

```
src/types/index.ts
```
