# Control de Gastos de Viáticos (ViáticosPro)

Aplicación web y móvil responsiva (Mobile-First) diseñada para registrar de forma ágil los gastos generados en viajes de negocios y facilitar la revisión, validación y liquidación contable por parte del área de Finanzas.

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> A partir de las aclaraciones recibidas, la aplicación incorpora:
> - **Modo Dual de Roles**: Selector de vista instantáneo entre **Empleado** (registro rápido de viáticos, consulta de presupuesto y comprobantes) y **Finanzas** (auditoría de comprobantes, aprobación/rechazo con observaciones y ajuste de presupuestos).
> - **Esquema Bimonetario ($ USD y Bs BCV)**: Soporte nativo para registrar en Dólares ($) o Bolívares (Bs), con tasa oficial BCV parametrizable en vivo y totalización simultánea en ambas monedas.
> - **Comprobantes Reales & Previsualizador**: Carga de imágenes reales (cámara o galería) con almacenamiento local persistente (`localStorage` / DataURL), zoom interactivo y visor modal a pantalla completa.

---

## 1. Visión General y Concepto Central

- **Propósito**: Eliminar el desorden de facturas en papel y hojas de cálculo desactualizadas durante los viajes de trabajo, proveyendo a los colaboradores una herramienta de bolsillo para registrar gastos en segundos y a Finanzas un centro de control transparente con validación en 1 clic.
- **Público Objetivo**: Empleados en comisión de servicio/viaje corporativo y analistas de Finanzas / Tesorería encargados de auditar y liquidar los viáticos.
- **Valor Agregado**: Flujo de aprobación en tiempo real, control riguroso de presupuesto con alertas de sobregiro, soporte de tasa BCV dinámica y exportación directa en formato CSV y vista imprimible membretada para auditoría.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Principales
1. **Flujo de Registro Ágil (Empleado)**:
   - Acceso con un toque al botón flotante `+ Registrar Gasto` o desde la pestaña de Registro.
   - Selección de Moneda (`USD $` o `Bs BCV`): cálculo instantáneo de la contravaloración según la tasa BCV del día.
   - Categorías predefinidas con iconografía clara: *Hospedaje, Alimentación, Transporte, Combustible, Otros*.
   - Adjuntar foto del ticket/factura con cámara/archivo, previsualización inmediata y recorte seguro.
   - Guardado local persistente con feedback visual inmediato (notificación toast de éxito).
2. **Flujo de Auditoría y Validación (Finanzas)**:
   - Panel de gastos pendientes con filtro por estado (*Pendiente*, *Aprobado*, *Observado*).
   - Apertura de comprobante con visor de imagen en alta resolución y zoom.
   - Aprobación en 1 toque o Rechazo/Observación con motivo descriptivo.
   - Edición de presupuesto asignado por proyecto/viaje con advertencias visuales de cumplimiento.
3. **Flujo de Reportería y Liquidación**:
   - Resumen gráfico del viaje (gráfico de donas SVG interactivo por categoría).
   - Barra de ejecución presupuestaria con semáforo dinámico (Verde < 80%, Ámbar 80-99%, Rojo $\ge$ 100%).
   - Exportación de datos limpios a archivo `.csv` compatible con Excel y generación de Hoja de Liquidación Imprimible / PDF con membrete corporativo y firmas de entrega y recepción.

### Identidad Visual y Estilo
- **Enfoque**: Mobile-First con adaptación natural a pantallas de escritorio (`max-w-6xl` centrado, barra lateral / navegación limpia).
- **Tipografía**: Jerarquía editorial moderna con fuentes sans legibles y números tabulares obligatorios (`tabular-nums font-mono`) para cifras financieras exactas sin temblor de layout.
- **Paleta de Colores**:
  - Fondo neutro estructurado: `#F8FAFC` (Slate 50) y blanco puro `#FFFFFF`.
  - Color primario corporativo: Azul índigo sobrio (`#1E3A8A` / `#2563EB`) para acciones primarias.
  - Indicadores semánticos: Verde esmeralda para gastos aprobados/presupuesto saludable, ámbar para pendientes/alertas, y carmesí para rechazados o sobregiros.
- **Ergonomía Táctil**: Botoneras y campos con altura mínima de $48\text{px}$, navegación inferior móvil tipo bottom-bar y modales de hoja inferior (*bottom-sheet*) para comodidad con una sola mano.

