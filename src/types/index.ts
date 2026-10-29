export type ExpenseCategory = 
  | 'Hospedaje'
  | 'Alimentación'
  | 'Transporte'
  | 'Combustible'
  | 'Otros';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export type RelationStatus = 'open' | 'submitted' | 'settled';

export interface TripRelation {
  id: string;                 // ej. "REL-2026-001"
  code: string;               // ej. "REL-001"
  title: string;              // Nombre del Viaje / Proyecto / Comisión
  destination: string;        // Ciudad o locación
  employeeName: string;       // Empleado responsable
  allocatedBudget: number;    // Monto asignado por el Administrador en Bolívares (Bs. VES)
  startDate: string;
  endDate: string;
  status: RelationStatus;     // 'open' (abierta para registrar) | 'submitted' (rendida a finanzas) | 'settled' (liquidada)
  adminNotes?: string;        // Instrucciones del administrador
  createdAt: number;
}

export interface Expense {
  id: string;
  relationId: string;         // Relación a la que pertenece este gasto
  date: string;               // YYYY-MM-DD
  category: ExpenseCategory;
  concept: string;            // Descripción
  amount: number;             // Monto del gasto en Bolívares (Bs. VES)
  employeeName: string;
  projectName: string;        // Nombre de la relación/viaje
  receiptUrl?: string;        // Data URL Base64 o URL
  receiptFileName?: string;
  status: ExpenseStatus;      // Estado de aprobación
  financeNotes?: string;      // Observación de Finanzas
  createdAt: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  department: string;
  position: string;
  token: string;              // Token secreto de acceso del colaborador (ej. EMP-1024)
  createdAt?: number;
}

export interface AuthSession {
  role: 'employee' | 'admin';
  employeeId?: string;
  employeeName?: string;
  token: string;
  loginTime: number;
}

export type PortalMode = 'login' | 'employee' | 'admin';

export type UserRole = 'employee' | 'finance';

export type DataSourceMode = 'supabase' | 'local';

export interface SupabaseDiagnostics {
  connected: boolean;
  url: string;
  projectId: string;
  employeesCount: number;
  relationsCount: number;
  expensesCount: number;
  error?: string;
  checkedAt: number;
}

export const DEFAULT_ADMIN_TOKEN = 'admindc2026*';

