import { supabase, isSupabaseConfigured, getSupabaseCredentials } from '../lib/supabase';
import { TripRelation, Expense, EmployeeProfile, SupabaseDiagnostics } from '../types';

/**
 * Mapeo de EmployeeProfile a employees (PostgreSQL)
 */
export function mapEmployeeToDb(emp: EmployeeProfile) {
  return {
    id: emp.id,
    name: emp.name,
    department: emp.department,
    position: emp.position,
    access_token: emp.token,
  };
}

export function mapEmployeeFromDb(row: any): EmployeeProfile {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    position: row.position,
    token: row.access_token || row.token || 'EMP-1000',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

/**
 * Mapeo de TripRelation (TypeScript) a trip_relations (PostgreSQL) en VES
 */
export function mapRelationToDb(rel: TripRelation) {
  return {
    id: rel.id,
    code: rel.code,
    title: rel.title,
    destination: rel.destination,
    employee_name: rel.employeeName,
    allocated_budget_ves: rel.allocatedBudget,
    start_date: rel.startDate,
    end_date: rel.endDate,
    status: rel.status,
    admin_notes: rel.adminNotes || null,
  };
}

/**
 * Mapeo de trip_relations (PostgreSQL) a TripRelation (TypeScript)
 */
export function mapRelationFromDb(row: any): TripRelation {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    destination: row.destination,
    employeeName: row.employee_name,
    allocatedBudget: parseFloat(row.allocated_budget_ves || row.allocated_budget_usd) || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    adminNotes: row.admin_notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

/**
 * Mapeo de Expense (TypeScript) a expenses (PostgreSQL) en VES
 */
export function mapExpenseToDb(exp: Expense) {
  return {
    id: exp.id,
    relation_id: exp.relationId,
    date: exp.date,
    category: exp.category,
    concept: exp.concept,
    amount: exp.amount,
    employee_name: exp.employeeName,
    project_name: exp.projectName,
    receipt_url: exp.receiptUrl || null,
    receipt_file_name: exp.receiptFileName || null,
    status: exp.status,
    finance_notes: exp.financeNotes || null,
  };
}

/**
 * Mapeo de expenses (PostgreSQL) a Expense (TypeScript)
 */
export function mapExpenseFromDb(row: any): Expense {
  return {
    id: row.id,
    relationId: row.relation_id,
    date: row.date,
    category: row.category,
    concept: row.concept,
    amount: parseFloat(row.amount || row.amount_ves) || 0,
    employeeName: row.employee_name,
    projectName: row.project_name,
    receiptUrl: row.receipt_url || undefined,
    receiptFileName: row.receipt_file_name || undefined,
    status: row.status,
    financeNotes: row.finance_notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

// -------------------------------------------------------------
// Diagnóstico y Verificación de Tablas en Supabase
// -------------------------------------------------------------

export async function fetchSupabaseDiagnostics(): Promise<SupabaseDiagnostics> {
  const creds = getSupabaseCredentials();
  const result: SupabaseDiagnostics = {
    connected: false,
    url: creds.url,
    projectId: creds.projectRef,
    employeesCount: 0,
    relationsCount: 0,
    expensesCount: 0,
    checkedAt: Date.now(),
  };

  if (!isSupabaseConfigured()) {
    result.error = 'Supabase no está configurado con URL o clave anónima válidas.';
    return result;
  }

  try {
    // 1. Probar tabla employees
    const empRes = await supabase.from('employees').select('id', { count: 'exact' });
    if (empRes.error) {
      result.error = `Error en tabla employees: ${empRes.error.message}. ¿Ejecutaste el script SQL en Supabase?`;
      return result;
    }
    result.employeesCount = empRes.count ?? (empRes.data ? empRes.data.length : 0);

    // 2. Probar tabla trip_relations
    const relRes = await supabase.from('trip_relations').select('id', { count: 'exact' });
    if (relRes.error) {
      result.error = `Error en tabla trip_relations: ${relRes.error.message}.`;
      return result;
    }
    result.relationsCount = relRes.count ?? (relRes.data ? relRes.data.length : 0);

    // 3. Probar tabla expenses
    const expRes = await supabase.from('expenses').select('id', { count: 'exact' });
    if (expRes.error) {
      result.error = `Error en tabla expenses: ${expRes.error.message}.`;
      return result;
    }
    result.expensesCount = expRes.count ?? (expRes.data ? expRes.data.length : 0);

    result.connected = true;
    return result;
  } catch (err: any) {
    result.error = err.message || 'Excepción al conectar con Supabase';
    return result;
  }
}

// -------------------------------------------------------------
// Sincronización Masiva: Subir datos locales a Supabase
// -------------------------------------------------------------

export async function syncLocalDataToSupabase(
  employees: EmployeeProfile[],
  relations: TripRelation[],
  expenses: Expense[]
): Promise<{
  success: boolean;
  employeesSaved: number;
  relationsSaved: number;
  expensesSaved: number;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      employeesSaved: 0,
      relationsSaved: 0,
      expensesSaved: 0,
      error: 'Supabase no está configurado.',
    };
  }

  try {
    // 1. Subir colaboradores
    let empsSaved = 0;
    if (employees.length > 0) {
      const empsPayload = employees.map(mapEmployeeToDb);
      const { error: empError } = await supabase.from('employees').upsert(empsPayload, { onConflict: 'id' });
      if (empError) throw new Error(`Colaboradores: ${empError.message}`);
      empsSaved = employees.length;
    }

    // 2. Subir relaciones de viaje
    let relsSaved = 0;
    if (relations.length > 0) {
      const relsPayload = relations.map(mapRelationToDb);
      const { error: relError } = await supabase.from('trip_relations').upsert(relsPayload, { onConflict: 'id' });
      if (relError) throw new Error(`Relaciones: ${relError.message}`);
      relsSaved = relations.length;
    }

    // 3. Subir comprobantes de gastos
    let expsSaved = 0;
    if (expenses.length > 0) {
      const expsPayload = expenses.map(mapExpenseToDb);
      const { error: expError } = await supabase.from('expenses').upsert(expsPayload, { onConflict: 'id' });
      if (expError) throw new Error(`Comprobantes de Gastos: ${expError.message}`);
      expsSaved = expenses.length;
    }

    return {
      success: true,
      employeesSaved: empsSaved,
      relationsSaved: relsSaved,
      expensesSaved: expsSaved,
    };
  } catch (err: any) {
    console.error('Error al sincronizar datos locales a Supabase:', err);
    return {
      success: false,
      employeesSaved: 0,
      relationsSaved: 0,
      expensesSaved: 0,
      error: err.message || 'Error desconocido al subir datos a Supabase',
    };
  }
}

// -------------------------------------------------------------
// Funciones de consulta y persistencia de Empleados en Supabase
// -------------------------------------------------------------

export async function fetchEmployeesFromSupabase(): Promise<EmployeeProfile[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error leyendo colaboradores de Supabase:', error.message);
      return null;
    }

    return (data || []).map(mapEmployeeFromDb);
  } catch (err) {
    console.warn('Excepción consultando colaboradores en Supabase:', err);
    return null;
  }
}

