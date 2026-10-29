import { Expense, TripRelation, EmployeeProfile, AuthSession, DEFAULT_ADMIN_TOKEN } from '../types';

const STORAGE_KEY_RELATIONS = 'viaticos_relations_ves_v4';
const STORAGE_KEY_EXPENSES = 'viaticos_expenses_ves_v4';
const STORAGE_KEY_EMPLOYEES = 'viaticos_employees_ves_v4';
const STORAGE_KEY_SESSION = 'viaticos_auth_session_ves_v4';
const STORAGE_KEY_ADMIN_TOKEN = 'viaticos_admin_token_ves_v4';

export const INITIAL_EMPLOYEES: EmployeeProfile[] = [];

export const INITIAL_RELATIONS: TripRelation[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RELATIONS);
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, DEFAULT_ADMIN_TOKEN);
  } catch (e) {
    console.error('Error limpiando almacenamiento local', e);
  }
}

export function loadEmployees(): EmployeeProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: any, idx: number) => ({
      ...e,
      token: e.token || `EMP-${(idx + 1) * 1000}`,
    }));
  } catch (e) {
    console.error('Error cargando colaboradores', e);
    return [];
  }
}

export function saveEmployees(employees: EmployeeProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  } catch (e) {
    console.error('Error guardando colaboradores', e);
  }
}

export function loadAdminToken(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
    // If old placeholder token was saved, upgrade to the requested admindc2026*
    if (!raw || raw === 'ADMIN-2026') {
      localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, DEFAULT_ADMIN_TOKEN);
      return DEFAULT_ADMIN_TOKEN;
    }
    return raw;
  } catch {
    return DEFAULT_ADMIN_TOKEN;
  }
}

export function saveAdminToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token);
  } catch (e) {
    console.error('Error guardando token de admin', e);
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error guardando sesión', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Error limpiando sesión', e);
  }
}

export function loadRelations(): TripRelation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RELATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error cargando relaciones', e);
    return [];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error cargando gastos', e);
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error guardando gastos', e);
  }
}

