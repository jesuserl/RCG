import React, { useState } from 'react';
import { TripRelation, Expense, EmployeeProfile, DataSourceMode } from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { 
  Plus, 
  Send, 
  Receipt, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  FolderCheck, 
  MessageSquare,
  User,
  Coins,
  Cloud,
  HardDrive
} from 'lucide-react';

interface EmployeePortalProps {
  currentEmployee: EmployeeProfile;
  relations: TripRelation[];
  expenses: Expense[];
  dataSourceMode?: DataSourceMode;
  onOpenNewExpense: (relationId: string) => void;
  onViewReceipt: (expense: Expense) => void;
  onSubmitRelation: (relationId: string) => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentEmployee,
  relations,
  expenses,
  dataSourceMode = 'supabase',
  onOpenNewExpense,
  onViewReceipt,
  onSubmitRelation,
}) => {
  // Only relations assigned to THIS employee
  const myRelations = relations.filter(r => r.employeeName === currentEmployee.name);
  const [selectedRelationId, setSelectedRelationId] = useState<string>(
    myRelations[0]?.id || ''
  );

  const activeRelation = myRelations.find(r => r.id === selectedRelationId) || myRelations[0];

  // Expenses for the active relation
  const relationExpenses = activeRelation
    ? expenses.filter(e => e.relationId === activeRelation.id)
    : [];

  // Financial calculations in Bolívares (Bs.)
  const totalSpent = relationExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = activeRelation ? activeRelation.allocatedBudget : 0;
  const remaining = budget - totalSpent;
  const isOverBudget = remaining < 0;
  const progressPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Employee Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {currentEmployee.name}
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Colaborador Autorizado
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentEmployee.position} · {currentEmployee.department}
            </p>
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tu Token de Acceso</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs inline-block mt-0.5">
              {currentEmployee.token}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sesión Verificada
            </span>
            <span className="text-[11px] text-slate-500">Solo ves tus gastos</span>
          </div>
        </div>
      </div>

      {/* Relations Selector / List */}
      {myRelations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
          <FolderCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tienes viajes ni relaciones asignadas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            El área de Finanzas aún no ha creado una relación de viáticos para tu usuario. Una vez asignada, aparecerá aquí con su presupuesto en Bolívares.
          </p>
        </div>
      ) : (
        <>
          {/* Active Trip Header Card */}
          {myRelations.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold shrink-0">Tus Viajes Asignados:</span>
              {myRelations.map(rel => {
                const isActive = rel.id === (activeRelation?.id || '');
                return (
                  <button
                    key={rel.id}
                    onClick={() => setSelectedRelationId(rel.id)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {rel.code} · {rel.title}
                  </button>
                );
              })}
            </div>
          )}

          {activeRelation && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Trip Relation Banner */}
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-blue-200 mb-1">
                      <span className="font-mono-numbers font-bold">{activeRelation.code}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {activeRelation.destination}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {activeRelation.startDate} al {activeRelation.endDate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Supabase PostgreSQL
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold tracking-tight">
                      {activeRelation.title}
                    </h3>

                    {activeRelation.adminNotes && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 max-w-2xl">
                        <strong className="text-blue-300">Instrucciones de Finanzas:</strong> {activeRelation.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Status & Action Buttons */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div>
                      {activeRelation.status === 'open' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          En Curso / Registro Abierto
                        </span>
                      )}
                      {activeRelation.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          Rendida · En Revisión por Finanzas
                        </span>
                      )}
                      {activeRelation.status === 'settled' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Liquidada y Aprobada
                        </span>
                      )}
                    </div>

                    {activeRelation.status === 'open' && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => onOpenNewExpense(activeRelation.id)}
                          className="px-4 py-2 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Cargar Comprobante</span>
                        </button>

                        {relationExpenses.length > 0 && (
                          <button
                            onClick={() => onSubmitRelation(activeRelation.id)}
                            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition-all flex items-center gap-1.5"
                            title="Finalizar viaje y enviar relación para auditoría de finanzas"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Rendición</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget & Execution Dashboard in VES */}
              <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Presupuesto Asignado en Bs. */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Fondo Asignado por Empresa
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
                      Bs. {budget.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-numbers block mt-1">
                      Monto autorizado para la comisión
                    </span>
                  </div>

                  {/* Total Gastado en Comprobantes */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Comprobantes Cargados
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
                      Bs. {totalSpent.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-numbers block mt-1">
                      {relationExpenses.length} facturas registradas
                    </span>
                  </div>

                  {/* Saldo Disponible */}
                  <div className={`p-4 rounded-xl border ${
                    isOverBudget 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                      {isOverBudget ? 'Fondo Excedido (Sobregiro):' : 'Saldo Disponible:'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black font-mono-numbers">
                      Bs. {Math.abs(remaining).toFixed(2)}
                    </div>
                    <span className="text-[11px] font-mono-numbers block mt-1 opacity-80">
                      {progressPercent.toFixed(1)}% del fondo ejecutado
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isOverBudget ? 'bg-rose-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expense List for this Relation */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Comprobantes y Facturas de este Viaje ({relationExpenses.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Gastos justificados en Bolívares (Bs. VES)
                    </p>
                  </div>

                  {activeRelation.status === 'open' && (
                    <button
                      onClick={() => onOpenNewExpense(activeRelation.id)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Gasto</span>
                    </button>
                  )}
                </div>

                {relationExpenses.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No has registrado gastos aún en este viaje</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Toma una foto de tu primera factura o ticket para comenzar tu rendición.
                    </p>
                    {activeRelation.status === 'open' && (
                      <button
                        onClick={() => onOpenNewExpense(activeRelation.id)}
                        className="mt-3 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                      >
                        + Cargar Primer Comprobante
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {relationExpenses.map(expense => {
                      const config = CATEGORIES_CONFIG[expense.category] || CATEGORIES_CONFIG['Otros'];
                      const CategoryIcon = config.icon;

                      return (
                        <div
                          key={expense.id}
                          className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {expense.category}
                                </span>

                                {/* Status unboxed text */}
                                {expense.status === 'approved' && (
                                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Aprobado por Finanzas
                                  </span>
                                )}
                                {expense.status === 'pending' && (
                                  <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    En Auditoría
                                  </span>
                                )}
                                {expense.status === 'rejected' && (
                                  <span className="text-[10px] font-bold text-rose-700 flex items-center gap-0.5">
                                    <AlertCircle className="w-3 h-3" />
                                    Observado
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                                {expense.concept}
                              </p>

                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{expense.date}</span>
                                {expense.receiptFileName && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate max-w-[150px]">{expense.receiptFileName}</span>
                                  </>
                                )}
                              </div>

                              {/* Note from finance if observed */}
                              {expense.financeNotes && (
                                <div className="mt-1.5 p-2 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-800 flex items-start gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Nota de Finanzas:</strong> {expense.financeNotes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-bold text-slate-900 font-mono-numbers block">
                                Bs. {expense.amount.toFixed(2)}
                              </span>
                            </div>

                            {expense.receiptUrl && (
                              <button
                                onClick={() => onViewReceipt(expense)}
                                className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                                title="Ver comprobante de factura"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
