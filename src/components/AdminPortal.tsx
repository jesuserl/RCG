import React, { useState } from 'react';
import { TripRelation, Expense, EmployeeProfile } from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { CategoryBreakdown } from './CategoryBreakdown';
import { 
  Plus, 
  ShieldCheck, 
  FolderPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Printer, 
  Search, 
  Download,
  Building,
  User,
  MapPin,
  Calendar,
  Coins
} from 'lucide-react';
import { exportExpensesToCsv } from '../utils/exportCsv';

interface AdminPortalProps {
  relations: TripRelation[];
  expenses: Expense[];
  employees: EmployeeProfile[];
  onOpenCreateRelation: () => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string, notes: string) => void;
  onSettleRelation: (relationId: string) => void;
  onViewReceipt: (expense: Expense) => void;
  onOpenPrintReport: (relation: TripRelation) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  relations,
  expenses,
  employees,
  onOpenCreateRelation,
  onApproveExpense,
  onRejectExpense,
  onSettleRelation,
  onViewReceipt,
  onOpenPrintReport,
}) => {
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'relations' | 'audit' | 'analytics'>('relations');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // Global totals in Bolívares
  const totalAllocated = relations.reduce((sum, r) => sum + r.allocatedBudget, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  // Filtered expenses for the audit view
  const filteredAuditExpenses = expenses.filter(exp => {
    if (selectedRelationFilter !== 'all' && exp.relationId !== selectedRelationFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exp.concept.toLowerCase().includes(q) ||
        exp.employeeName.toLowerCase().includes(q) ||
        exp.projectName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmReject = (id: string) => {
    if (!rejectNotes.trim()) {
      alert('Por favor indica una observación contable para el colaborador');
      return;
    }
    onRejectExpense(id, rejectNotes.trim());
    setRejectingId(null);
    setRejectNotes('');
  };

  const handleExportAllCsv = () => {
    exportExpensesToCsv(expenses, undefined, 'auditoria_general_viaticos_ves');
  };

  return (
    <div className="space-y-6">
      {/* Admin Header with Badges & Primary Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Panel de Administración y Finanzas (Bs. VES)
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {relations.length} Relaciones Activas
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Asignaciones y Liquidación de Viáticos en Bolívares
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea fondos en Bolívares por colaborador y audita comprobantes fiscales para liquidación
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportAllCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            title="Exportar archivo CSV con todos los gastos y relaciones en Bolívares"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV (Bs.)</span>
          </button>

          <button
            onClick={onOpenCreateRelation}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Cargar Relación (Bs.)</span>
          </button>
        </div>
      </div>

      {/* KPI Global Stat Strip in Bolívares */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Presupuestos Asignados
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-1">
            Bs. {totalAllocated.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers mt-0.5 block">
            En {relations.length} viajes corporativos
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Rendido en Comprobantes
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-1">
            Bs. {totalSpent.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers mt-0.5 block">
            {expenses.length} facturas registradas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pendientes por Auditar
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono-numbers mt-1">
            {pendingExpenses.length} facturas
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Requieren visto bueno de Finanzas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Gastos Aprobados
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono-numbers mt-1">
            {approvedExpenses.length} facturas
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Validadas para liquidación
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('relations')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'relations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Relaciones de Viáticos ({relations.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Auditoría de Comprobantes</span>
          {pendingExpenses.length > 0 && (
            <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {pendingExpenses.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Desglose por Rubros
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE RELACIONES CREADAS */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Relaciones Asignadas a Colaboradores (Bs.)
              </h3>
              <p className="text-xs text-slate-500">
                El colaborador únicamente puede justificar gastos contra estas relaciones
              </p>
            </div>

            <button
              onClick={onOpenCreateRelation}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Relación</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {relations.map(rel => {
              const relExpenses = expenses.filter(e => e.relationId === rel.id);
              const spent = relExpenses.reduce((sum, e) => sum + e.amount, 0);
              const remaining = rel.allocatedBudget - spent;
              const progress = rel.allocatedBudget > 0 ? (spent / rel.allocatedBudget) * 100 : 0;
              const isOver = remaining < 0;

              return (
                <div
                  key={rel.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-mono-numbers font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {rel.code}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{rel.employeeName}</strong>
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {rel.destination}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {rel.startDate} al {rel.endDate}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {rel.title}
                    </h4>

                    {rel.adminNotes && (
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-2xl">
                        Nota: {rel.adminNotes}
                      </p>
                    )}

                    {/* Progress micro bar */}
                    <div className="mt-3 max-w-md space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500">Ejecución del Fondo:</span>
                        <span className={`font-mono-numbers ${isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {progress.toFixed(1)}% {isOver && '(¡Sobregiro!)'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right side: Numbers in Bs. + Status + Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Fondo Asignado
                      </span>
                      <div className="text-sm font-black text-slate-900 font-mono-numbers">
                        Bs. {rel.allocatedBudget.toFixed(2)}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 font-mono-numbers">
                        Gastado: Bs. {spent.toFixed(2)} ({relExpenses.length} facturas)
                      </div>
                    </div>

                    {/* Relation Status */}
                    <div className="text-left sm:text-center min-w-[120px]">
                      {rel.status === 'open' && (
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Abierta (En ruta)
                        </span>
                      )}
                      {rel.status === 'submitted' && (
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          En Revisión
                        </span>
                      )}
                      {rel.status === 'settled' && (
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Liquidada / Cerrada
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedRelationFilter(rel.id);
                          setActiveTab('audit');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        title="Auditar comprobantes de esta relación"
                      >
                        Auditar Gastos
                      </button>

                      <button
                        onClick={() => onOpenPrintReport(rel)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Generar planilla oficial de liquidación"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {rel.status !== 'settled' && (
                        <button
                          onClick={() => onSettleRelation(rel.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                          title="Cerrar y marcar relación como liquidada conforme"
                        >
                          Liquidar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUDITORÍA DE COMPROBANTES */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Filtrar por Relación:</span>
              <select
                value={selectedRelationFilter}
                onChange={e => setSelectedRelationFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="all">Todas las relaciones ({expenses.length} gastos)</option>
                {relations.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.code} — {r.title} ({r.employeeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por concepto o empleado..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Audit List */}
          {filteredAuditExpenses.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No hay comprobantes para este criterio</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAuditExpenses.map(expense => {
                const config = CATEGORIES_CONFIG[expense.category] || CATEGORIES_CONFIG['Otros'];
                const CategoryIcon = config.icon;
                const isRejecting = rejectingId === expense.id;

                return (
                  <div
                    key={expense.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {expense.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono-numbers">
                            [{expense.projectName}]
                          </span>

                          {/* Approval status badge */}
                          {expense.status === 'approved' && (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aprobado
                            </span>
                          )}
                          {expense.status === 'pending' && (
                            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              Por Validar
                            </span>
                          )}
                          {expense.status === 'rejected' && (
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-0.5">
                              <XCircle className="w-3.5 h-3.5" />
                              Observado
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                          {expense.concept}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <span>Fecha: {expense.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>Colaborador: <strong>{expense.employeeName}</strong></span>
                        </div>

                        {expense.financeNotes && (
                          <div className="mt-1.5 p-2 bg-rose-50 rounded-lg text-xs text-rose-800 border border-rose-200">
                            <strong>Observación de Finanzas:</strong> {expense.financeNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount in Bs. + View Receipt + Finance Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-bold text-slate-900 font-mono-numbers">
                          Bs. {expense.amount.toFixed(2)}
                        </div>
                      </div>

                      {expense.receiptUrl && (
                        <button
                          onClick={() => onViewReceipt(expense)}
                          className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                          title="Ver factura o comprobante fiscal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* 1-Click Approve or Observe */}
                      <div className="flex items-center gap-1.5">
                        {expense.status !== 'approved' && (
                          <button
                            onClick={() => onApproveExpense(expense.id)}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aprobar</span>
                          </button>
                        )}

                        {expense.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectingId(expense.id);
                              setRejectNotes(expense.financeNotes || '');
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Observar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline note box if observing */}
                    {isRejecting && (
                      <div className="w-full sm:col-span-2 pt-2 border-t border-slate-100 mt-2 bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                        <label className="block text-xs font-semibold text-rose-900 mb-1">
                          Motivo contable de la objeción para el colaborador:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ej. Factura ilegible o falta especificar comensales en almuerzo..."
                            value={rejectNotes}
                            onChange={e => setRejectNotes(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmReject(expense.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                          >
                            Confirmar Objeción
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANALÍTICA Y DESGLOSE GLOBAL */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6">
          <CategoryBreakdown expenses={expenses} />
        </div>
      )}
    </div>
  );
};
