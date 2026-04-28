# VitalTrack

![VitalTrack Banner](https://img.shields.io/badge/Astro-v6.1.0-blue?style=flat-square)
![VitalTrack Badge](https://img.shields.io/badge/React-v19.2.5-black?style=flat-square)
![VitalTrack Badge](https://img.shields.io/badge/PWA-Offline--Installable-success?style=flat-square)

**Diario Clínico Personal - Offline-First & 100% Privado**

VitalTrack es una aplicación web progresiva (PWA) diseñada para pacientes con condiciones crónicas (diabetes, hipertensión, etc.) que necesitan registrar variables clínicas diarias y controlar la adherencia a medicamentos. Transforma el tradicional "cuaderno de papel" en informes profesionales listos para compartir con el médico, garantizando que los datos nunca salgan del dispositivo del usuario.

## 🌟 Características Principales

*   **🔒 100% Local y Privado:** Zero-Backend. Los datos se almacenan exclusivamente en **IndexedDB** vía `Dexie.js` en el dispositivo del usuario. Sin rastreo, sin cuentas, sin nube.
*   **🏗️ Arquitectura Híbrida (MPA + Islands):** Utiliza **Astro Pages** para un enrutamiento nativo, rápido y accesible, combinado con **React Components** ("Islands") solo donde se requiere interactividad compleja.
*   **🛡️ Seguridad de Cadena de Suministro:** Implementa **pnpm** con políticas estrictas para prevenir ataques de dependencias fantasma o malware en paquetes recién publicados.
*   **📊 Sistema de Variables Configurable:** Los desarrolladores pueden agregar nuevas métricas clínicas editando un solo archivo de configuración (`src/config/variables.ts`) sin tocar la lógica de la UI.
*   **📈 Gráficos de Tendencia:** Visualización de datos con límite de 30 registros para rendimiento óptimo.
*   **🖨️ Reportes Médicos:** Generación de informes A4 con filtrado por categorías (metabólicas, cardiología, antropométricas, pulmonología).
*   **💊 Gestión de Adherencia:** Control visual de medicamentos con checklists diarios y seguimiento mensual.
*   **📊 Reporte de Adherencia:** Informe mensual con estadísticas de cumplimiento, optimizado para impresión en blanco y negro.
*   **📦 PWA Instalable:** Funciona offline y se puede instalar en móviles y desktop como una app nativa.

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Framework** | Astro | Enrutamiento basado en archivos y optimización estática. |
| **UI Library** | React | Islas de interactividad (`client:load`). |
| **Motor Build** | Vite | Motor de compilación. |
| **Estilos** | Tailwind CSS | Estilizado rápido (v4). |
| **Base de Datos** | Dexie.js | Wrapper de IndexedDB. |
| **Gráficos** | Recharts | Visualización de tendencias. |
| **Iconos** | Lucide React | Iconos vectoriales. |
| **Gestor de Paquetes** | pnpm | Gestión de dependencias. |
| **PWA** | @vite-pwa/astro | Configuración de Service Worker y Manifest. |

## 📦 Instalación

### Requisitos Previos
*   Node.js v22.12.0 o superior.
*   pnpm (instalado globalmente).

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/vitaltrack.git
    cd vitaltrack
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Iniciar entorno de desarrollo:**
    ```bash
    pnpm dev
    ```
    Visita `http://localhost:4321`

## 🗂️ Estructura del Proyecto

```text
vitaltrack/
├── public/               # Assets estáticos, manifest.json, sw.js
├── src/
│   ├── components/       # Componentes React (Islands de interactividad)
│   │   ├── DailyLogger.tsx      # Formulario de entrada clínica
│   │   ├── ChartsView.tsx       # Gráficos de tendencias (límite 30 registros)
│   │   ├── UserProfile.tsx      # IMC y datos del usuario
│   │   ├── MedManager.tsx       # Gestor de medicamentos
│   │   ├── MedicationLog.tsx    # Checklist diario de medicamentos
│   │   ├── MedicationHistory.tsx # Historial mensual de cumplimiento
│   │   ├── PrintReportData.tsx  # Reporte de variables clínicas
│   │   └── PrintAdherenceReport.tsx # Reporte de adherencia
│   ├── config/           # Configuración central (variables.ts)
│   ├── db/               # Definición de Schema Dexie (db.ts)
│   ├── layouts/          # Layouts de Astro (Header, Footer)
│   ├── pages/            # Rutas de la Aplicación
│   │   ├── index.astro        # Dashboard
│   │   ├── diario.astro       # Registro de variables
│   │   ├── reporte.astro      # Visualización de datos
│   │   ├── medicamentos.astro # Gestión de medicamentos
│   │   ├── adherencia.astro   # Reporte de adherencia
│   │   └── imprimir/          # Reporte de variables clínicas
│   ├── styles/           # global.css, print.css, print-adherence.css
│   ├── types/            # Definiciones TypeScript
│   └── utils/            # Utilidades de fecha y configuración
```

## 📊 Modelo de Datos (IndexedDB)

**Base de Datos:** `VitalTrackDB`

| Tabla | Estructura | Descripción |
| :--- | :--- | :--- |
| **measurements** | `id, timestamp, variableId, value, notes` | Registros clínicos. `value` flexible (numérico u objeto compuesto). |
| **medications** | `id, name, dosage, frequency, time, color` | Configuración de medicamentos. |
| **logs** | `id, medicationId, timestamp, taken, skipped` | Registro de adherencia diaria. |
| **settings** | `key, value` | Perfil (Estatura, Nombre) y preferencias. |

## 🖨️ Reportes

### Reporte de Variables Clínicas (`/imprimir`)
- Filtrado por categorías (metabólicas, cardiología, etc.)
- Tablas agrupadas o filtradas según selección
- Diseño minimalista para impresión A4

### Reporte de Adherencia (`/adherencia`)
- Control mensual de cumplimiento de medicamentos
- Estadísticas por medicamento (tomas realizadas vs esperadas)
- Porcentaje de adherencia individual y general
- Identificación de mejor/peor día del mes
- **Optimizado para impresión en blanco y negro (ahorro de tinta)**

## 🔒 Seguridad

VitalTrack implementa medidas para garantizar la integridad del código:
- **Gestor de Paquetes (pnpm):** Se fuerza el uso de `pnpm` vía script `preinstall`
- **Política de Cuarentena:** Bloquea paquetes publicados hace menos de 24 horas

## 🧑‍💻 Desarrollado por

Proyecto enfocado en arquitectura moderna Offline-First, privacidad del usuario y rendimiento.

**Aviso Médico:** Herramienta de registro personal. No sustituye consejo médico profesional.


## Cambios principales:

1. ✅ Nuevas características (Gráficos con límite, filtrado por categorías)
2. ✅ Reporte de adherencia a medicamentos
3. ✅ Estructura actualizada con nuevos componentes
4. ✅ Nueva página `/adherencia`
5. ✅ Nuevos CSS (`print-adherence.css`)
6. ✅ Simplificada la sección de seguridad (menos detalles técnicos)
7. ✅ Añadida nota sobre impresión optimizada para blanco y negro
