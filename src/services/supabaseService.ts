import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TripRelation, Expense } from '../types';

/**
 * Mapeo de TripRelation (TypeScript) a trip_relations (PostgreSQL)
 */
function mapRelationToDb(rel: TripRelation) {
  return {
    id: rel.id,
    code: rel.code,
    title: rel.title,
    destination: rel.destination,
    employee_name: rel.employeeName,
    allocated_budget_usd: rel.allocatedBudgetUsd,
    currency: rel.currency,
    bcv_rate_at_creation: rel.bcvRateAtCreation,
    start_date: rel.startDate,
    end_date: rel.endDate,
    status: rel.status,
    admin_notes: rel.adminNotes || null,
  };
}

/**
 * Mapeo de trip_relations (PostgreSQL) a TripRelation (TypeScript)
 */
function mapRelationFromDb(row: any): TripRelation {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    destination: row.destination,
    employeeName: row.employee_name,
    allocatedBudgetUsd: parseFloat(row.allocated_budget_usd) || 0,
    currency: row.currency || 'USD',
    bcvRateAtCreation: parseFloat(row.bcv_rate_at_creation) || 52.85,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    adminNotes: row.admin_notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

/**
 * Mapeo de Expense (TypeScript) a expenses (PostgreSQL)
 */
function mapExpenseToDb(exp: Expense) {
  return {
    id: exp.id,
    relation_id: exp.relationId,
    date: exp.date,
    category: exp.category,
    concept: exp.concept,
    amount: exp.amount,
    currency: exp.currency,
    bcv_rate: exp.bcvRate,
    amount_usd: exp.amountUsd,
    amount_ves: exp.amountVes,
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
function mapExpenseFromDb(row: any): Expense {
  return {
    id: row.id,
    relationId: row.relation_id,
    date: row.date,
    category: row.category,
    concept: row.concept,
    amount: parseFloat(row.amount) || 0,
    currency: row.currency,
    bcvRate: parseFloat(row.bcv_rate) || 52.85,
    amountUsd: parseFloat(row.amount_usd) || 0,
    amountVes: parseFloat(row.amount_ves) || 0,
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
// Funciones de consulta y persistencia en Supabase
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
    const { error } = await supabase.from('trip_relations').upsert(payload);
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
    const { error } = await supabase.from('expenses').upsert(payload);
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
