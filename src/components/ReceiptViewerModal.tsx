import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, FileText, FileDown, Loader2 } from 'lucide-react';
import { Expense, TripRelation } from '../types';
import { downloadSingleExpensePdf } from '../utils/pdfGenerator';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  concept: string;
  amount: number;
  currency?: string;
  date: string;
  fileName?: string;
  expense?: Expense;
  relation?: TripRelation;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  concept,
  amount,
  currency = 'Bs.',
  date,
  fileName,
  expense,
  relation,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !receiptUrl) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = fileName || `comprobante_${date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const expToUse: Expense = expense || {
        id: 'exp-temp',
        relationId: relation?.id || '',
        employeeName: relation?.employeeName || 'Colaborador',
        projectName: relation?.title || 'Relación de Gastos',
        category: 'Otros',
        concept,
        amount,
        date,
        receiptUrl,
        receiptFileName: fileName,
        status: 'pending',
        createdAt: Date.now(),
      };
      await downloadSingleExpensePdf(expToUse, relation);
    } catch (err) {
      console.error('Error generando PDF de comprobante:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-semibold text-slate-900 truncate max-w-sm sm:max-w-md">
              {concept}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{date}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-numbers font-medium text-slate-700">
                Bs. {amount.toFixed(2)}
              </span>
              {fileName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[120px]">{fileName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Disminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Girar imagen"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Descargar comprobante en PDF formateado"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Descargar imagen original"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center min-h-[360px] max-h-[65vh]">
          <div
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            {receiptUrl.startsWith('data:image/') || receiptUrl.startsWith('blob:') || receiptUrl.startsWith('http') ? (
              <img
                src={receiptUrl}
                alt={`Comprobante de ${concept}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md bg-white border border-slate-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow border border-slate-200 text-center">
                <FileText className="w-16 h-16 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">Comprobante documental registrado</p>
                <p className="text-xs text-slate-500 mt-1">{fileName || 'Documento adjunto'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <span>Usa los controles para ampliar o rotar el documento</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cerrar visor
          </button>
        </div>
      </div>
    </div>
  );
};
