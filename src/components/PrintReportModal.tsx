import React from 'react';
import { TripRelation, Expense } from '../types';
import { Printer, X, Download, ShieldCheck, Building } from 'lucide-react';
import { exportExpensesToCsv } from '../utils/exportCsv';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  relation: TripRelation;
  expenses: Expense[];
  bcvRate: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  relation,
  expenses,
  bcvRate,
}) => {
  if (!isOpen) return null;

  // Filter only expenses for this specific relation
  const relExpenses = expenses.filter(e => e.relationId === relation.id);

  const totalUsd = relExpenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const totalVes = relExpenses.reduce((sum, e) => sum + e.amountVes, 0);

  const budgetUsd = relation.allocatedBudgetUsd;
  const budgetVes = budgetUsd * bcvRate;

  const diffUsd = budgetUsd - totalUsd;
  const diffVes = budgetVes - totalVes;
  const isEmployeeRefund = diffUsd < 0; // Gastó más de lo asignado, la empresa le debe reembolsar

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportExpensesToCsv(relExpenses, undefined, `liquidacion_${relation.code.toLowerCase()}`);
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[95vh]">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Vista Previa de Liquidación de Viáticos
            </h3>
            <p className="text-xs text-slate-500">
              Documento formal listo para impresión o exportación contable
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Descargar CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0 print:m-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  VP
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    Corporación & Servicios Empresariales
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Departamento de Administración, Finanzas y Tesorería
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                PLANILLA DE LIQUIDACIÓN DE VIÁTICOS
              </span>
              <span className="text-[11px] text-slate-500 font-mono-numbers">
                N° REF: LIQ-{relation.code}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Fecha de Emisión: {currentDate}
              </div>
            </div>
          </div>

          {/* Relation & Employee Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 my-6 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Colaborador:</span>
              <span className="text-xs font-bold text-slate-900">{relation.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proyecto / Misión:</span>
              <span className="text-xs font-bold text-slate-900">{relation.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino / Período:</span>
              <span className="text-xs font-bold text-slate-900">
                {relation.destination} ({relation.startDate} al {relation.endDate})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasa Oficial BCV:</span>
              <span className="text-xs font-bold text-blue-700 font-mono-numbers">
                Bs. {bcvRate.toFixed(2)} por 1 USD
              </span>
            </div>
          </div>

          {/* Table of Expenses */}
          <div className="my-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Relación Detallada de Gastos y Facturas
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Categoría</th>
                    <th className="p-2.5">Concepto / Razón</th>
                    <th className="p-2.5 text-center">Estado</th>
                    <th className="p-2.5 text-right font-mono-numbers">Monto Orig.</th>
                    <th className="p-2.5 text-right font-mono-numbers">Equiv. USD ($)</th>
                    <th className="p-2.5 text-right font-mono-numbers">Equiv. Bs.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {relExpenses.map((exp, idx) => (
                    <tr key={exp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2.5 whitespace-nowrap text-slate-600">{exp.date}</td>
                      <td className="p-2.5 whitespace-nowrap font-medium text-slate-800">{exp.category}</td>
                      <td className="p-2.5 text-slate-700">
                        {exp.concept}
                        {exp.financeNotes && (
                          <span className="block text-[10px] text-rose-600 font-medium">
                            Obs: {exp.financeNotes}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block text-[10px] font-bold ${
                          exp.status === 'approved' ? 'text-emerald-700' :
                          exp.status === 'pending' ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {exp.status === 'approved' ? 'APROBADO' :
                           exp.status === 'pending' ? 'PENDIENTE' : 'OBSERVADO'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono-numbers whitespace-nowrap text-slate-800">
                        {exp.currency === 'USD' ? '$' : 'Bs.'} {exp.amount.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono-numbers font-semibold text-slate-900 whitespace-nowrap">
                        $ {exp.amountUsd.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono-numbers font-semibold text-slate-900 whitespace-nowrap">
                        Bs. {exp.amountVes.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                    <td colSpan={5} className="p-2.5 text-right uppercase tracking-wider">
                      Total Gastos Registrados ({relExpenses.length} comprobantes):
                    </td>
                    <td className="p-2.5 text-right font-mono-numbers whitespace-nowrap">
                      $ {totalUsd.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-mono-numbers whitespace-nowrap">
                      Bs. {totalVes.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Balance Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Presupuesto Asignado</span>
              <div className="text-sm font-extrabold text-slate-900 font-mono-numbers mt-0.5">
                $ {budgetUsd.toFixed(2)} USD
              </div>
              <span className="text-[10px] text-slate-500 font-mono-numbers">
                ≈ Bs. {budgetVes.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Liquidado</span>
              <div className="text-sm font-extrabold text-slate-900 font-mono-numbers mt-0.5">
                $ {totalUsd.toFixed(2)} USD
              </div>
              <span className="text-[10px] text-slate-500 font-mono-numbers">
                ≈ Bs. {totalVes.toFixed(2)}
              </span>
            </div>

            <div className={`p-3 border rounded-xl ${
              isEmployeeRefund 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="text-[10px] uppercase font-bold block">
                {isEmployeeRefund ? 'Saldo a Reembolsar al Empleado:' : 'Saldo a Devolver a la Empresa:'}
              </span>
              <div className="text-sm font-black font-mono-numbers mt-0.5">
                $ {Math.abs(diffUsd).toFixed(2)} USD
              </div>
              <span className="text-[10px] font-mono-numbers">
                ≈ Bs. {Math.abs(diffVes).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Signatures block */}
          <div className="pt-12 mt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-[11px]">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900">
                {relation.employeeName}
              </div>
              <span className="text-slate-500 block">Firma del Colaborador</span>
              <span className="text-[9px] text-slate-400">Rinde cuenta bajo fe de juramento</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900">
                Analista de Finanzas
              </div>
              <span className="text-slate-500 block">Revisado y Auditado</span>
              <span className="text-[9px] text-slate-400">Comprobantes fiscales validados</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900">
                Gerencia de Administración
              </div>
              <span className="text-slate-500 block">Aprobación Final</span>
              <span className="text-[9px] text-slate-400">Autorización de liquidación</span>
            </div>
          </div>
        </div>

        {/* Modal footer (Hidden in Print) */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Puedes imprimir directamente o guardar como documento PDF desde tu navegador.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
