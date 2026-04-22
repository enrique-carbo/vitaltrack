# VitalTrack

**Diario Clínico Personal - Offline-First & 100% Privado**

VitalTrack es una aplicación web progresiva (PWA) diseñada para pacientes con condiciones crónicas (diabetes, hipertensión, etc.) que necesitan registrar variables clínicas diarias y controlar la adherencia a medicamentos. Transforma el tradicional "cuaderno de papel" en informes profesionales listos para compartir con el médico.

## 🌟 Características Principales

*   **100% Local y Privado:** Zero-Backend. Los datos nunca salen del dispositivo del usuario. Almacenamiento en **IndexedDB** vía **Dexie.js**.
*   **Arquitectura Híbrida (MPA + Islands):** Utiliza **Astro Pages** para un enrutamiento nativo, rápido y accesible, combinado con **React Components** ("Islands") solo donde se requiere interactividad compleja (formularios, gráficos).
*   **Seguridad de Cadena de Suministro:** Implementa **pnpm** para evitar dependencias fantasma y **minimum-release-age** para bloquear paquetes recién publicados (prevención de malware).
*   **Sistema de Variables Configurable:** Los desarrolladores pueden agregar nuevas métricas clínicas editando un solo archivo de configuración (`src/config/variables.ts`) sin tocar la lógica de la UI.
*   **Impresión Minimalista:** Páginas dedicadas (`/imprimir/...`) con CSS puro, sin interfaz de la aplicación, generando PDFs ligeros, compatibles y de alto contraste.
*   **Responsabilidad del Usuario:** Filosofía de "Caja Fuerte Local". El usuario es dueño de sus datos y responsable de realizar copias de seguridad (PDFs) de forma periódica.

---

## 🔒 Seguridad y Cadena de Suministro

VitalTrack implementa medidas estrictas para garantizar la integridad del código y la seguridad del despliegue:

1.  **Gestor de Paquetes (pnpm):**
    *   Utilizamos `pnpm` por su diseño estricto y eficiente. A diferencia de gestores tradicionales, `pnpm` crea una estructura de *hard links* que impide que un paquete acceda a dependencias que no declaró explícitamente, mitigando ataques de "dependency confusion".
2.  **Política de Cuarentena (minimum-release-age):**
    *   Se configura un gancho `preinstall` que verifica la fecha de publicación de los paquetes.
    *   **Bloqueo:** Se impide la instalación de cualquier paquete publicado hace menos de **72 horas**.
    *   **Objetivo:** Prevenir ataques de *typosquatting* (paquetes maliciosos con nombres similares a librerías populares) que se publican y retiran rápidamente. Esto garantiza que las dependencias hayan pasado un mínimo filtro de auditoría comunitaria.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión Objetivo | Rol en el Proyecto |
| :--- | :--- | :--- | :--- |
| **Package Manager** | **pnpm** | Latest | Gestor eficiente, estricto y seguro. |
| **Security Policy** | **minimum-release-age** | Latest | Gancho `preinstall` para cuarentena de paquetes. |
| **Framework** | Astro | `^6.1.0` | Enrutamiento basado en archivos y optimización estática. |
| **Motor Build** | Vite | `^7.0.0` | **BLOQUEADO** (No usar Vite 8 por compatibilidad). |
| **UI Library** | React | `^18.3.1` | Islas de interactividad (`client:load`) en formularios y gráficos. |
| **Transiciones** | Astro View Transitions | Latest | Navegación fluida entre páginas sin recargas. |
| **Estilos** | Tailwind CSS | `^4.0.0` | Estilizado rápido. Configuración vía `@theme`. |
| **Base de Datos** | Dexie.js | `^4.0.0` | Wrapper de IndexedDB. Reactividad vía `dexie-react-hooks`. |
| **Iconos** | Lucide React | Latest | Iconos vectoriales ligeros. |
| **Fechas** | date-fns | Latest | Manejo inmutable de fechas. |
| **Lenguaje** | TypeScript | Strict | Seguridad de tipos estricta. |

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura de **Multi-Page Application (MPA)** optimizada con "Islands Architecture".

### Estructura de Archivos
```text
vitaltrack/
├── public/               # Assets estáticos, manifest.json, sw.js
├── src/
│   ├── components/       # Componentes React (Islands de interactividad)
│   │   ├── DailyLogger.tsx   # Formulario de entrada
│   │   ├── Charts.tsx        # Gráficos de tendencias
│   │   └── MedManager.tsx    # Gestor de medicamentos
│   ├── config/           # Configuración Central (variables.ts)
│   ├── db/               # Definición de Schema Dexie (db.ts)
│   ├── layouts/          # Layouts de Astro (Header, Footer compartidos)
│   │   └── Layout.astro
│   ├── pages/            # Rutas de la Aplicación (Astro)
│   │   ├── index.astro       # Dashboard
│   │   ├── diario.astro      # Página de Registro
│   │   ├── reporte.astro     # Visualización de datos
│   │   ├── medicamentos.astro# Gestión de fármacos
│   │   └── imprimir/
│   │       └── [id].astro    # Página limpia solo para imprimir PDF
│   ├── styles/           # global.css + print.css
│   └── types/            # Definiciones TypeScript
```

### Flujo de Navegación y Estado

