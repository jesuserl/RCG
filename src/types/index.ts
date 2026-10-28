export type ExpenseCategory = 
  | 'Hospedaje'
  | 'Alimentación'
  | 'Transporte'
  | 'Combustible'
  | 'Otros';

export type ExpenseCurrency = 'USD' | 'VES';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export type RelationStatus = 'open' | 'submitted' | 'settled';

export interface TripRelation {
  id: string;                 // ej. "REL-2026-001"
  code: string;               // ej. "REL-001"
  title: string;              // Nombre del Viaje / Proyecto / Comisión
  destination: string;        // Ciudad o locación
  employeeName: string;       // Empleado responsable
  allocatedBudgetUsd: number; // Monto asignado por el Administrador en USD
  currency: ExpenseCurrency;  // Moneda base asignada
  bcvRateAtCreation: number;  // Tasa BCV al momento de asignación
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
  amount: number;             // Monto en moneda original
  currency: ExpenseCurrency;  // 'USD' | 'VES'
  bcvRate: number;            // Tasa oficial BCV usada
  amountUsd: number;          // Monto normalizado en USD
  amountVes: number;          // Monto normalizado en Bs
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
}

export type PortalMode = 'login' | 'employee' | 'admin';

export type UserRole = 'employee' | 'finance';

export type TripProject = TripRelation;
