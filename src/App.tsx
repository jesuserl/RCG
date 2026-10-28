import React, { useState, useEffect } from 'react';
import { 
  TripRelation, 
  Expense, 
  EmployeeProfile, 
  AuthSession, 
  PortalMode, 
  DEFAULT_ADMIN_TOKEN 
} from './types';
import { 
  loadRelations, 
  saveRelations, 
  loadExpenses, 
  saveExpenses, 
  loadEmployees,
  saveEmployees,
  loadAdminToken,
  saveAdminToken,
  loadSession,
  saveSession,
  clearSession
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
  updateRelationStatusInSupabase 
} from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { CheckCircle2, ShieldCheck, Briefcase } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [employees, setEmployees] = useState<EmployeeProfile[]>(() => loadEmployees());
  const [adminToken, setAdminToken] = useState<string>(() => loadAdminToken());
  const [relations, setRelations] = useState<TripRelation[]>(() => loadRelations());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());

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
    }, 3500);
  };

  // Sync from Supabase on mount if configured
  useEffect(() => {
    async function syncFromSupabase() {
      if (isSupabaseConfigured()) {
        const [cloudEmps, cloudRels, cloudExps] = await Promise.all([
          fetchEmployeesFromSupabase(),
          fetchRelationsFromSupabase(),
          fetchExpensesFromSupabase(),
        ]);
        if (cloudEmps && cloudEmps.length > 0) {
          setEmployees(cloudEmps);
        }
        if (cloudRels && cloudRels.length > 0) {
          setRelations(cloudRels);
        }
        if (cloudExps && cloudExps.length > 0) {
          setExpenses(cloudExps);
        }
      }
    }
    syncFromSupabase();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveRelations(relations);
  }, [relations]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

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
      token: adminToken,
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

  // Collaborator management
  const handleCreateEmployee = (newEmpData: Omit<EmployeeProfile, 'id'>) => {
    const newEmp: EmployeeProfile = {
      ...newEmpData,
      id: `emp-${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmp]);
    upsertEmployeeInSupabase(newEmp);
    showToast(`Colaborador ${newEmp.name} creado con token ${newEmp.token}`);
  };

  const handleUpdateEmployeeToken = (employeeId: string, newToken: string) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === employeeId) {
          const updated = { ...e, token: newToken };
          upsertEmployeeInSupabase(updated);
          return updated;
        }
        return e;
      })
    );
    showToast('Token de acceso actualizado.');
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    deleteEmployeeFromSupabase(employeeId);
    showToast('Colaborador eliminado.');
  };

  const handleUpdateAdminToken = (newToken: string) => {
    setAdminToken(newToken);
    saveAdminToken(newToken);
    showToast('Token de administrador actualizado con éxito.');
  };

  // Admin action: Create new trip relation
  const handleCreateRelation = (newRelData: Omit<TripRelation, 'id' | 'createdAt'>) => {
    const newRelation: TripRelation = {
      ...newRelData,
      id: `rel-${Date.now()}`,
      createdAt: Date.now(),
    };

    setRelations(prev => [newRelation, ...prev]);
    insertRelationInSupabase(newRelation);
    showToast(`Relación ${newRelation.code} creada y asignada a ${newRelation.employeeName} con éxito.`);
  };

  // Employee action: Register expense linked to relation
  const handleCreateExpense = (newExpData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
      createdAt: Date.now(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    insertExpenseInSupabase(newExpense);
    showToast('¡Comprobante de gasto cargado a la relación con éxito!');
  };

  // Employee action: Submit relation to finance
  const handleSubmitRelation = (relationId: string) => {
    setRelations(prev =>
      prev.map(r => (r.id === relationId ? { ...r, status: 'submitted' as const } : r))
    );
    updateRelationStatusInSupabase(relationId, 'submitted');
    showToast('¡Relación enviada a Finanzas para revisión y auditoría!');
  };

  // Admin action: Approve expense
  const handleApproveExpense = (id: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );
    updateExpenseStatusInSupabase(id, 'approved');
    showToast('Comprobante aprobado para liquidación contable.');
  };

  // Admin action: Reject / Observe expense
  const handleRejectExpense = (id: string, notes: string) => {
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
    updateExpenseStatusInSupabase(id, 'rejected', notes);
    showToast('Comprobante observado. Se notificó la observación al colaborador.');
  };

  // Admin action: Settle relation
  const handleSettleRelation = (relationId: string) => {
    setRelations(prev =>
      prev.map(r => (r.id === relationId ? { ...r, status: 'settled' as const } : r))
    );
    updateRelationStatusInSupabase(relationId, 'settled');
    showToast('Relación cerrada y liquidada conforme.');
  };

  // Active authenticated user profile
  const currentEmployeeProfile = session?.role === 'employee'
    ? employees.find(e => e.id === session.employeeId || e.name === session.employeeName) || employees[0]
    : undefined;

  // Relations available for the employee modal (STRICT ISOLATION)
  const relationsForModal = session?.role === 'employee'
    ? relations.filter(r => r.employeeName === currentEmployeeProfile?.name)
    : relations;

  // IF NOT AUTHENTICATED -> SHOW LOGIN SCREEN
  if (!session) {
    return (
      <LoginScreen
        employees={employees}
        adminToken={adminToken || DEFAULT_ADMIN_TOKEN}
        onLoginEmployee={handleLoginEmployee}
        onLoginAdmin={handleLoginAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* Top Bar with Brand, Identity Badge, and Logout */}
      <TopBar
        portalMode={session.role}
        currentEmployee={currentEmployeeProfile}
        onLogout={handleLogout}
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
                  Acceso confidencial. Crea asignaciones en Bolívares, emite tokens de colaboradores y audita liquidaciones.
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

          <button
            onClick={handleLogout}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cambiar de Usuario
          </button>
        </div>
      </div>

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
            onOpenCreateRelation={() => setIsCreateRelationModalOpen(true)}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onSettleRelation={handleSettleRelation}
            onViewReceipt={expense => setViewingReceiptExpense(expense)}
            onOpenPrintReport={rel => setPrintRelation(rel)}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployeeToken={handleUpdateEmployeeToken}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateAdminToken={handleUpdateAdminToken}
            onSyncSupabase={async () => {
              const [cloudEmps, cloudRels, cloudExps] = await Promise.all([
                fetchEmployeesFromSupabase(),
                fetchRelationsFromSupabase(),
                fetchExpensesFromSupabase(),
              ]);
              if (cloudEmps && cloudEmps.length > 0) setEmployees(cloudEmps);
              if (cloudRels && cloudRels.length > 0) setRelations(cloudRels);
              if (cloudExps && cloudExps.length > 0) setExpenses(cloudExps);
              showToast('Datos sincronizados exitosamente con Supabase.');
            }}
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
