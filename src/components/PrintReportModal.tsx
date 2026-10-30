import React, { useState } from 'react';
import { TripRelation, Expense } from '../types';
import { 
  Printer, 
  X, 
  Download, 
  FileText, 
  Files, 
  FileDown, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Camera,
  Coins
} from 'lucide-react';
import { exportExpensesToCsv } from '../utils/exportCsv';
import { 
  downloadSingleExpensePdf, 
  downloadAllRelationVouchersPdf, 
  downloadRelationSummaryReportPdf 
} from '../utils/pdfGenerator';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  relation: TripRelation;
  expenses: Expense[];
  onViewReceipt?: (expense: Expense) => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  relation,
  expenses,
  onViewReceipt,
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter only expenses for this specific relation
  const relExpenses = expenses.filter(e => e.relationId === relation.id);

  const totalSpentVes = relExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetVes = relation.allocatedBudget;

  const diffVes = budgetVes - totalSpentVes;
  const isEmployeeRefund = diffVes < 0; // Gastó más de lo asignado, la empresa le debe reembolsar

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportExpensesToCsv(relExpenses, relation, `liquidacion_${relation.code.toLowerCase()}`);
  };

  const handleDownloadReportPdf = async () => {
    setDownloadingType('report');
    try {
      downloadRelationSummaryReportPdf(relation, relExpenses);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadAllVouchersPdf = async () => {
    setDownloadingType('all-vouchers');
    try {
      await downloadAllRelationVouchersPdf(relation, relExpenses);
    } catch (err) {
      console.error('Error generando PDF de todos los comprobantes:', err);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadSingleVoucherPdf = async (expense: Expense) => {
    setDownloadingType(expense.id);
    try {
      await downloadSingleExpensePdf(expense, relation);
    } catch (err) {
      console.error('Error generando PDF de comprobante:', err);
    } finally {
      setDownloadingType(null);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 gap-3 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Reporte de Rendición de Viáticos (Bs. VES)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Formato limpio y específico para colaboradores y administración · Descarga de soportes en PDF
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Descargar todos los comprobantes juntos en PDF */}
            <button
              onClick={handleDownloadAllVouchersPdf}
              disabled={downloadingType === 'all-vouchers' || relExpenses.length === 0}
              className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Descarga un PDF consolidado con la carátula y todos los comprobantes/facturas adjuntas de la relación"
            >
              <Files className={`w-4 h-4 text-emerald-600 ${downloadingType === 'all-vouchers' ? 'animate-bounce' : ''}`} />
              <span>{downloadingType === 'all-vouchers' ? 'Generando...' : 'Descargar Todos los Comprobantes (PDF)'}</span>
            </button>

            {/* Descargar Reporte Formal en PDF */}
            <button
              onClick={handleDownloadReportPdf}
              disabled={downloadingType === 'report'}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Descarga la planilla oficial de liquidación contable en formato PDF"
            >
              <FileDown className={`w-4 h-4 ${downloadingType === 'report' ? 'animate-spin' : ''}`} />
              <span>{downloadingType === 'report' ? 'Descargando...' : 'Descargar Reporte (PDF)'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Exportar archivo CSV para Excel"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Imprimir formato físico"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0 print:m-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-sm">
                  VP
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    Corporación &amp; Servicios Empresariales
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Departamento de Administración, Finanzas y Rendición de Cuentas
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                INFORME DE RENDICIÓN DE VIÁTICOS
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 block mt-0.5">
                CÓDIGO: {relation.code}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Fecha de Emisión: {currentDate}
              </div>
            </div>
          </div>

          {/* Relation & Employee Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/90">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Colaborador:</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{relation.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proyecto / Misión:</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">{relation.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino y Fechas:</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {relation.destination} ({relation.startDate} al {relation.endDate})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado / Moneda:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  relation.status === 'settled' ? 'bg-slate-200 text-slate-800' :
                  relation.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {relation.status === 'settled' ? 'Liquidada' : relation.status === 'submitted' ? 'En Auditoría' : 'Abierta'}
                </span>
                <span className="text-xs font-bold text-blue-700 font-mono-numbers">
                  Bs. VES
                </span>
              </div>
            </div>
          </div>

          {/* Table of Expenses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Relación Detallada de Gastos ({relExpenses.length} comprobantes)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono-numbers">
                Valores expresados en Bolívares (VES)
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Concepto / Razón</th>
                    <th className="p-3 text-center">Auditoría</th>
                    <th className="p-3 text-center">Soporte</th>
                    <th className="p-3 text-right font-mono-numbers">Monto (Bs.)</th>
                    <th className="p-3 text-center no-print">Voucher PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {relExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No hay comprobantes de gastos registrados en esta relación aún.
                      </td>
                    </tr>
                  ) : (
                    relExpenses.map((exp, idx) => (
                      <tr key={exp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 whitespace-nowrap text-slate-600 font-mono-numbers">{exp.date}</td>
                        <td className="p-3 whitespace-nowrap font-semibold text-slate-800">{exp.category}</td>
                        <td className="p-3 text-slate-700">
                          {exp.concept}
                          {exp.financeNotes && (
                            <span className="block text-[10px] text-rose-600 font-medium mt-0.5">
                              Obs: {exp.financeNotes}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exp.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            exp.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {exp.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {exp.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                            {exp.status === 'rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                            <span>
                              {exp.status === 'approved' ? 'APROBADO' :
                               exp.status === 'pending' ? 'PENDIENTE' : 'OBSERVADO'}
                            </span>
                          </span>
                        </td>
                        <td className="p-3 text-center text-[10px]">
                          {exp.receiptUrl ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Camera className="w-3 h-3 text-emerald-600" />
                              Foto Adjunta
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Sin Foto
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono-numbers font-bold text-slate-900 whitespace-nowrap">
                          Bs. {exp.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleVoucherPdf(exp)}
                            disabled={downloadingType === exp.id}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Descargar este comprobante individual en PDF"
                          >
                            <FileDown className={`w-3 h-3 ${downloadingType === exp.id ? 'animate-spin' : ''}`} />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                    <td colSpan={5} className="p-3 text-right uppercase tracking-wider">
                      Total Gastos Registrados:
                    </td>
                    <td className="p-3 text-right font-mono-numbers whitespace-nowrap text-sm">
                      Bs. {totalSpentVes.toFixed(2)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Balance Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Fondo Asignado por Administración</span>
              <div className="text-lg font-black text-slate-900 font-mono-numbers mt-1">
                Bs. {budgetVes.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Presupuesto aprobado para la comisión
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Gastado y Comprobado</span>
              <div className="text-lg font-black text-slate-900 font-mono-numbers mt-1">
                Bs. {totalSpentVes.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Suma total de partidas registradas
              </span>
            </div>

            <div className={`p-4 border rounded-2xl ${
              isEmployeeRefund 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="text-[10px] uppercase font-bold block">
                {isEmployeeRefund ? 'Saldo a Reembolsar al Empleado:' : 'Saldo a Devolver a la Empresa:'}
              </span>
              <div className="text-lg font-black font-mono-numbers mt-1">
                Bs. {Math.abs(diffVes).toFixed(2)}
              </div>
              <span className="text-[11px] block mt-0.5">
                {isEmployeeRefund ? 'Excedente a favor del colaborador' : 'Remanente a reintegrar a caja'}
              </span>
            </div>
          </div>

          {/* Sección de Comprobantes Digitales y Soportes (Voucher Gallery) */}
          {relExpenses.some(e => !!e.receiptUrl) && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Comprobantes Digitales Adjuntos ({relExpenses.filter(e => !!e.receiptUrl).length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Soportes fotográficos digitalizados de facturas y tickets fiscales
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAllVouchersPdf}
                  disabled={downloadingType === 'all-vouchers'}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer no-print shadow-xs"
                >
                  <Files className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargar Todos (PDF)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {relExpenses
                  .filter(e => !!e.receiptUrl)
                  .map(exp => (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={exp.receiptUrl}
                          alt={exp.concept}
                          className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-white shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {exp.date} · {exp.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {exp.concept}
                          </h5>
                          <span className="text-xs font-black font-mono-numbers text-slate-900 block mt-0.5">
                            Bs. {exp.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80 no-print">
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(exp)}
                            className="flex-1 py-1 px-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Ver</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleVoucherPdf(exp)}
                          disabled={downloadingType === exp.id}
                          className="flex-1 py-1 px-2 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileDown className="w-3 h-3 text-blue-600" />
                          <span>Bajar PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Signatures block */}
          <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-[11px]">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                {relation.employeeName}
              </div>
              <span className="text-slate-500 font-semibold block">Firma del Colaborador</span>
              <span className="text-[9px] text-slate-400">Rinde cuenta bajo fe de juramento</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                Analista de Finanzas
              </div>
              <span className="text-slate-500 font-semibold block">Revisado y Auditado</span>
              <span className="text-[9px] text-slate-400">Comprobantes fiscales validados</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                Gerencia de Administración
              </div>
              <span className="text-slate-500 font-semibold block">Aprobación Final</span>
              <span className="text-[9px] text-slate-400">Autorización de liquidación</span>
            </div>
          </div>
        </div>

        {/* Modal footer (Hidden in Print) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
          <span className="text-xs text-slate-500">
            Los comprobantes pueden descargarse de forma individual o todos juntos en un único expediente PDF.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer self-end sm:self-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
