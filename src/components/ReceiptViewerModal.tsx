import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, FileText } from 'lucide-react';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  concept: string;
  amount: number;
  currency: string;
  date: string;
  fileName?: string;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  concept,
  amount,
  currency,
  date,
  fileName,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !receiptUrl) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = fileName || `comprobante_${date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                {currency === 'USD' ? '$' : 'Bs.'} {amount.toFixed(2)}
              </span>
              {fileName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[120px]">{fileName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Disminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Girar imagen"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Descargar comprobante"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
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
