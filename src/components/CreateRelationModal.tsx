import React, { useState } from 'react';
import { TripRelation, EmployeeProfile, ExpenseCurrency } from '../types';
import { X, PlusCircle, Calendar, DollarSign, UserCheck, MapPin, FileText } from 'lucide-react';

interface CreateRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relation: Omit<TripRelation, 'id' | 'createdAt'>) => void;
  employees: EmployeeProfile[];
  bcvRate: number;
}

export const CreateRelationModal: React.FC<CreateRelationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  bcvRate,
}) => {
  const [code, setCode] = useState(() => `REL-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [employeeName, setEmployeeName] = useState(employees[0]?.name || '');
  const [budgetStr, setBudgetStr] = useState('350');
  const [currency, setCurrency] = useState<ExpenseCurrency>('USD');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const numericBudget = parseFloat(budgetStr) || 0;
  const budgetUsd = currency === 'USD' ? numericBudget : numericBudget / bcvRate;
  const budgetVes = currency === 'VES' ? numericBudget : numericBudget * bcvRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor indica el nombre o motivo del viaje/relación');
      return;
    }
    if (!destination.trim()) {
      setError('Por favor indica la ciudad o destino');
      return;
    }
    if (numericBudget <= 0) {
      setError('El monto asignado debe ser mayor a 0');
      return;
    }

    onSave({
      code: code.trim(),
      title: title.trim(),
      destination: destination.trim(),
      employeeName,
      allocatedBudgetUsd: budgetUsd,
      currency,
      bcvRateAtCreation: bcvRate,
      startDate,
      endDate,
      status: 'open',
      adminNotes: adminNotes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Panel de Finanzas
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Crear Nueva Relación de Viáticos
            </h3>
            <p className="text-xs text-slate-500">
              Asigna el fondo autorizado y el empleado responsable para el viaje
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Código y Empleado Asignado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código de Relación
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 font-mono-numbers font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Empleado Asignado *
              </label>
              <select
                value={employeeName}
                onChange={e => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} — {emp.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Nombre del Viaje / Proyecto */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del Viaje / Comisión *
            </label>
            <input
              type="text"
              placeholder="Ej. Inspección Operativa Planta Morón"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Row 3: Destino y Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Destino / Ciudad *
              </label>
              <input
                type="text"
                placeholder="Ej. Puerto Ordaz"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Fecha Retorno *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Row 4: Monto Asignado y Moneda */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Monto del Presupuesto Asignado (Anticipo) *
              </label>
              <span className="text-[11px] text-slate-400 font-mono-numbers">
                Tasa BCV: {bcvRate.toFixed(2)} Bs/$
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {currency === 'USD' ? '$' : 'Bs.'}
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="0.00"
                  value={budgetStr}
                  onChange={e => setBudgetStr(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 font-mono-numbers font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('VES')}
                  className={`py-1 text-xs font-bold rounded-lg transition-all ${
                    currency === 'VES'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bs. BCV
                </button>
              </div>
            </div>

            {numericBudget > 0 && (
              <div className="mt-1.5 px-3 py-1.5 bg-blue-50/60 rounded-lg text-xs font-mono-numbers text-blue-900 flex items-center justify-between">
                <span>Equivalente en {currency === 'USD' ? 'Bolívares:' : 'Dólares:'}</span>
                <span className="font-bold">
                  {currency === 'USD'
                    ? `Bs. ${budgetVes.toFixed(2)}`
                    : `$ ${budgetUsd.toFixed(2)} USD`}
                </span>
              </div>
            )}
          </div>

          {/* Row 5: Instrucciones o Políticas para el empleado */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Instrucciones / Políticas para el Colaborador
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Exclusivo para viáticos de alimentación y transporte. Adjuntar facturas legales con RIF."
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear y Asignar Relación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
