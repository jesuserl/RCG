import { Expense, TripRelation, EmployeeProfile, PortalMode } from '../types';
import { generateSampleReceiptSvg } from './sampleReceipts';

const STORAGE_KEY_RELATIONS = 'viaticos_relations_v2';
const STORAGE_KEY_EXPENSES = 'viaticos_expenses_v2';
const STORAGE_KEY_BCV_RATE = 'viaticos_bcv_rate_v2';
const STORAGE_KEY_PORTAL_MODE = 'viaticos_portal_mode_v2';
const STORAGE_KEY_CURRENT_EMPLOYEE = 'viaticos_current_employee_v2';

export const DEFAULT_BCV_RATE = 52.85;

export const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'emp-01',
    name: 'Jesús R. López',
    department: 'Operaciones e Ingeniería',
    position: 'Ingeniero de Proyectos Senior',
  },
  {
    id: 'emp-02',
    name: 'Mariana Rondón',
    department: 'Comercial y Ventas',
    position: 'Líder de Cuentas Corporativas',
  },
  {
    id: 'emp-03',
    name: 'Carlos Mendoza',
    department: 'Tecnología e Infraestructura',
    position: 'Especialista en Sistemas',
  },
];

export const INITIAL_RELATIONS: TripRelation[] = [
  {
    id: 'rel-valencia-001',
    code: 'REL-2026-001',
    title: 'Auditoría Planta Valencia - Q4',
    destination: 'Valencia, Carabobo',
    employeeName: 'Jesús R. López',
    allocatedBudgetUsd: 450.00,
    currency: 'USD',
    bcvRateAtCreation: 52.85,
    startDate: '2026-10-24',
    endDate: '2026-10-29',
    status: 'open',
    adminNotes: 'Viáticos autorizados para inspección técnica en planta. Hospedaje y traslado incluidos.',
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
  },
  {
    id: 'rel-barquisimeto-002',
    code: 'REL-2026-002',
    title: 'Gira Comercial Clientes Barquisimeto',
    destination: 'Barquisimeto, Lara',
    employeeName: 'Mariana Rondón',
    allocatedBudgetUsd: 320.00,
    currency: 'USD',
    bcvRateAtCreation: 52.85,
    startDate: '2026-10-20',
    endDate: '2026-10-23',
    status: 'submitted',
    adminNotes: 'Reunión de renovación de contratos anuales. Gastos de alimentación y combustible.',
    createdAt: Date.now() - 1000 * 60 * 60 * 140,
  },
  {
    id: 'rel-maracaibo-003',
    code: 'REL-2026-003',
    title: 'Mantenimiento Preventivo Data Center',
    destination: 'Maracaibo, Zulia',
    employeeName: 'Carlos Mendoza',
    allocatedBudgetUsd: 600.00,
    currency: 'USD',
    bcvRateAtCreation: 52.85,
    startDate: '2026-10-10',
    endDate: '2026-10-14',
    status: 'settled',
    adminNotes: 'Intervención de emergencia en racks de comunicaciones. Liquidado conforme.',
    createdAt: Date.now() - 1000 * 60 * 60 * 300,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    relationId: 'rel-valencia-001',
    date: '2026-10-24',
    category: 'Transporte',
    concept: 'Boleto de traslado terrestre ejecutivo Caracas - Valencia',
    amount: 35.00,
    currency: 'USD',
    bcvRate: 52.85,
    amountUsd: 35.00,
    amountVes: 35.00 * 52.85,
    employeeName: 'Jesús R. López',
    projectName: 'Auditoría Planta Valencia - Q4',
    receiptUrl: generateSampleReceiptSvg('Transportes Expresos Los Llanos C.A.', 'Transporte', 'Boleto ejecutivo Caracas-Valencia', 35.00, 'USD', '2026-10-24', 'F-004821'),
    receiptFileName: 'factura_transporte_ida.pdf',
    status: 'approved',
    financeNotes: 'Tarifa corporativa estándar aprobada.',
    createdAt: Date.now() - 1000 * 60 * 60 * 90,
  },
  {
    id: 'exp-02',
    relationId: 'rel-valencia-001',
    date: '2026-10-25',
    category: 'Hospedaje',
    concept: 'Hotel Guaparo Inn (2 noches con desayuno incluido)',
    amount: 140.00,
    currency: 'USD',
    bcvRate: 52.85,
    amountUsd: 140.00,
    amountVes: 140.00 * 52.85,
    employeeName: 'Jesús R. López',
    projectName: 'Auditoría Planta Valencia - Q4',
    receiptUrl: generateSampleReceiptSvg('Hotel Guaparo Inn C.A.', 'Hospedaje', 'Hospedaje 2 noches hab. ejecutiva', 140.00, 'USD', '2026-10-25', 'H-992314'),
    receiptFileName: 'hotel_guaparo_factura.jpg',
    status: 'approved',
    financeNotes: 'Comprobante fiscal verificado.',
    createdAt: Date.now() - 1000 * 60 * 60 * 70,
  },
  {
    id: 'exp-03',
    relationId: 'rel-valencia-001',
    date: '2026-10-25',
    category: 'Alimentación',
    concept: 'Almuerzo de trabajo con equipo técnico de planta',
    amount: 1480.00,
    currency: 'VES',
    bcvRate: 52.85,
    amountUsd: 1480.00 / 52.85,
    amountVes: 1480.00,
    employeeName: 'Jesús R. López',
    projectName: 'Auditoría Planta Valencia - Q4',
    receiptUrl: generateSampleReceiptSvg('Restaurant El Mesón Criollo', 'Alimentación', 'Almuerzo ejecutivo 3 personas', 1480.00, 'VES', '2026-10-25', 'REC-77312'),
    receiptFileName: 'almuerzo_meson.jpg',
    status: 'pending',
    financeNotes: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 45,
  },
  {
    id: 'exp-04',
    relationId: 'rel-valencia-001',
    date: '2026-10-26',
    category: 'Combustible',
    concept: 'Carga de combustible para unidad vehicular en ruta',
    amount: 25.00,
    currency: 'USD',
    bcvRate: 52.85,
    amountUsd: 25.00,
    amountVes: 25.00 * 52.85,
    employeeName: 'Jesús R. López',
    projectName: 'Auditoría Planta Valencia - Q4',
    receiptUrl: generateSampleReceiptSvg('Estación de Servicio La Encrucijada', 'Combustible', '50 Lts Gasolina Premium', 25.00, 'USD', '2026-10-26', 'E-551029'),
    receiptFileName: 'ticket_gasolina.png',
    status: 'approved',
    financeNotes: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'exp-05',
    relationId: 'rel-barquisimeto-002',
    date: '2026-10-21',
    category: 'Hospedaje',
    concept: 'Hotel Trinitarias Suites (Hospedaje comercial 2 noches)',
    amount: 180.00,
    currency: 'USD',
    bcvRate: 52.85,
    amountUsd: 180.00,
    amountVes: 180.00 * 52.85,
    employeeName: 'Mariana Rondón',
    projectName: 'Gira Comercial Clientes Barquisimeto',
    receiptUrl: generateSampleReceiptSvg('Trinitarias Suites C.A.', 'Hospedaje', 'Hospedaje Corporativo 2 noches', 180.00, 'USD', '2026-10-21', 'TS-44120'),
    receiptFileName: 'hotel_trinitarias.jpg',
    status: 'approved',
    financeNotes: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
  },
  {
    id: 'exp-06',
    relationId: 'rel-barquisimeto-002',
    date: '2026-10-22',
    category: 'Alimentación',
    concept: 'Cena con representantes de Distribuidora Centro',
    amount: 45.00,
    currency: 'USD',
    bcvRate: 52.85,
    amountUsd: 45.00,
    amountVes: 45.00 * 52.85,
    employeeName: 'Mariana Rondón',
    projectName: 'Gira Comercial Clientes Barquisimeto',
    receiptUrl: generateSampleReceiptSvg('Restaurant Tiuna Gourmet', 'Alimentación', 'Cena corporativa', 45.00, 'USD', '2026-10-22', 'TG-1002'),
    receiptFileName: 'cena_tiuna.jpg',
    status: 'pending',
    financeNotes: 'Pendiente revisar si incluye bebidas alcohólicas.',
    createdAt: Date.now() - 1000 * 60 * 60 * 95,
  },
];

