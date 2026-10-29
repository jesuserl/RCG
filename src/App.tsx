import React, { useState, useEffect, useCallback } from 'react';
import { 
  TripRelation, 
  Expense, 
  EmployeeProfile, 
  AuthSession, 
  DEFAULT_ADMIN_TOKEN 
} from './types';
import { 
  loadAdminToken, 
  saveAdminToken, 
  loadSession, 
  saveSession, 
  clearSession,
  clearAllStorage 
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { EmployeePortal } from './components/EmployeePortal';
import { AdminPortal } from './components/AdminPortal';
import { LoginScreen } from './components/LoginScreen';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { CreateRelationModal } from './components/CreateRelationModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { PrintReportModal } from './components/PrintReportModal';
import { 
  fetchRelationsFromSupabase, 
  fetchExpensesFromSupabase, 
  fetchEmployeesFromSupabase,
  insertRelationInSupabase, 
  insertExpenseInSupabase, 
  upsertEmployeeInSupabase,
  deleteEmployeeFromSupabase,
  updateExpenseStatusInSupabase, 
  updateRelationStatusInSupabase,
  deleteRelationFromSupabase,
  seedInitialDataToSupabase,
  clearAllSupabaseData
} from './services/supabaseService';
import { 
  isSupabaseConfigured, 
  getSupabaseCredentials 
} from './lib/supabase';
import { CheckCircle2, ShieldCheck, Briefcase, RefreshCw, AlertCircle, Cloud } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [adminToken, setAdminToken] = useState<string>(() => loadAdminToken());
  const [relations, setRelations] = useState<TripRelation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Loading and sync states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [targetRelationIdForExpense, setTargetRelationIdForExpense] = useState<string | undefined>(undefined);
  const [isCreateRelationModalOpen, setIsCreateRelationModalOpen] = useState(false);
  const [printRelation, setPrintRelation] = useState<TripRelation | null>(null);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pure Supabase Data Fetcher
  const loadDataFromSupabase = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setDbError(null);

    try {
      if (!isSupabaseConfigured()) {
        setDbError('Supabase no está configurado. Por favor verifica las credenciales en .env');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const [cloudEmps, cloudRels, cloudExps] = await Promise.all([
        fetchEmployeesFromSupabase(),
        fetchRelationsFromSupabase(),
        fetchExpensesFromSupabase(),
      ]);

      if (cloudEmps === null && cloudRels === null) {
        setDbError('No se pudo conectar a las tablas de Supabase. Asegúrate de haber ejecutado el script SQL.');
      } else {
        setEmployees(cloudEmps || []);
        setRelations(cloudRels || []);
        setExpenses(cloudExps || []);
      }
    } catch (err: any) {
      console.error('Error cargando datos desde Supabase:', err);
      setDbError(err.message || 'Error de conexión con Supabase');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Hydrate strictly from Supabase on mount
  useEffect(() => {
    loadDataFromSupabase(true);
  }, [loadDataFromSupabase]);

  // One-Click Seed to Supabase (Seeds PostgreSQL database directly)
  const handleSeedSupabaseData = async (): Promise<{ success: boolean; message: string }> => {
    setIsSeeding(true);
    try {
      showToast('Inicializando tablas en Supabase con datos base en Bolívares (VES)...');
      const res = await seedInitialDataToSupabase();
      if (res.success) {
        await loadDataFromSupabase(false);
        const msg = `¡Éxito! Se crearon ${res.employeesSaved} colaboradores, ${res.relationsSaved} relaciones y ${res.expensesSaved} gastos directamente en Supabase.`;
        showToast(msg);
        return { success: true, message: msg };
      } else {
        const errorMsg = `Error al sembrar en Supabase: ${res.error}. ¿Ejecutaste el script SQL?`;
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = `Fallo al inicializar: ${err.message}`;
      showToast(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsSeeding(false);
    }
  };

  // Ensure stored admin token is migrated if user had legacy token
  useEffect(() => {
    const stored = loadAdminToken();
    if (!stored || stored === 'ADMIN-2026') {
      saveAdminToken(DEFAULT_ADMIN_TOKEN);
      setAdminToken(DEFAULT_ADMIN_TOKEN);
    }
  }, []);

  // Wipe all tables in Supabase and localStorage, leaving only Admin with admindc2026*
  const handleClearAllData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      showToast('Eliminando todos los registros en Supabase (PostgreSQL)...');
      const res = await clearAllSupabaseData();
      clearAllStorage();
      setEmployees([]);
      setRelations([]);
      setExpenses([]);
      setAdminToken(DEFAULT_ADMIN_TOKEN);
      saveAdminToken(DEFAULT_ADMIN_TOKEN);

      if (res.success) {
        const msg = '¡Tablas vaciadas con éxito! Todos los datos han sido eliminados. Solo queda el Administrador con la clave admindc2026*.';
        showToast(msg);
        return { success: true, message: msg };
      } else {
        const msg = `Almacenamiento local limpiado. Supabase reportó: ${res.error}`;
        showToast(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = `Error al vaciar datos: ${err.message}`;
      showToast(msg);
      return { success: false, message: msg };
    }
  };

  // Auth actions
  const handleLoginEmployee = (emp: EmployeeProfile) => {
    const newSession: AuthSession = {
      role: 'employee',
      employeeId: emp.id,
      employeeName: emp.name,
      token: emp.token,
      loginTime: Date.now(),
    };
    setSession(newSession);
    saveSession(newSession);
    showToast(`Bienvenido al Portal, ${emp.name}`);
  };

  const handleLoginAdmin = () => {
    const newSession: AuthSession = {
      role: 'admin',
      token: adminToken || DEFAULT_ADMIN_TOKEN,
      loginTime: Date.now(),
    };
    setSession(newSession);
    saveSession(newSession);
    showToast('Acceso autorizado a Panel de Administración y Finanzas');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    showToast('Sesión cerrada correctamente.');
  };

  // Collaborator management (Strict Supabase persistence)
  const handleCreateEmployee = async (newEmpData: Omit<EmployeeProfile, 'id'>) => {
    const newEmp: EmployeeProfile = {
      ...newEmpData,
      id: `emp-${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmp]);
    
    const res = await upsertEmployeeInSupabase(newEmp);
    if (res.success) {
      showToast(`Colaborador ${newEmp.name} creado y persistido en Supabase.`);
    } else {
      showToast(`Error guardando en Supabase: ${res.error}`);
    }
  };

  const handleUpdateEmployeeToken = async (employeeId: string, newToken: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const updated = { ...emp, token: newToken };
    setEmployees(prev => prev.map(e => (e.id === employeeId ? updated : e)));

    const res = await upsertEmployeeInSupabase(updated);
    if (res.success) {
      showToast(`Token de ${updated.name} actualizado en Supabase.`);
    } else {
      showToast(`Error actualizando token en Supabase: ${res.error}`);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    const res = await deleteEmployeeFromSupabase(employeeId);
    if (res.success) {
      showToast('Colaborador eliminado de Supabase.');
    } else {
      showToast(`Error eliminando en Supabase: ${res.error}`);
    }
  };

  const handleUpdateAdminToken = (newToken: string) => {
    setAdminToken(newToken);
    saveAdminToken(newToken);
    showToast('Token de administrador actualizado con éxito.');
  };

  // Admin action: Create new trip relation (Strict Supabase persistence)
  const handleCreateRelation = async (newRelData: Omit<TripRelation, 'id' | 'createdAt'>) => {
    const newRelation: TripRelation = {
      ...newRelData,
      id: `rel-${Date.now()}`,
      createdAt: Date.now(),
    };

    setRelations(prev => [newRelation, ...prev]);
    const res = await insertRelationInSupabase(newRelation);
    if (res.success) {
      showToast(`Relación ${newRelation.code} creada y guardada en Supabase.`);
    } else {
      showToast(`Error guardando relación en Supabase: ${res.error}`);
    }
  };

  // Employee action: Register expense linked to relation (Strict Supabase persistence)
  const handleCreateExpense = async (newExpData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
      createdAt: Date.now(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    const res = await insertExpenseInSupabase(newExpense);
    if (res.success) {
      showToast('¡Comprobante de gasto guardado persistentemente en Supabase!');
    } else {
      showToast(`Error guardando comprobante en Supabase: ${res.error}`);
    }
  };

  // Employee action: Submit relation to finance
  const handleSubmitRelation = async (relationId: string) => {
    setRelations(prev =>
      prev.map(r => (r.id === relationId ? { ...r, status: 'submitted' as const } : r))
    );
    const res = await updateRelationStatusInSupabase(relationId, 'submitted');
    if (res.success) {
      showToast('¡Relación enviada a Finanzas y actualizada en Supabase!');
    } else {
      showToast(`Error actualizando relación en Supabase: ${res.error}`);
    }
  };

  // Admin action: Approve expense
  const handleApproveExpense = async (id: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );
    const res = await updateExpenseStatusInSupabase(id, 'approved');
    if (res.success) {
      showToast('Comprobante aprobado y liquidado en Supabase.');
    } else {
      showToast(`Error aprobando en Supabase: ${res.error}`);
    }
  };

  // Admin action: Reject / Observe expense
  const handleRejectExpense = async (id: string, notes: string) => {
    setExpenses(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              status: 'rejected' as const,
              financeNotes: notes,
            }
          : e
      )
    );
    const res = await updateExpenseStatusInSupabase(id, 'rejected', notes);
    if (res.success) {
      showToast('Comprobante observado y registrado en Supabase.');
    } else {
      showToast(`Error registrando observación en Supabase: ${res.error}`);
    }
  };

  // Admin action: Settle relation
  const handleSettleRelation = async (relationId: string) => {
    setRelations(prev =>
      prev.map(r => (r.id === relationId ? { ...r, status: 'settled' as const } : r))
    );
    const res = await updateRelationStatusInSupabase(relationId, 'settled');
    if (res.success) {
      showToast('Relación cerrada y liquidada en Supabase.');
    } else {
      showToast(`Error cerrando relación en Supabase: ${res.error}`);
    }
  };

  // Admin action: Delete relation and cascade delete its expenses
  const handleDeleteRelation = async (relationId: string) => {
    // Optimistic UI updates
    setRelations(prev => prev.filter(r => r.id !== relationId));
    setExpenses(prev => prev.filter(e => e.relationId !== relationId));

    const res = await deleteRelationFromSupabase(relationId);
    if (res.success) {
      showToast('Relación de viaje y comprobantes eliminados de Supabase.');
    } else {
      showToast(`Error eliminando relación en Supabase: ${res.error}`);
      // Reload on failure to restore consistency
      await loadDataFromSupabase(false);
    }
  };

  // Active authenticated user profile
  const currentEmployeeProfile = session?.role === 'employee'
    ? employees.find(e => e.id === session.employeeId || e.name === session.employeeName) || employees[0]
    : undefined;

  // Relations available for the employee modal (STRICT ISOLATION)
  const relationsForModal = session?.role === 'employee'
    ? relations.filter(r => r.employeeName === currentEmployeeProfile?.name)
    : relations;

  // Supabase credentials info
  const creds = getSupabaseCredentials();

  // LOADING SCREEN WHILE CONNECTING TO SUPABASE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/30 mb-4 animate-pulse">
          V
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">ViáticosPro</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cargando datos desde la Base de Datos Supabase (PostgreSQL)...
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/70 px-3.5 py-1.5 rounded-full shadow-sm">
          <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{creds.projectRef}.supabase.co</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    );
  }

  // IF NOT AUTHENTICATED -> SHOW LOGIN SCREEN
  if (!session) {
    return (
      <LoginScreen
        employees={employees}
        adminToken={adminToken || DEFAULT_ADMIN_TOKEN}
        onLoginEmployee={handleLoginEmployee}
        onLoginAdmin={handleLoginAdmin}
        onSeedDatabase={handleSeedSupabaseData}
        isSeeding={isSeeding}
        projectRef={creds.projectRef}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* Top Bar with Brand, Identity Badge, Supabase Live Status, and Logout */}
      <TopBar
        portalMode={session.role}
        currentEmployee={currentEmployeeProfile}
        onLogout={handleLogout}
        isSupabaseReady={isSupabaseConfigured()}
        projectRef={creds.projectRef}
        onRefreshData={() => loadDataFromSupabase(false)}
        isRefreshing={isRefreshing}
      />

      {/* Security & Access Strip */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-2 text-xs no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {session.role === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-950">Panel de Administración y Finanzas:</span>
                <span className="text-slate-600 hidden sm:inline">
                  Acceso confidencial. Crea asignaciones en Bolívares (VES), emite tokens de colaboradores y audita liquidaciones.
                </span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-blue-950">Portal Exclusivo del Colaborador:</span>
                <span className="text-slate-600 hidden sm:inline">
                  Acceso restringido a tus viajes y asignaciones de fondos en Bolívares (Bs. VES).
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDataFromSupabase(false)}
              disabled={isRefreshing}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
              title="Refrescar datos desde Supabase"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Sincronizar Supabase'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cambiar de Usuario
            </button>
          </div>
        </div>
      </div>

      {/* DB Connection Alert if error */}
      {dbError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{dbError}</span>
            </div>
            <button
              onClick={() => loadDataFromSupabase(false)}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-xs shrink-0 cursor-pointer"
            >
              Reintentar Conexión
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex-1">
        {session.role === 'employee' && currentEmployeeProfile ? (
          /* PORTAL INDEPENDIENTE DEL EMPLEADO */
          <EmployeePortal
            currentEmployee={currentEmployeeProfile}
            relations={relations}
            expenses={expenses}
            onOpenNewExpense={relationId => {
              setTargetRelationIdForExpense(relationId);
              setIsExpenseModalOpen(true);
            }}
            onViewReceipt={expense => setViewingReceiptExpense(expense)}
            onSubmitRelation={handleSubmitRelation}
          />
        ) : (
          /* PANEL INDEPENDIENTE DEL ADMINISTRADOR / FINANZAS */
          <AdminPortal
            relations={relations}
            expenses={expenses}
            employees={employees}
            adminToken={adminToken}
            onLoadFromSupabase={() => loadDataFromSupabase(false)}
            onSeedInitialData={handleSeedSupabaseData}
            onOpenCreateRelation={() => setIsCreateRelationModalOpen(true)}
            onDeleteRelation={handleDeleteRelation}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onSettleRelation={handleSettleRelation}
            onViewReceipt={expense => setViewingReceiptExpense(expense)}
            onOpenPrintReport={rel => setPrintRelation(rel)}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployeeToken={handleUpdateEmployeeToken}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateAdminToken={handleUpdateAdminToken}
            onSyncSupabase={() => loadDataFromSupabase(false)}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium border border-slate-800 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setTargetRelationIdForExpense(undefined);
        }}
        onSave={handleCreateExpense}
        relations={relationsForModal}
        activeRelationId={targetRelationIdForExpense}
        currentEmployeeName={currentEmployeeProfile?.name || ''}
      />

      <CreateRelationModal
        isOpen={isCreateRelationModalOpen}
        onClose={() => setIsCreateRelationModalOpen(false)}
        onSave={handleCreateRelation}
        employees={employees}
      />

      {viewingReceiptExpense && (
        <ReceiptViewerModal
          isOpen={!!viewingReceiptExpense}
          onClose={() => setViewingReceiptExpense(null)}
          receiptUrl={viewingReceiptExpense.receiptUrl}
          concept={viewingReceiptExpense.concept}
          amount={viewingReceiptExpense.amount}
          date={viewingReceiptExpense.date}
          fileName={viewingReceiptExpense.receiptFileName}
        />
      )}

      {printRelation && (
        <PrintReportModal
          isOpen={!!printRelation}
          onClose={() => setPrintRelation(null)}
          relation={printRelation}
          expenses={expenses}
        />
      )}
    </div>
  );
}
