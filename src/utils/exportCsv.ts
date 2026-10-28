import { Expense, TripRelation } from '../types';

export function exportExpensesToCsv(
  expenses: Expense[],
  project?: TripRelation,
  filenamePrefix = 'liquidacion_viaticos'
): void {
  const headers = [
    'ID Gasto',
    'Fecha',
    'Empleado',
    'Proyecto/Viaje',
    'Categoría',
    'Concepto/Descripción',
    'Moneda Original',
    'Monto Original',
    'Tasa BCV Aplicada',
    'Equivalente USD ($)',
    'Equivalente Bs. (VES)',
    'Estado Aprobación',
    'Comprobante Adjunto',
    'Observaciones Finanzas',
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = expenses.map(exp => {
    const statusMap = {
      approved: 'Aprobado',
      pending: 'Pendiente',
      rejected: 'Observado/Rechazado',
    };

    return [
      escapeCsv(exp.id),
      escapeCsv(exp.date),
      escapeCsv(exp.employeeName),
      escapeCsv(exp.projectName),
      escapeCsv(exp.category),
      escapeCsv(exp.concept),
      escapeCsv(exp.currency),
      escapeCsv(exp.amount.toFixed(2)),
      escapeCsv(exp.bcvRate.toFixed(2)),
      escapeCsv(exp.amountUsd.toFixed(2)),
      escapeCsv(exp.amountVes.toFixed(2)),
      escapeCsv(statusMap[exp.status] || exp.status),
      escapeCsv(exp.receiptFileName || (exp.receiptUrl ? 'Adjunto' : 'Sin comprobante')),
      escapeCsv(exp.financeNotes || ''),
    ].join(',');
  });

  // Calculate totals
  const totalUsd = expenses.reduce((sum, e) => sum + e.amountUsd, 0);
  const totalVes = expenses.reduce((sum, e) => sum + e.amountVes, 0);

  const summaryRow = [
    escapeCsv('TOTALES LIQUIDADOS'),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(`${expenses.length} gastos registrados`),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(totalUsd.toFixed(2)),
    escapeCsv(totalVes.toFixed(2)),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
  ].join(',');

  const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