export async function upsertEmployeeInSupabase(employee: EmployeeProfile): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const payload = mapEmployeeToDb(employee);
    const { error } = await supabase.from('employees').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Error guardando colaborador en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando colaborador en Supabase:', err);
    return false;
  }
}

export async function deleteEmployeeFromSupabase(employeeId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);
    if (error) {
      console.error('Error eliminando colaborador en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción eliminando colaborador en Supabase:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Funciones de consulta y persistencia de Relaciones en Supabase
// -------------------------------------------------------------

export async function fetchRelationsFromSupabase(): Promise<TripRelation[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('trip_relations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error leyendo relaciones de Supabase:', error.message);
      return null;
    }

    return (data || []).map(mapRelationFromDb);
  } catch (err) {
    console.warn('Excepción consultando Supabase:', err);
    return null;
  }
}

export async function insertRelationInSupabase(relation: TripRelation): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const payload = mapRelationToDb(relation);
    const { error } = await supabase.from('trip_relations').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Error insertando relación en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando relación en Supabase:', err);
    return false;
  }
}

export async function updateRelationStatusInSupabase(relationId: string, status: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('trip_relations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', relationId);

    if (error) {
      console.error('Error actualizando estado de relación en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción actualizando relación en Supabase:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Funciones de consulta y persistencia de Gastos en Supabase
// -------------------------------------------------------------

export async function fetchExpensesFromSupabase(): Promise<Expense[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error leyendo gastos de Supabase:', error.message);
      return null;
    }

    return (data || []).map(mapExpenseFromDb);
  } catch (err) {
    console.warn('Excepción consultando gastos en Supabase:', err);
    return null;
  }
}

export async function insertExpenseInSupabase(expense: Expense): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const payload = mapExpenseToDb(expense);
    const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Error insertando gasto en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando gasto en Supabase:', err);
    return false;
  }
}

export async function updateExpenseStatusInSupabase(
  expenseId: string,
  status: 'approved' | 'rejected',
  financeNotes?: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('expenses')
      .update({
        status,
        finance_notes: financeNotes || null,
      })
      .eq('id', expenseId);

    if (error) {
      console.error('Error actualizando estado de gasto en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción actualizando gasto en Supabase:', err);
    return false;
  }
}
