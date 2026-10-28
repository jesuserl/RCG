import React, { useState } from 'react';
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseStatus, 
  UserRole 
} from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Receipt, 
  ArrowUpDown,
  MessageSquare
} from 'lucide-react';

interface ExpenseListViewProps {
  expenses: Expense[];
  userRole: UserRole;
  currencyDisplay: 'USD' | 'VES';
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  expenses,
  userRole,
  currencyDisplay,
  onApprove,
  onReject,
  onDelete,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // Extract distinct employees for filter dropdown
  const uniqueEmployees = Array.from(new Set(expenses.map(e => e.employeeName)));

  // Filter logic
  const filtered = expenses.filter(exp => {
    // Search
    const matchesSearch =
      exp.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;

    // Status
    if (selectedStatus !== 'all' && exp.status !== selectedStatus) return false;

    // Employee
    if (selectedEmployee !== 'all' && exp.employeeName !== selectedEmployee) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return sortOrder === 'desc' ? diff : -diff;
  });

  const handleConfirmReject = (id: string) => {
    if (!rejectNotes.trim()) {
      alert('Por favor indica una observación o motivo para la objeción del gasto');
      return;
    }
    onReject(id, rejectNotes.trim());
    setRejectingId(null);
    setRejectNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* List Header & Interactive Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Listado de Comprobantes de Gastos</span>
              <span className="text-xs font-semibold text-slate-500 font-mono-numbers">
                ({filtered.length} de {expenses.length})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {userRole === 'finance'
                ? 'Modo Finanzas: Valida y audita comprobantes con 1 clic'
                : 'Modo Empleado: Historial de gastos registrados en este viaje'}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto o empleado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todas las categorías</option>
              <option value="Hospedaje">Hospedaje</option>
              <option value="Alimentación">Alimentación</option>
              <option value="Transporte">Transporte</option>
              <option value="Combustible">Combustible</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold">Estado:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes de revisión</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Observados / Rechazados</option>
            </select>
          </div>

          {/* Employee Filter (if multiple) */}
          {uniqueEmployees.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-semibold">Empleado:</span>
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Todos los empleados</option>
                {uniqueEmployees.map(emp => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="ml-auto px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}</span>
          </button>
        </div>
      </div>

      {/* Expense List Items */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No se encontraron gastos</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajusta los filtros de búsqueda o registra un nuevo comprobante.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map(expense => {
            const config = CATEGORIES_CONFIG[expense.category] || CATEGORIES_CONFIG['Otros'];
            const CategoryIcon = config.icon;
            const isRejectingThis = rejectingId === expense.id;

            return (
              <div
                key={expense.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left block: Category icon + Concept + Metadata */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {expense.category}
                      </span>

                      {/* Status indicator unboxed text */}
                      {expense.status === 'approved' && (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprobado
                        </span>
                      )}
                      {expense.status === 'pending' && (
                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente
                        </span>
                      )}
                      {expense.status === 'rejected' && (
                        <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-0.5">
                          <XCircle className="w-3.5 h-3.5" />
                          Observado
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                      {expense.concept}
                    </h4>

                    {/* Unboxed metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <span>{expense.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[160px]">{expense.employeeName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[160px]">{expense.projectName}</span>
                      {expense.bcvRate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-numbers text-slate-400 text-[11px]">
                            BCV: {expense.bcvRate.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Finance observation note if any */}
                    {expense.financeNotes && (
                      <div className="mt-1.5 p-2 bg-rose-50 rounded-lg text-xs text-rose-800 flex items-start gap-1.5 border border-rose-100">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Nota de Finanzas:</strong> {expense.financeNotes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right block: Amount + Receipt button + Role actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Amounts */}
                  <div className="text-left sm:text-right">
                    <div className="text-base font-bold text-slate-900 font-mono-numbers">
                      {expense.currency === 'USD' ? '$' : 'Bs.'} {expense.amount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono-numbers">
                      {expense.currency === 'USD'
                        ? `≈ Bs. ${expense.amountVes.toFixed(2)}`
                        : `≈ $ ${expense.amountUsd.toFixed(2)} USD`}
                    </div>
                  </div>

                  {/* Receipt Preview Trigger */}
                  {expense.receiptUrl ? (
                    <button
                      onClick={() => onViewReceipt(expense)}
                      className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                      title="Ver comprobante de factura"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  ) : (
                    <div
                      className="p-2 text-slate-300 rounded-xl cursor-not-allowed"
                      title="Sin comprobante adjunto"
                    >
                      <Receipt className="w-4 h-4" />
                    </div>
                  )}

                  {/* Role Specific Actions */}
                  {userRole === 'finance' ? (
                    <div className="flex items-center gap-1.5">
                      {expense.status !== 'approved' && (
                        <button
                          onClick={() => onApprove(expense.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                          title="Aprobar gasto para liquidación"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aprobar</span>
                        </button>
                      )}

                      {expense.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setRejectingId(expense.id);
                            setRejectNotes(expense.financeNotes || '');
                          }}
                          className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1"
                          title="Observar o rechazar gasto con nota"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Observar</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Reject/Observe inline modal input if active */}
                {isRejectingThis && (
                  <div className="w-full sm:col-span-2 pt-2 border-t border-slate-100 mt-2 bg-rose-50/50 p-3 rounded-xl border border-rose-200">
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Motivo de la Observación / Rechazo:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ej. Factura ilegible, excede monto autorizado o falta RIF fiscal..."
                        value={rejectNotes}
                        onChange={e => setRejectNotes(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmReject(expense.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
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
  );
};
