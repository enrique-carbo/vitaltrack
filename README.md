# VitalTrack

![VitalTrack Banner](https://img.shields.io/badge/Astro-v6.1.0-blue?style=flat-square)
![VitalTrack Badge](https://img.shields.io/badge/React-v19.2.5-black?style=flat-square)
![VitalTrack Badge](https://img.shields.io/badge/PWA-Offline--Installable-success?style=flat-square)

**Diario Clínico Personal - Offline-First & 100% Privado**

VitalTrack es una aplicación web progresiva (PWA) diseñada para pacientes con condiciones crónicas (diabetes, hipertensión, etc.) que necesitan registrar variables clínicas diarias y controlar la adherencia a medicamentos. Transforma el tradicional "cuaderno de papel" en informes profesionales listos para compartir con el médico, garantizando que los datos nunca salgan del dispositivo del usuario.

## 🌟 Características Principales

*   **🔒 100% Local y Privado:** Zero-Backend. Los datos se almacenan exclusivamente en **IndexedDB** vía `Dexie.js` en el dispositivo del usuario. Sin rastreo, sin cuentas, sin nube.
*   **🏗️ Arquitectura Híbrida (MPA + Islands):** Utiliza **Astro Pages** para un enrutamiento nativo, rápido y accesible, combinado con **React Components** ("Islands") solo donde se requiere interactividad compleja.
*   **🛡️ Seguridad de Cadena de Suministro:** Implementa **pnpm** con políticas estrictas (`minimum-release-age` via `.npmrc`) para prevenir ataques de dependencias fantasma o malware en paquetes recién publicados.
*   **📊 Sistema de Variables Configurable:** Los desarrolladores pueden agregar nuevas métricas clínicas editando un solo archivo de configuración (`src/config/variables.ts`) sin tocar la lógica de la UI.
*   **🖨️ Impresión Minimalista:** Generación de informes A4 mediante CSS puro, garantizando alto contraste y compatibilidad con cualquier navegador.
*   **💊 Gestión de Adherencia:** Control visual de medicamentos con checklists diarios y recordatorios de color.
*   **📦 PWA Instalable:** Funciona offline y se puede instalar en móviles y dekstops como una app nativa.

## 🚀 Demostración

VitalTrack se ejecuta completamente en el navegador. Para probarlo, simplemente clona el repositorio y ejecuta el servidor de desarrollo.

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Framework** | Astro | Enrutamiento basado en archivos y optimización estática. |
| **UI Library** | React | Islas de interactividad (`client:load`). |
| **Motor Build** | Vite | Motor de compilación (Bloqueado a v7 via pnpm overrides). |
| **Estilos** | Tailwind CSS | Estilizado rápido (v4). |
| **Base de Datos** | Dexie.js | Wrapper de IndexedDB. |
| **Gráficos** | Recharts | Visualización de tendencias. |
| **Iconos** | Lucide React | Iconos vectoriales. |
| **Gestor de Paquetes** | pnpm | Seguridad y estricta gestión de dependencias. |
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
    > **Nota de Seguridad:** Este proyecto utiliza un archivo `.npmrc` para bloquear la instalación de dependencias publicadas hace menos de 24 horas (1440 minutos), garantizando estabilidad y protección contra ataques de typosquatting. El script `preinstall` también fuerza el uso exclusivo de `pnpm`.

3.  **Iniciar entorno de desarrollo:**
    ```bash
    pnpm dev
    ```
    Visita `http://localhost:4321`

## 🗂️ Estructura del Proyecto

El proyecto sigue una estructura de **Multi-Page Application (MPA)** optimizada con "Islands Architecture".

```text
vitaltrack/
├── public/               # Assets estáticos, manifest.json, sw.js
├── src/
│   ├── components/       # Componentes React (Islands de interactividad)
│   │   ├── DailyLogger.tsx   # Formulario de entrada
│   │   ├── Charts.tsx        # Gráficos de tendencias
│   │   ├── UserProfile.tsx    # IMC y Datos del usuario
│   │   └── MedManager.tsx    # Gestor de medicamentos
│   ├── config/           # Configuración Central (variables.ts)
│   ├── db/               # Definición de Schema Dexie (db.ts)
│   ├── layouts/          # Layouts de Astro (Header, Footer)
│   ├── pages/            # Rutas de la Aplicación (Astro)
│   │   ├── index.astro       # Dashboard
│   │   ├── diario.astro      # Página de Registro
│   │   ├── reporte.astro     # Visualización de datos
│   │   ├── medicamentos.astro # Gestión de fármacos
│   │   └── imprimir/         # Ruta de impresión
│   ├── styles/           # global.css + print.css
│   ├── types/            # Definiciones TypeScript
│   └── utils/            # Utilidades de fecha y configuración
```

## 🔒 Seguridad y Cadena de Suministro

VitalTrack implementa medidas estrictas para garantizar la integridad del código:

1.  **Gestor de Paquetes (pnpm):** Se fuerza el uso de `pnpm` vía script `preinstall` para evitar conflictos y ataques de "dependency confusion".
2.  **Política de Cuarentena (`minimum-release-age`):** Configurado en `.npmrc`. Bloquea la instalación de cualquier paquete publicado hace menos de **1440 minutos (1 día)**, mitigando riesgos de typosquatting y malware nuevo.

## 📊 Modelo de Datos (IndexedDB)

**Base de Datos:** `VitalTrackDB`

| Tabla | Estructura | Descripción |
| :--- | :--- | :--- |
| **measurements** | `id, timestamp, variableId, value, notes` | Registros clínicos. `value` flexible (numérico u objeto compuesto). |
| **medications** | `id, name, dosage, frequency, time, color` | Configuración de medicamentos. |
| **logs** | `id, medicationId, timestamp, taken` | Registro de adherencia diaria. |
| **settings** | `key, value` | Perfil (Estatura, Nombre) y preferencias. |

## 🖨️ Generación de Reportes

VitalTrack utiliza **Páginas de Astro dedicadas** para la impresión.

*   **Ruta:** `/imprimir`
*   **Tecnología:** CSS Media Queries (`@media print`).
*   **Características:**
    *   Diseño minimalista sin interfaz de la aplicación (Navbar/Footer ocultos).
    *   Tipografía estándar de alto contraste.
    *   Tablas legibles diseñadas para papel A4.

## 🧑‍💻 Desarrollado por

Este proyecto fue desarrollado como un ejercicio de arquitectura moderna Offline-First, enfocado en la privacidad del usuario y el rendimiento.

**Licencia:** [Por Definir]

**Aviso Médico:** Herramienta de registro personal. No sustituye consejo médico profesional.