export function loadRelations(): TripRelation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RELATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RELATIONS, JSON.stringify(INITIAL_RELATIONS));
      return INITIAL_RELATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error cargando relaciones', e);
    return INITIAL_RELATIONS;
  }
}

export function saveRelations(relations: TripRelation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RELATIONS, JSON.stringify(relations));
  } catch (e) {
    console.error('Error guardando relaciones', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error cargando gastos', e);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error guardando gastos', e);
  }
}

export function loadBcvRate(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BCV_RATE);
    if (!raw) return DEFAULT_BCV_RATE;
    const rate = parseFloat(raw);
    return isNaN(rate) || rate <= 0 ? DEFAULT_BCV_RATE : rate;
  } catch {
    return DEFAULT_BCV_RATE;
  }
}

export function saveBcvRate(rate: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_BCV_RATE, rate.toString());
  } catch (e) {
    console.error('Error guardando tasa BCV', e);
  }
}

export function loadPortalMode(): PortalMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PORTAL_MODE);
    if (raw === 'employee' || raw === 'admin') return raw;
    return 'employee'; // Por defecto iniciamos con portal de empleado o con selector
  } catch {
    return 'employee';
  }
}

export function savePortalMode(mode: PortalMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_PORTAL_MODE, mode);
  } catch (e) {
    console.error('Error guardando portal mode', e);
  }
}

export function loadCurrentEmployee(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_EMPLOYEE);
    if (raw) return raw;
    return INITIAL_EMPLOYEES[0].name;
  } catch {
    return INITIAL_EMPLOYEES[0].name;
  }
}

export function saveCurrentEmployee(employeeName: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_EMPLOYEE, employeeName);
  } catch (e) {
    console.error('Error guardando empleado activo', e);
  }
}
