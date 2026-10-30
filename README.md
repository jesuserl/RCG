# 💼 Registro de Viáticos (ViáticosPro)

Sistema web integral y responsive para el **Control, Rendición, Auditoría y Liquidación de Viáticos y Asignaciones de Fondos en Bolívares (Bs. VES)**, diseñado específicamente para organizaciones corporativas que requieren trazabilidad de gastos de viaje, gestión de comprobantes fiscales y aislamiento seguro de información entre colaboradores y el departamento de administración/finanzas.

---

## 📑 Tabla de Contenidos

- [Resumen del Proyecto](#-resumen-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Descripción Funcional](#-descripción-funcional)
  - [1. Seguridad y Acceso Basado en Tokens](#1-seguridad-y-acceso-basado-en-tokens)
  - [2. Portal del Colaborador (En Ruta)](#2-portal-del-colaborador-en-ruta)
  - [3. Panel de Administración y Finanzas](#3-panel-de-administración-y-finanzas)
  - [4. Auditoría, Planilla Imprimible y Reportes](#4-auditoría-planilla-imprimible-y-reportes)
  - [5. Gestión y Diagnóstico de Supabase](#5-gestión-y-diagnóstico-de-supabase)
- [Descripción Técnica y Arquitectura](#-descripción-técnica-y-arquitectura)
  - [Estructura de Directorios](#estructura-de-directorios)
  - [Esquema de Base de Datos (PostgreSQL en Supabase)](#esquema-de-base-de-datos-postgresql-en-supabase)
  - [Reglas de Persistencia y Conexión](#reglas-de-persistencia-y-conexión)
- [Guía de Instalación y Ejecución Local](#-guía-de-instalación-y-ejecución-local)
- [Despliegue en Producción (Vercel + Supabase)](#-despliegue-en-producción-vercel--supabase)
- [Variables de Entorno](#-variables-de-entorno)
- [Políticas de Seguridad y Validaciones](#-políticas-de-seguridad-y-validaciones)

---

## 🚀 Resumen del Proyecto

**Registro de Viáticos** resuelve la necesidad empresarial de asignar presupuestos en Bolívares a colaboradores en comisión de servicio o viajes de trabajo, permitiéndoles justificar cada gasto en tiempo real adjuntando comprobantes digitales (facturas o recibos), mientras el equipo de administración audita, aprueba, rechaza u observa las partidas antes de emitir la planilla oficial de liquidación contable.

### Características Principales:
- 🇻🇪 **Manejo Exclusivo en Moneda Nacional (Bs. VES):** Todos los presupuestos, balances, gastos, desgloses y planillas contables operan en Bolívares.
- 🔒 **Aislamiento Estricto por Colaborador:** Cada colaborador únicamente tiene visibilidad sobre las relaciones de viaje asignadas a su nombre y sus propios comprobantes de gastos.
- 🔑 **Tokens Personales de Acceso:** No requiere registro público; los colaboradores acceden con un token generado por el Administrador.
- ☁️ **Persistencia en la Nube con Supabase (PostgreSQL):** Sincronización en vivo, con soporte para diagnósticos, inicialización de datos y limpieza controlada.
- 🛡️ **Validación Contra Borrado Accidental:** Las relaciones sólo pueden ser eliminadas por el Administrador tras ingresar el código de viaje o la palabra `ELIMINAR`, eliminando en cascada sus comprobantes dependientes.
- 🖨️ **Planilla Oficial de Liquidación:** Generación y descarga/impresión de formato corporativo con desglose por rubro y firma de conformidad.
- 📊 **Exportación de Datos:** Descarga de libros de gastos en formato CSV estructurado.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Interfaz reactiva componentizada, hooks modernos y concurrencia. |
| **Lenguaje** | **TypeScript 5+** | Tipado estático integral para modelos de datos, estados y props. |
| **Build Tool & Bundler** | **Vite 6** | Servidor de desarrollo ultrarrápido y empaquetado optimizado para producción. |
| **Diseño y Estilos** | **Tailwind CSS v4** | Utilidades CSS modernas con enfoque mobile-first y soporte para modo oscuro/claro corporativo. |
| **Librería de Íconos** | **Lucide React** | Iconografía vectorizada clara y semántica para finanzas y navegación. |
| **Animaciones UI** | **Motion (Framer Motion)** | Transiciones fluidas en diálogos modales, toasts y menús interactivos. |
| **Base de Datos & Backend** | **Supabase (PostgreSQL 15+)** | Almacenamiento relacional en la nube, consultas SQL, índices de alto rendimiento y RLS. |
| **SDK de Base de Datos** | **@supabase/supabase-js 2.x** | Cliente oficial para operaciones CRUD, autenticación anónima y transacciones. |
| **Hosting & Despliegue** | **Vercel** | Compatible con servidor estático/SPA configurado mediante `vercel.json`. |

---

## 💡 Descripción Funcional

### 1. Seguridad y Acceso Basado en Tokens

El sistema cuenta con dos roles claramente delimitados:

1. **Colaborador:**
   - Selecciona su nombre de la lista de personal activo.
   - Introduce su **Token de Acceso Personal** (emitido por el Administrador).
   - Al autenticarse, entra a su espacio exclusivo donde únicamente ve sus fondos y facturas.
2. **Administrador (Finanzas):**
   - Introduce su clave maestra de administrador (clave por defecto: `admindc2026*`).
   - Los formularios de inicio de sesión no revelan sugerencias ni contraseñas.
   - Tiene acceso global a la creación de fondos, auditoría de comprobantes, gestión de usuarios y ajustes de base de datos.

---

### 2. Portal del Colaborador (En Ruta)

- **Tarjetas de Relaciones Asignadas:** Visualización de viajes vigentes con código de relación (`REL-YYYY-NNN`), destino, rango de fechas y presupuesto asignado.
- **Barra de Ejecución de Fondos:** Indicador visual dinámico con porcentaje gastado vs. saldo remanente en Bolívares (`Bs. VES`). Alerta visual de sobregiro en color rojo si el monto gastado supera el presupuesto.
- **Registro Rápido de Gastos:**
  - Categorías oficiales: **Hospedaje**, **Alimentación**, **Transporte**, **Combustible**, **Otros**.
  - Monto en Bolívares con soporte decimal.
  - Carga de fotografía o archivo digital del comprobante fiscal (soporte para cámara en dispositivos móviles).
- **Visor de Comprobantes:** Modal con zoom y vista detallada del recibo o factura digitalizada.
- **Rendición de Cuentas:** Botón para remitir formalmente la relación al departamento de administración (`submitted`), bloqueando modificaciones no autorizadas durante la revisión contable.

---

### 3. Panel de Administración y Finanzas

- **Creación de Nuevas Relaciones de Viáticos:**
  - Asignación a cualquier colaborador registrado.
  - Monto presupuestario en Bolívares (`Bs. VES`).
  - Fechas de inicio y retorno, destino y notas contables.
  - Generación automática de código correlativo único.
- **Eliminación Segura con Validación:**
  - Botón de papelera en cada relación de viáticos.
  - **Modal de Validación:** Muestra los datos de la relación y el número de facturas asociadas que se borrarán. Obliga al usuario a escribir el código de la relación (ej. `REL-2026-001`) o la palabra `ELIMINAR` para activar el botón rojo de confirmación.
- **Gestión de Colaboradores:**
  - Creación de nuevos colaboradores con nombre completo, departamento y cargo.
  - Generación y asignación de tokens personalizados o regeneración instantánea de credenciales.
  - Eliminación de colaboradores.
- **Actualización de Clave de Administrador:**
  - Modificación de la clave administrativa directamente desde la pestaña de colaboradores.

---

### 4. Auditoría, Reporte Limpio y Descarga de Comprobantes en PDF

- **Reporte Específico y Limpio de Relación de Gastos:**
  - Disponible tanto para el **Colaborador** como para el **Administrador** en cualquier estado de la relación (**Abierta**, **Rendida** o **Liquidada**).
  - Presenta un diseño corporativo limpio y estructurado con código oficial, datos del colaborador, destino, fechas, estado y notas de finanzas.
  - Tabla de desglose de gastos en Bolívares (`Bs. VES`) con fecha, categoría, concepto, estatus de auditoría y soporte fotográfico.
  - Resumen financiero de tres columnas: *Fondo Asignado por Administración*, *Total Gastado y Comprobado* y *Saldo a Reembolsar al Empleado* o *Saldo a Devolver a la Empresa*.
  - Galería visual de comprobantes digitales adjuntos con vistas previas.
  - Bloque oficial de firmas para Colaborador, Analista de Finanzas y Gerencia.
- **Descarga de Comprobantes en PDF (Individual y Consolidado):**
  - **Descarga Uno a Uno (Individual):** Cada comprobante cuenta con su botón `PDF` en la tabla de gastos, en el visor de fotos y en el reporte. Genera un documento PDF estructurado de alta calidad que incluye el encabezado fiscal, concepto, categoría, monto en Bolívares, fecha, estado y la fotografía del comprobante digital incrustada.
  - **Descarga de Todos los Comprobantes Juntos:** Botón `Descargar Todos los Comprobantes (PDF)` que compila en un único expediente PDF la portada con el balance general de la comisión seguido de una página completa para cada comprobante adjunto.
  - **Descarga del Reporte Resumen en PDF:** Botón `Descargar Reporte (PDF)` para obtener la planilla formal contable en archivo PDF directo.
- **Auditoría de Comprobantes:**
  - Filtro por relación de viaje o búsqueda en tiempo real por concepto y colaborador.
  - Visualización del comprobante digital y datos fiscales.
  - Botón de **Aprobar** (marca el comprobante como validado para liquidación).
  - Botón de **Rechazar / Observar** con campo obligatorio de notas contables para justificar el rechazo al colaborador.
- **Liquidación Final:**
  - Una vez revisados todos los comprobantes, el Administrador liquida la relación (`settled`), congelando el balance contable final.
- **Exportación CSV:** Descarga directa de la base de datos de viáticos compatible con Microsoft Excel y Google Sheets.

---

### 5. Gestión y Diagnóstico de Supabase

Dentro de la pestaña **"Base de Datos Supabase"** del panel de control se ofrecen herramientas de mantenimiento directo:
- **Diagnóstico en Vivo:** Conteo real de filas alojadas en las tablas remotas de Supabase (`employees`, `trip_relations`, `expenses`).
- **Aviso Integrado de Tablas Vacías:** Si la base de datos no contiene registros, se presenta un banner interactivo con botón directo para *Inicializar / Sembrar Datos Base*.
- **Sembrar Datos Base:** Carga instantánea de colaboradores iniciales, relaciones de prueba y gastos en Bolívares.
- **Limpieza Total (Zona de Peligro):** Vacía todas las tablas en Supabase y localmente, dejando únicamente activo al usuario administrador con la clave `admindc2026*`.
- **Editor SQL Integrado:** Visualizador del script DDL PostgreSQL completo con botón de copiado al portapapeles para su ejecución en el SQL Editor de Supabase.

---

## 📐 Descripción Técnica y Arquitectura

### Estructura de Directorios

```text
├── .env.example              # Plantilla de variables de entorno (Supabase y App)
├── index.html                # Entrada HTML5 con fuentes tipográficas y meta tags
├── metadata.json             # Metadatos de la aplicación para AI Studio y PWA
├── package.json              # Dependencias de producción y scripts de ejecución
├── tsconfig.json             # Configuración del compilador TypeScript
├── vercel.json               # Reglas de enrutamiento y rewrites para Vercel
├── vite.config.ts            # Configuración del empaquetador Vite con Tailwind CSS
│
├── supabase/
│   └── schema.sql            # Script DDL completo de PostgreSQL para Supabase
│
└── src/
    ├── main.tsx              # Punto de entrada de React en el DOM
    ├── App.tsx               # Orquestador principal, estado de autenticación y datos
    │
    ├── components/
    │   ├── LoginScreen.tsx          # Pantalla de acceso dual (Colaborador / Admin)
    │   ├── EmployeePortal.tsx       # Interfaz restringida para colaboradores
    │   ├── AdminPortal.tsx          # Panel administrativo con navegación en 5 pestañas
    │   ├── ExpenseFormModal.tsx     # Modal para registrar nuevo gasto con foto
    │   ├── CreateRelationModal.tsx  # Modal para crear relaciones de viaje
    │   ├── ReceiptViewerModal.tsx   # Modal para visualizar comprobantes en HD
    │   └── PrintReportModal.tsx     # Planilla oficial de liquidación imprimible
    │
    ├── lib/
    │   └── supabase.ts       # Cliente Supabase, limpiador de URLs y credenciales
    │
    ├── services/
    │   └── supabaseService.ts # Capa de abstracción y operaciones CRUD contra PostgreSQL
    │
    ├── types/
    │   └── index.ts          # Interfaces TypeScript (TripRelation, Expense, EmployeeProfile, etc.)
    │
    └── utils/
        ├── storage.ts        # Manejo de fallback en localStorage y sesiones
        └── exportCsv.ts      # Utilidad para exportación a formato CSV
```

---

### Esquema de Base de Datos (PostgreSQL en Supabase)

El esquema implementado en PostgreSQL utiliza tipos de datos nativos e integridad referencial con eliminación en cascada:

```sql
-- 1. Tabla de Colaboradores
CREATE TABLE public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    access_token TEXT NOT NULL DEFAULT 'EMP-1000',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Relaciones de Viáticos (Presupuestos en Bolívares)
CREATE TABLE public.trip_relations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    allocated_budget_ves NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'submitted' | 'settled'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Comprobantes y Gastos (en Bolívares)
CREATE TABLE public.expenses (
    id TEXT PRIMARY KEY,
    relation_id TEXT NOT NULL REFERENCES public.trip_relations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL, -- 'Hospedaje' | 'Alimentación' | 'Transporte' | 'Combustible' | 'Otros'
    concept TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL, -- Monto en Bs. VES
    employee_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    receipt_url TEXT,
    receipt_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    finance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Índices de Desempeño:
- `idx_employees_token`: Búsqueda instantánea de colaborador por token de acceso.
- `idx_trip_relations_employee`: Filtrado rápido para aislar las relaciones de cada colaborador.
- `idx_expenses_relation_id`: Consulta inmediata de todos los gastos que componen una relación.

---

### Reglas de Persistencia y Conexión

1. **Fuente de Verdad en Supabase:** Al iniciar la app, todos los datos se descargan directamente desde las tablas PostgreSQL en Supabase.
2. **Normalización Inteligente de URL:** Si el usuario ingresa una URL con el sufijo de la API REST (`https://[ref].supabase.co/rest/v1/`), la aplicación automáticamente limpia el sufijo para que el cliente JavaScript oficial conecte correctamente a la raíz de Supabase (`https://[ref].supabase.co`).
3. **Manejo de Transacciones y Eliminación en Cascada:** Al eliminar una relación, el servicio borra primero los comprobantes vinculados en la tabla `expenses` y posteriormente la fila en `trip_relations`, garantizando que no queden registros huérfanos.

---

## 💻 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** (versión 18.x o superior)
- **npm** (versión 9.x o superior)

### Pasos

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd registro-de-viaticos
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
   Define tu URL y Llave Anónima de Supabase:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-key-de-supabase"
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000`.

5. **Verificar tipado y compilación:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 🚀 Despliegue en Producción (Vercel + Supabase)

### Paso 1: Configurar Supabase
1. Ingresa a tu panel en [Supabase](https://supabase.com/).
2. Abre tu proyecto y dirígete al menú **SQL Editor**.
3. Haz clic en **New query**, copia y pega el contenido completo del archivo `supabase/schema.sql` y presiona **RUN**.
4. En **Project Settings -> API**, localiza:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**

### Paso 2: Desplegar en Vercel
1. Conecta tu repositorio de GitHub o GitLab en [Vercel](https://vercel.com/).
2. Vercel detectará automáticamente el archivo `vercel.json` y el framework **Vite**.
3. En la sección **Environment Variables**, añade:
   - `VITE_SUPABASE_URL`: Tu Project URL de Supabase (ej. `https://qwivjixoziyliggczocf.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima (`anon key`) de Supabase.
4. Presiona **Deploy**. Vercel compilará la aplicación y generará la URL de producción accesible mundialmente con SSL automático.

---

## 🔐 Variables de Entorno

| Variable | Requerida | Propósito | Ejemplo |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Sí** | URL base de la instancia de Supabase | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Sí** | Llave pública anónima JWT para llamadas a Supabase | `eyJhbGciOiJIUz...` |

> **Nota:** La aplicación cuenta además con un configurador interactivo en la pestaña *Base de Datos* del panel administrativo, por lo que las credenciales pueden actualizarse o modificarse directamente desde la interfaz sin necesidad de recompilar el proyecto.

---

## 🛡️ Políticas de Seguridad y Validaciones

1. **Sin Exposición de Contraseñas:** La pantalla de bienvenida no contiene sugerencias visuales, contraseñas de ejemplo ni botones de auto-rellenado.
2. **Acceso Restringido a Colaboradores:** Un colaborador sólo puede observar sus propios fondos y facturas. No puede visualizar las asignaciones de otros departamentos ni alterar datos de auditoría.
3. **Protección Contra Borrados Accidentales:** Se requiere escribir explícitamente el código identificador de la relación o la palabra `ELIMINAR` para procesar cualquier supresión en base de datos.
4. **Respaldo de Integridad:** Se aplican restricciones de clave foránea `ON DELETE CASCADE` en PostgreSQL, evitando inconsistencias entre viajes y facturas.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia corporativa del sistema. Todos los derechos reservados.