1.  **Enrutamiento:** Manejado nativamente por Astro (`src/pages/`). Al navegar de `/diario` a `/reporte`, se cambia la URL y la estructura HTML.
2.  **Interactividad:** Los componentes React se hidratan (`client:load`) solo dentro de sus páginas específicas.
3.  **Gestión de Estado:** Como es una MPA, el estado de React se desmonta al cambiar de página.
   
*   *Solución:* **"Database is the State"**. Cada página lee su estado inicial directamente de IndexedDB al cargarse. Esto asegura que los datos persistan y sean consistentes.

---

## 📊 Modelo de Datos (IndexedDB)

### Arquitectura Orientada a Configuración
El núcleo de la escalabilidad reside en `src/config/variables.ts`. Los componentes React no tienen "hardcodeado" qué es la "Glucemia" o la "Presión". Son componentes genéricos que leen esta configuración:

```typescript
interface VariableDefinition {
  id: string;
  label: string;
  inputType: 'number' | 'range' | 'composite';
  unit: string;
  icon: string;
  validation?: { min: number; max: number };
  subFields?: Field[]; // Para Presión Arterial (Sist/Dia/Pul)
}
```

Esto permite que futuras extensiones (agregar nuevas variables) sean tareas de 5 minutos de configuración.


### 📊 Modelo de Datos (IndexedDB)
**Base de Datos:** `VitalTrackDB`

| Tabla | Estructura | Descripción |
| :--- | :--- | :--- |
| **measurements** | `id, timestamp, variableId, value, notes` | Registros clínicos. `value` flexible (numérico u objeto). |
| **medications** | `id, name, dosage, time, color` | Configuración de medicamentos. |
| **logs** | `id, medicationId, date, taken, skipped` | Registro de adherencia. |
| **settings** | `key, value` | Perfil (Estatura, Nombre) y preferencias. |

---

## 🖨️ Estrategia de Impresión y Reportes

VitalTrack utiliza **Páginas de Astro dedicadas** para la impresión, garantizando la máxima compatibilidad.

*   **Ruta:** `/imprimir/[id]`
*   **Diseño Minimalista:**
    *   Sin Navbar, sin botones, sin JavaScript de navegación. Solo HTML y CSS.
    *   Tipografía: Arial/Sans-serif estándar. Alto contraste (Blanco/Negro).
    *   CSS: Uso extensivo de `@media print` y `@page { size: A4; margin: 1.5cm; }`.
*   **Gráficos:** Convertidos de `<canvas>` a `<img>` estática antes de imprimir para evitar problemas de renderizado en PDF.

---

## 🛡️ Filosofía de Datos y Usuario

Esta aplicación funciona como un **"Cuaderno de Papel Digital"**. Al no utilizar la nube, la privacidad es absoluta, pero la responsabilidad es compartida.

### Responsabilidad del Usuario

VitalTrack almacena todo en el dispositivo local. El usuario debe ser consciente de que:
1.  **Pérdida de Datos:** Borrar el historial del navegador, desinstalar la app o cambiar de dispositivo resultará en la pérdida de información si no se ha realizado una copia de seguridad.
2.  **La Regla del Domingo:** Se recomienda encarecidamente generar un informe PDF semanal y guardarlo en un lugar seguro (nube personal, USB, email) como copia de seguridad física.

---

## 🚀 Guía de Inicio Rápido

Este proyecto utiliza **pnpm** para la gestión de dependencias y seguridad.

```bash
# 1. Crear proyecto (usando el flag pnpm)
pnpm create astro@latest vitaltrack -- --template minimal --strict

# 2. Entrar a la carpeta
cd vitaltrack

# 3. Instalar herramientas de seguridad
pnpm add -D minimum-release-age

# 4. Configurar gancho de seguridad (preinstall) en package.json
# "scripts": { "preinstall": "minimum-release-age" }

# 5. Instalar dependencias principales
pnpm add react @astrojs/react
pnpm add -D tailwindcss@next
pnpm add dexie dexie-react-hooks lucide-react date-fns
# minimum-release-age se ejecutará automáticamente antes de esto

# 6. Configuración Crítica (Vite 7)
# Editar package.json -> "pnpm": { "overrides": { "vite": "^7" } }

# 7. Desarrollo
pnpm dev
```

---

## 📋 Variables Clínicas Soportadas

1.  **Antropométricas:** Peso, Estatura (Perfil). Cálculo automático de IMC.
2.  **Vitales:** Presión Arterial (Compuesta), Frecuencia Cardíaca, SpO2, Temperatura.
3.  **Metabólicas:** Glucemia.
4.  **Subjetivas (EVA):** Dolor, Prurito (Escala 0-10).
5.  **Personalizadas:** Sistema extensible vía `config/variables.ts`.

---

## 🚧 Restricciones y Consideraciones

*   **Sin Sincronización Automática:** Los datos no viajan solos entre dispositivos.
*   **Dependencia del Navegador:** Requiere un navegador moderno compatible con IndexedDB y Service Workers.
*   **Compatibilidad de Impresión:** Diseñado para funcionar mejor en Chrome/Edge/Firefox. Safari móvil puede requerir desactivar cabeceras/pies de página en la configuración de impresión.

## 📜 Licencia

[Por Definir]

**Aviso Médico:** Herramienta de registro personal. No sustituye consejo médico profesional.
