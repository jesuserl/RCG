import React, { useState } from 'react';
import { TripRelation, UserRole, Expense } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Check, 
  X,
  ShieldAlert
} from 'lucide-react';

interface BudgetSummaryProps {
  project: TripRelation;
  expenses: Expense[];
  bcvRate: number;
  userRole: UserRole;
  currencyDisplay: 'USD' | 'VES';
  onUpdateBudget: (newBudgetUsd: number) => void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  project,
  expenses,
  bcvRate,
  userRole,
  currencyDisplay,
  onUpdateBudget,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(project.allocatedBudgetUsd.toString());

  const totalSpentUsd = expenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const totalSpentVes = expenses.reduce((sum, e) => sum + e.amountVes, 0);

  const budgetUsd = project.allocatedBudgetUsd;
  const budgetVes = budgetUsd * bcvRate;

  const currentSpent = currencyDisplay === 'USD' ? totalSpentUsd : totalSpentVes;
  const currentBudget = currencyDisplay === 'USD' ? budgetUsd : budgetVes;
  const currencySymbol = currencyDisplay === 'USD' ? '$' : 'Bs.';

  const progressPercent = budgetUsd > 0 ? (totalSpentUsd / budgetUsd) * 100 : 0;
  const remainingUsd = budgetUsd - totalSpentUsd;
  const remainingVes = remainingUsd * bcvRate;
  const isOverBudget = remainingUsd < 0;

  // Counts by status
  const approvedCount = expenses.filter(e => e.status === 'approved').length;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Top Details & Total Spent */}
      <div>
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{project.destination}</span>
              <span aria-hidden="true">·</span>
              <span>{project.startDate} al {project.endDate}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {project.title}
            </h2>
          </div>

          {userRole === 'finance' && !isEditingBudget && (
            <button
              onClick={() => {
                setBudgetInput(project.allocatedBudgetUsd.toString());
                setIsEditingBudget(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              title="Ajustar presupuesto asignado como Finanzas"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ajustar Presupuesto</span>
            </button>
          )}
        </div>

        {/* Edit Budget Form if in Finance Mode */}
        {isEditingBudget && (
          <form onSubmit={handleSaveBudget} className="my-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-900">Nuevo Presupuesto ($ USD):</span>
            <input
              type="number"
              step="10"
              min="1"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              className="w-28 px-2.5 py-1 text-xs font-mono-numbers font-semibold bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Primary Numbers Metric Grid */}
        <div className="grid grid-cols-2 gap-4 my-5">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Gastado</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
              {currencySymbol} {currentSpent.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono-numbers">
              {currencyDisplay === 'USD' 
                ? `≈ Bs. ${totalSpentVes.toFixed(2)}` 
                : `≈ $ ${totalSpentUsd.toFixed(2)} USD`}
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Presupuesto Asignado</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
              {currencySymbol} {currentBudget.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono-numbers">
              {currencyDisplay === 'USD' 
                ? `≈ Bs. ${budgetVes.toFixed(2)}` 
                : `≈ $ ${budgetUsd.toFixed(2)} USD`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span>Ejecución del Presupuesto</span>
              {isOverBudget && (
                <span className="text-rose-600 flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ¡Sobregiro!
                </span>
              )}
            </span>
            <span className="font-mono-numbers text-slate-900">
              {progressPercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : progressPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>
              {isOverBudget ? 'Monto Excedido:' : 'Saldo Disponible:'}
            </span>
            <span
              className={`font-semibold font-mono-numbers ${
                isOverBudget ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {currencySymbol} {Math.abs(currencyDisplay === 'USD' ? remainingUsd : remainingVes).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/60">
          <div className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprobados</span>
          </div>
          <span className="text-base font-bold text-emerald-900 font-mono-numbers">
            {approvedCount}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100/60">
          <div className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes</span>
          </div>
          <span className="text-base font-bold text-amber-900 font-mono-numbers">
            {pendingCount}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100/60">
          <div className="text-xs text-rose-800 font-semibold flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Observados</span>
          </div>
          <span className="text-base font-bold text-rose-900 font-mono-numbers">
            {rejectedCount}
          </span>
        </div>
      </div>
    </div>
  );
};
