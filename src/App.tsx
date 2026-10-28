import React, { useState, useEffect } from 'react';
import { TripRelation, Expense, EmployeeProfile, PortalMode } from './types';
import { 
  loadRelations, 
  saveRelations, 
  loadExpenses, 
  saveExpenses, 
  loadBcvRate, 
  saveBcvRate, 
  loadPortalMode, 
  savePortalMode,
  loadCurrentEmployee,
  saveCurrentEmployee,
  INITIAL_EMPLOYEES 
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { EmployeePortal } from './components/EmployeePortal';
import { AdminPortal } from './components/AdminPortal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { CreateRelationModal } from './components/CreateRelationModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { PrintReportModal } from './components/PrintReportModal';
import { BcvRateModal } from './components/BcvRateModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { 
  fetchRelationsFromSupabase, 
  fetchExpensesFromSupabase, 
  insertRelationInSupabase, 
  insertExpenseInSupabase, 
  updateExpenseStatusInSupabase, 
  updateRelationStatusInSupabase 
} from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { CheckCircle2, ShieldAlert, Lock, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';

export default function App() {
  const [portalMode, setPortalMode] = useState<PortalMode>(() => loadPortalMode());
  const [relations, setRelations] = useState<TripRelation[]>(() => loadRelations());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [bcvRate, setBcvRate] = useState<number>(() => loadBcvRate());
  const [employees] = useState<EmployeeProfile[]>(INITIAL_EMPLOYEES);
  const [currentEmployeeName, setCurrentEmployeeName] = useState<string>(() => loadCurrentEmployee());
  const [currencyDisplay, setCurrencyDisplay] = useState<'USD' | 'VES'>('USD');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [targetRelationIdForExpense, setTargetRelationIdForExpense] = useState<string | undefined>(undefined);
  const [isCreateRelationModalOpen, setIsCreateRelationModalOpen] = useState(false);
  const [isBcvModalOpen, setIsBcvModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [printRelation, setPrintRelation] = useState<TripRelation | null>(null);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  // Sync from Supabase on mount if configured
  useEffect(() => {
    async function syncFromSupabase() {
      if (isSupabaseConfigured()) {
        const [cloudRels, cloudExps] = await Promise.all([
          fetchRelationsFromSupabase(),
          fetchExpensesFromSupabase(),
        ]);
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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to local storage
  useEffect(() => {
    saveRelations(relations);
  }, [relations]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const handleChangePortalMode = (mode: PortalMode) => {
    setPortalMode(mode);
    savePortalMode(mode);
    showToast(
      mode === 'admin'
        ? 'Accediendo al Panel de Administración y Finanzas'
        : `Accediendo al Portal del Empleado (${currentEmployeeName})`
    );
  };

  const handleChangeEmployeeProfile = (name: string) => {
    setCurrentEmployeeName(name);
    saveCurrentEmployee(name);
    showToast(`Cambiado a perfil de colaborador: ${name}`);
  };

  const handleSaveBcvRate = (newRate: number) => {
    setBcvRate(newRate);
    saveBcvRate(newRate);
    showToast(`Tasa oficial BCV actualizada a ${newRate.toFixed(2)} Bs./USD`);
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

  // Employee object for current selected user
  const currentEmployeeProfile =
    employees.find(e => e.name === currentEmployeeName) || employees[0];

  // Relations available for the employee modal
  const relationsForModal =
    portalMode === 'employee'
      ? relations.filter(r => r.employeeName === currentEmployeeName)
      : relations;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* Top Bar with Brand, Independent Portal Indicator and Currency Toggle */}
      <TopBar
        portalMode={portalMode}
        onChangePortalMode={handleChangePortalMode}
        bcvRate={bcvRate}
        onOpenBcvModal={() => setIsBcvModalOpen(true)}
        currencyDisplay={currencyDisplay}
        onToggleCurrencyDisplay={() =>
          setCurrencyDisplay(prev => (prev === 'USD' ? 'VES' : 'USD'))
        }
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        currentEmployeeName={currentEmployeeName}
      />

      {/* Security & Access Strip */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-2 text-xs no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {portalMode === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-950">Panel de Finanzas y Control:</span>
                <span className="text-slate-600 hidden sm:inline">
                  Vista confidencial. Aquí se crean las asignaciones de fondos y se aprueban las liquidaciones de todos los empleados.
                </span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-blue-950">Portal Personal del Empleado:</span>
                <span className="text-slate-600 hidden sm:inline">
                  Acceso exclusivo a tus viajes asignados. Registra comprobantes con foto contra tu fondo autorizado.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {portalMode === 'admin' ? (
              <button
                onClick={() => handleChangePortalMode('employee')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors"
              >
                Volver a Portal Empleado
              </button>
            ) : (
              <button
                onClick={() => handleChangePortalMode('admin')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Acceso Finanzas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex-1">
        {portalMode === 'employee' ? (
          /* PORTAL INDEPENDIENTE DEL EMPLEADO */
          <EmployeePortal
            currentEmployee={currentEmployeeProfile}
            relations={relations}
            expenses={expenses}
            bcvRate={bcvRate}
            currencyDisplay={currencyDisplay}
            onOpenNewExpense={relationId => {
              setTargetRelationIdForExpense(relationId);
              setIsExpenseModalOpen(true);
            }}
            onViewReceipt={expense => setViewingReceiptExpense(expense)}
            onSubmitRelation={handleSubmitRelation}
            onChangeEmployeeProfile={handleChangeEmployeeProfile}
            allEmployees={employees}
          />
        ) : (
          /* PANEL INDEPENDIENTE DEL ADMINISTRADOR / FINANZAS */
          <AdminPortal
            relations={relations}
            expenses={expenses}
            employees={employees}
            bcvRate={bcvRate}
            currencyDisplay={currencyDisplay}
            onOpenCreateRelation={() => setIsCreateRelationModalOpen(true)}
            onOpenBcvModal={() => setIsBcvModalOpen(true)}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onSettleRelation={handleSettleRelation}
            onViewReceipt={expense => setViewingReceiptExpense(expense)}
            onOpenPrintReport={rel => setPrintRelation(rel)}
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
        bcvRate={bcvRate}
        currentEmployeeName={currentEmployeeName}
      />

      <CreateRelationModal
        isOpen={isCreateRelationModalOpen}
        onClose={() => setIsCreateRelationModalOpen(false)}
        onSave={handleCreateRelation}
        employees={employees}
        bcvRate={bcvRate}
      />

      {viewingReceiptExpense && (
        <ReceiptViewerModal
          isOpen={!!viewingReceiptExpense}
          onClose={() => setViewingReceiptExpense(null)}
          receiptUrl={viewingReceiptExpense.receiptUrl}
          concept={viewingReceiptExpense.concept}
          amount={viewingReceiptExpense.amount}
          currency={viewingReceiptExpense.currency}
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
          bcvRate={bcvRate}
        />
      )}

      <BcvRateModal
        isOpen={isBcvModalOpen}
        onClose={() => setIsBcvModalOpen(false)}
        currentRate={bcvRate}
        onSaveRate={handleSaveBcvRate}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
