import { jsPDF } from 'jspdf';
import { TripRelation, Expense } from '../types';

/**
 * Loads an image from a data URL or external URL and converts it to a format jsPDF accepts.
 */
async function loadImageElement(url: string): Promise<{ img: HTMLImageElement; format: 'JPEG' | 'PNG' }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const isPng = url.startsWith('data:image/png');
      resolve({ img, format: isPng ? 'PNG' : 'JPEG' });
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Converts any image (including SVGs) into a PNG data URL using an offscreen canvas
 */
async function getRasterDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  try {
    const { img } = await loadImageElement(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');

    // Fill white background for transparent PNGs/SVGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.warn('Could not rasterize image for PDF:', err);
    throw err;
  }
}

/**
 * Descarga individual de un comprobante en PDF con formato limpio y específico
 */
export async function downloadSingleExpensePdf(
  expense: Expense,
  relation?: TripRelation
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REGISTRO DE VIÁTICOS', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('COMPROBANTE OFICIAL DE GASTO INDIVIDUAL', margin, 18);

  const issueDate = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Fecha de Emisión: ${issueDate}`, pageWidth - margin, 18, { align: 'right' });

  let y = 36;

  // Section: General Information (Box)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'bold');
  doc.text('COLABORADOR:', margin + 4, y + 7);
  doc.text('RELACIÓN / MISIÓN:', margin + 4, y + 15);
  doc.text('DESTINO Y FECHAS:', margin + 4, y + 23);
  doc.text('ESTADO AUDITORÍA:', margin + 4, y + 31);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(expense.employeeName || relation?.employeeName || 'Colaborador Autorizado', margin + 35, y + 7);
  doc.text(`${relation?.code || 'REL-VES'} — ${relation?.title || expense.projectName}`, margin + 35, y + 15);
  doc.text(
    relation
      ? `${relation.destination} (${relation.startDate} al ${relation.endDate})`
      : 'Comisión de Servicio',
    margin + 35,
    y + 23
  );

  const statusLabel =
    expense.status === 'approved'
      ? 'APROBADO POR FINANZAS'
      : expense.status === 'rejected'
      ? 'OBSERVADO / RECHAZADO'
      : 'EN AUDITORÍA (PENDIENTE)';
  doc.setFont('helvetica', 'bold');
  if (expense.status === 'approved') doc.setTextColor(16, 185, 129);
  else if (expense.status === 'rejected') doc.setTextColor(239, 68, 68);
  else doc.setTextColor(245, 158, 11);
  doc.text(statusLabel, margin + 35, y + 31);

  y += 42;

  // Expense Details Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA', margin + 4, y + 5.5);
  doc.text('CATEGORÍA', margin + 32, y + 5.5);
  doc.text('CONCEPTO / DESCRIPCIÓN', margin + 65, y + 5.5);
  doc.text('MONTO (Bs. VES)', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Expense Details Row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(expense.date, margin + 4, y + 8);
  doc.text(expense.category, margin + 32, y + 8);

  const splitConcept = doc.splitTextToSize(expense.concept, 65);
  doc.text(splitConcept, margin + 65, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Bs. ${expense.amount.toFixed(2)}`, pageWidth - margin - 4, y + 8, { align: 'right' });

  y += 20;

  // If there are finance notes
  if (expense.financeNotes) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Observación de Finanzas:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(expense.financeNotes, margin + 45, y + 5);
    y += 16;
  }

  // Section: Attached Voucher / Receipt Image
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SOPORTE DIGITAL / COMPROBANTE ADJUNTO:', margin, y + 2);

  y += 6;

  if (expense.receiptUrl) {
    try {
      const { dataUrl, width, height } = await getRasterDataUrl(expense.receiptUrl);

      // Max box area for image
      const maxImgW = contentWidth;
      const maxImgH = pageHeight - y - 30; // Leave room for footer

      let renderW = maxImgW;
      let renderH = (height / width) * renderW;

      if (renderH > maxImgH) {
        renderH = maxImgH;
        renderW = (width / height) * renderH;
      }

      const imgX = margin + (contentWidth - renderW) / 2;

      // Draw container frame
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(imgX - 2, y - 2, renderW + 4, renderH + 4, 2, 2, 'FD');

      doc.addImage(dataUrl, 'JPEG', imgX, y, renderW, renderH);
    } catch (e) {
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprobante adjuntado en formato digital (archivo no renderizable directamente).', margin + 10, y + 20);
    }
  } else {
    // No receipt image
    doc.setDrawColor(254, 243, 199);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE REGISTRADO SIN FOTO ADJUNTA', margin + 10, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('El colaborador puede completar la foto de la factura antes de que el gasto sea aprobado.', margin + 10, y + 21);
  }

  // Footer bar
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `ViáticosPro · Documento generado automáticamente para soporte contable · Moneda: Bolívares (VES)`,
    margin,
    pageHeight - 10
  );
  doc.text(`ID: ${expense.id}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

  const safeConcept = expense.concept.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  doc.save(`comprobante_${expense.date}_${safeConcept}.pdf`);
}

/**
 * Descarga de TODOS los comprobantes de una relación en un único documento PDF consolidado
 */
export async function downloadAllRelationVouchersPdf(
  relation: TripRelation,
  expenses: Expense[]
): Promise<void> {
  const relExpenses = expenses.filter(e => e.relationId === relation.id);
  const totalAmount = relExpenses.reduce((sum, e) => sum + e.amount, 0);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // PORTADA / RESUMEN CONSOLIDADO (PÁGINA 1)
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('REGISTRO DE VIÁTICOS', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text(`EXPEDIENTE DE COMPROBANTES Y FACTURAS: ${relation.code}`, margin, 24);

  const currentDate = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha: ${currentDate}`, pageWidth - margin, 24, { align: 'right' });

  let y = 45;

  // Relation Card Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('MISIÓN / TÍTULO:', margin + 4, y + 8);
  doc.text('COLABORADOR:', margin + 4, y + 16);
  doc.text('DESTINO Y PERÍODO:', margin + 4, y + 24);
  doc.text('ESTADO DE LA RELACIÓN:', margin + 4, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(relation.title, margin + 45, y + 8);
  doc.text(relation.employeeName, margin + 45, y + 16);
  doc.text(`${relation.destination} (${relation.startDate} al ${relation.endDate})`, margin + 45, y + 24);

  const relStatusLabel =
    relation.status === 'settled'
      ? 'LIQUIDADA / CERRADA'
      : relation.status === 'submitted'
      ? 'RENDIDA (EN AUDITORÍA)'
      : 'ABIERTA / EN RUTA';
  doc.setFont('helvetica', 'bold');
  doc.text(relStatusLabel, margin + 45, y + 32);

  y += 46;

  // Financial Stats Grid (3 boxes)
  const boxW = (contentWidth - 6) / 3;
  
  // Box 1: Fondo Asignado
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxW, 20, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('FONDO ASIGNADO', margin + 3, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bs. ${relation.allocatedBudget.toFixed(2)}`, margin + 3, y + 15);

  // Box 2: Total Comprobado
  doc.roundedRect(margin + boxW + 3, y, boxW, 20, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL COMPROBANTES', margin + boxW + 6, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bs. ${totalAmount.toFixed(2)}`, margin + boxW + 6, y + 15);

  // Box 3: Cantidad de Comprobantes
  const withPhotoCount = relExpenses.filter(e => !!e.receiptUrl).length;
  doc.roundedRect(margin + (boxW + 3) * 2, y, boxW, 20, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROBANTES TOTALES', margin + (boxW + 3) * 2 + 3, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`${relExpenses.length} (${withPhotoCount} con foto)`, margin + (boxW + 3) * 2 + 3, y + 15);

  y += 28;

  // Index table of all vouchers
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ÍNDICE CONSOLIDADO DE COMPROBANTES:', margin, y);

  y += 4;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('#', margin + 2, y + 5);
  doc.text('FECHA', margin + 10, y + 5);
  doc.text('CATEGORÍA', margin + 30, y + 5);
  doc.text('CONCEPTO', margin + 60, y + 5);
  doc.text('ESTADO', margin + 120, y + 5);
  doc.text('MONTO (Bs.)', pageWidth - margin - 2, y + 5, { align: 'right' });

  y += 7;

  relExpenses.forEach((exp, idx) => {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    doc.text(`${idx + 1}`, margin + 2, y + 4.5);
    doc.text(exp.date, margin + 10, y + 4.5);
    doc.text(exp.category, margin + 30, y + 4.5);

    const truncConcept = exp.concept.length > 35 ? exp.concept.substring(0, 32) + '...' : exp.concept;
    doc.text(truncConcept, margin + 60, y + 4.5);

    const st = exp.status === 'approved' ? 'Aprobado' : exp.status === 'rejected' ? 'Observado' : 'Pendiente';
    doc.text(st, margin + 120, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`Bs. ${exp.amount.toFixed(2)}`, pageWidth - margin - 2, y + 4.5, { align: 'right' });

    y += 7;
  });

  // Footer Cover Page
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Expediente completo de viáticos · Páginas siguientes contienen las fotos de comprobantes digitalizados.`,
    margin,
    pageHeight - 10
  );

  // -------------------------------------------------------------
  // PÁGINAS SIGUIENTES: CADA COMPROBANTE CON SU DETALLE Y FOTO
  // -------------------------------------------------------------
  for (let i = 0; i < relExpenses.length; i++) {
    const exp = relExpenses[i];
    doc.addPage();

    // Small header on every voucher page
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`COMPROBANTE ${i + 1} DE ${relExpenses.length}`, margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`${relation.code} · ${relation.title}`, pageWidth - margin, 12, { align: 'right' });

    let vy = 28;

    // Voucher Metadata Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, vy, contentWidth, 24, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA:', margin + 4, vy + 6);
    doc.text('CATEGORÍA:', margin + 35, vy + 6);
    doc.text('ESTADO:', margin + 85, vy + 6);
    doc.text('MONTO EN BOLÍVARES:', pageWidth - margin - 4, vy + 6, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(exp.date, margin + 4, vy + 12);
    doc.text(exp.category, margin + 35, vy + 12);

    const st = exp.status === 'approved' ? 'Aprobado' : exp.status === 'rejected' ? 'Observado' : 'Por Revisar';
    doc.text(st, margin + 85, vy + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Bs. ${exp.amount.toFixed(2)}`, pageWidth - margin - 4, vy + 13, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONCEPTO:', margin + 4, vy + 19);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(exp.concept, margin + 25, vy + 19);

    vy += 30;

    if (exp.financeNotes) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, vy, contentWidth, 9, 2, 2, 'FD');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Nota de Finanzas:', margin + 3, vy + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(exp.financeNotes, margin + 35, vy + 5.5);
      vy += 13;
    }

    // Voucher Image
    if (exp.receiptUrl) {
      try {
        const { dataUrl, width, height } = await getRasterDataUrl(exp.receiptUrl);

        const maxImgW = contentWidth;
        const maxImgH = pageHeight - vy - 20;

        let renderW = maxImgW;
        let renderH = (height / width) * renderW;

        if (renderH > maxImgH) {
          renderH = maxImgH;
          renderW = (width / height) * renderH;
        }

        const imgX = margin + (contentWidth - renderW) / 2;

        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(imgX - 2, vy - 2, renderW + 4, renderH + 4, 2, 2, 'FD');

        doc.addImage(dataUrl, 'JPEG', imgX, vy, renderW, renderH);
      } catch (err) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, vy, contentWidth, 30, 2, 2, 'FD');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text('No fue posible renderizar la imagen del comprobante.', margin + 10, vy + 15);
      }
    } else {
      doc.setDrawColor(254, 243, 199);
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, vy, contentWidth, 25, 2, 2, 'FD');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.text('Gasto registrado sin foto física adjunta.', margin + 10, vy + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Comprobante abierto o pendiente por adjuntar.', margin + 10, vy + 17);
    }

    // Page footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Expediente ${relation.code} · ${relation.employeeName}`, margin, pageHeight - 8);
    doc.text(`Página ${i + 2} de ${relExpenses.length + 1}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  doc.save(`expediente_comprobantes_${relation.code}.pdf`);
}

/**
 * Descarga del Reporte Formal de Liquidación en PDF (Hoja limpia con resumen contable y firmas)
 */
export function downloadRelationSummaryReportPdf(
  relation: TripRelation,
  expenses: Expense[]
): void {
  const relExpenses = expenses.filter(e => e.relationId === relation.id);
  const totalSpentVes = relExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetVes = relation.allocatedBudget;
  const diffVes = budgetVes - totalSpentVes;
  const isEmployeeRefund = diffVes < 0;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SISTEMA DE CONTROL Y RENDICIÓN DE VIÁTICOS', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('PLANILLA OFICIAL DE LIQUIDACIÓN Y AUDITORÍA CONTABLE (Bs. VES)', margin, 18);

  const currentDate = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Fecha: ${currentDate}`, pageWidth - margin, 18, { align: 'right' });

  let y = 36;

  // Metadata Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('N° DE RELACIÓN:', margin + 4, y + 6);
  doc.text('COLABORADOR:', margin + 4, y + 13);
  doc.text('MISIÓN / TÍTULO:', margin + 4, y + 20);
  doc.text('DESTINO Y PERÍODO:', margin + 4, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(relation.code, margin + 35, y + 6);
  doc.text(relation.employeeName, margin + 35, y + 13);
  doc.text(relation.title, margin + 35, y + 20);
  doc.text(`${relation.destination} (${relation.startDate} al ${relation.endDate})`, margin + 35, y + 27);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ESTADO:', margin + 110, y + 6);
  doc.text('MONEDA:', margin + 110, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const st = relation.status === 'settled' ? 'Liquidada y Cerrada' : relation.status === 'submitted' ? 'En Auditoría' : 'Abierta / En Ruta';
  doc.text(st, margin + 125, y + 6);
  doc.text('Bolívares (VES)', margin + 125, y + 13);

  y += 35;

  // Table of Expenses
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DETALLE DE GASTOS Y COMPROBANTES CONSIGNADOS:', margin, y);

  y += 4;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FECHA', margin + 3, y + 5);
  doc.text('RUBRO / CATEGORÍA', margin + 25, y + 5);
  doc.text('CONCEPTO / DESCRIPCIÓN', margin + 65, y + 5);
  doc.text('ESTADO', margin + 125, y + 5);
  doc.text('MONTO (Bs.)', pageWidth - margin - 3, y + 5, { align: 'right' });

  y += 7;

  relExpenses.forEach((exp, idx) => {
    if (y > pageHeight - 55) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 250);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(exp.date, margin + 3, y + 4.5);
    doc.text(exp.category, margin + 25, y + 4.5);

    const truncConcept = exp.concept.length > 40 ? exp.concept.substring(0, 38) + '...' : exp.concept;
    doc.text(truncConcept, margin + 65, y + 4.5);

    const expSt = exp.status === 'approved' ? 'Aprobado' : exp.status === 'rejected' ? 'Observado' : 'Pendiente';
    doc.text(expSt, margin + 125, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`Bs. ${exp.amount.toFixed(2)}`, pageWidth - margin - 3, y + 4.5, { align: 'right' });

    y += 6.5;
  });

  y += 6;

  // Financial Balance Box
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  const balBoxW = (contentWidth - 6) / 3;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, balBoxW, 18, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('FONDO ASIGNADO (Bs.):', margin + 3, y + 5.5);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bs. ${budgetVes.toFixed(2)}`, margin + 3, y + 13);

  doc.roundedRect(margin + balBoxW + 3, y, balBoxW, 18, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL GASTADO (Bs.):', margin + balBoxW + 6, y + 5.5);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bs. ${totalSpentVes.toFixed(2)}`, margin + balBoxW + 6, y + 13);

  // Balance box
  if (isEmployeeRefund) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
  } else {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
  }
  doc.roundedRect(margin + (balBoxW + 3) * 2, y, balBoxW, 18, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isEmployeeRefund ? 153 : 6, isEmployeeRefund ? 27 : 95, isEmployeeRefund ? 27 : 70);
  doc.text(
    isEmployeeRefund ? 'REEMBOLSAR AL COLABORADOR:' : 'REINTEGRO A LA EMPRESA:',
    margin + (balBoxW + 3) * 2 + 3,
    y + 5.5
  );
  doc.setFontSize(11);
  doc.text(`Bs. ${Math.abs(diffVes).toFixed(2)}`, margin + (balBoxW + 3) * 2 + 3, y + 13);

  y += 26;

  // Signatures
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 25;
  }

  const sigW = (contentWidth - 10) / 3;

  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 12, margin + sigW, y + 12);
  doc.line(margin + sigW + 5, y + 12, margin + sigW * 2 + 5, y + 12);
  doc.line(margin + sigW * 2 + 10, y + 12, pageWidth - margin, y + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(relation.employeeName, margin + sigW / 2, y + 16, { align: 'center' });
  doc.text('Analista de Finanzas', margin + sigW + 5 + sigW / 2, y + 16, { align: 'center' });
  doc.text('Gerencia de Administración', margin + sigW * 2 + 10 + sigW / 2, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma del Colaborador (Rinde Cuenta)', margin + sigW / 2, y + 20, { align: 'center' });
  doc.text('Revisión y Validación de Comprobantes', margin + sigW + 5 + sigW / 2, y + 20, { align: 'center' });
  doc.text('Aprobación de Liquidación', margin + sigW * 2 + 10 + sigW / 2, y + 20, { align: 'center' });

  doc.save(`reporte_liquidacion_${relation.code}.pdf`);
}