---

## 3. Decisiones de Producto y Mejoras Propuestas

| Propuesta / Decisión | Enfoque Seleccionado | Justificación |
| :--- | :--- | :--- |
| **Persistencia de Datos** | `localStorage` con esquema reactivo y precarga de datos de demostración realistas | Permite usar la aplicación de inmediato sin requerir configuración previa de backend, conservando datos entre recargas. |
| **Conversión Cambiaria BCV** | Tasa oficial actualizable desde cabecera + historial de tasa en cada gasto registrado | Garantiza que si la tasa cambia mañana, los gastos históricos conserven el tipo de cambio con el que fueron realizados. |
| **Gestión de Comprobantes** | File reader a Base64 comprimido + generador de recibos de prueba | Permite probar la cámara/archivos en móviles y desktops sin fallos de dependencias externas. |
| **Módulo de Reporte** | Generador CSV descargable + Plantilla de Liquidación HTML optimizada para `window.print()` | Solución 100% nativa que no requiere bibliotecas pesadas de PDF y funciona impecable en cualquier dispositivo. |

---

## 4. Arquitectura Técnica y Modelo de Datos

### Diagrama del Sistema y Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TopBar & Selector de Rol (Empleado / Finanzas)       │
│                   Badge Tasa BCV Dinámica (Editable en 1 clic)         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────┐  ┌────────────────────────────────────┐   │
│   │   Panel de Métricas    │  │       Desglose por Categoría       │   │
│   │  • Total Gastado ($/Bs)│  │   • Gráfico Donut SVG interactivo  │   │
│   │  • Presupuesto Asig.   │  │   • Porcentajes y montos por rubro │   │
│   │  • Barra de Ejecución  │  │                                    │   │
│   └────────────────────────┘  └────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │         Filtros Reactivos: Búsqueda · Categoría · Estado       │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │               Listado de Gastos & Comprobantes                 │   │
│   │   [Fecha] [Categoría] [Concepto] [Monto $ / Bs] [Comprobante]  │   │
│   │   [Empleado / Proyecto] [Acciones Finanzas: Aprobar / Observar]│   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │    Modales y Vistas:                                           │   │
│   │    • Modal Registro de Gasto con Captura de Foto               │   │
│   │    • Modal Visor de Comprobante con Zoom                       │   │
│   │    • Modal Hoja de Liquidación de Viáticos Imprimible          │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│       Navegación Móvil Bottom Bar (Dashboard · Gastos · +Nuevo)        │
└────────────────────────────────────────────────────────────────────────┘
```

### Estructura de Datos (TypeScript)

```typescript
export type ExpenseCategory = 
  | 'Hospedaje'
  | 'Alimentación'
  | 'Transporte'
  | 'Combustible'
  | 'Otros';

export type ExpenseCurrency = 'USD' | 'VES';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  date: string;               // ISO YYYY-MM-DD
  category: ExpenseCategory;
  concept: string;            // Descripción
  amount: number;             // Monto en moneda original
  currency: ExpenseCurrency;  // 'USD' | 'VES'
  bcvRate: number;            // Tasa BCV aplicada al momento del gasto
  amountUsd: number;          // Monto normalizado en USD
  amountVes: number;          // Monto normalizado en Bs
  employeeName: string;
  projectName: string;        // Proyecto o Viaje
  receiptUrl?: string;        // Base64 o URL de imagen de la factura
  status: ExpenseStatus;
  financeNotes?: string;      // Observación de finanzas en caso de rechazo/ajuste
  createdAt: number;
}

export interface TripBudget {
  projectName: string;
  totalBudgetUsd: number;
  startDate: string;
  endDate: string;
}
```

---

## 5. Plan de Verificación y Entregables

1. **Compilación y Cero Advertencias**:
   - Validación completa mediante `compile_applet`.
   - Compatibilidad total con TypeScript 7 y React 19.
2. **Pruebas de Flujo**:
   - Registro de nuevo gasto en USD y en Bs con cálculo de conversión automático.
   - Subida y previsualización de factura con ampliación.
   - Cambio de rol a Finanzas, aprobación y observación de gastos.
   - Filtrado dinámico por fecha, categoría y búsqueda de texto.
   - Exportación de CSV y apertura de la vista de liquidación lista para imprimir.
