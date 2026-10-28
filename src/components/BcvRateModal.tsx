import React, { useState } from 'react';
import { X, RefreshCw, Check, Info } from 'lucide-react';

interface BcvRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRate: number;
  onSaveRate: (newRate: number) => void;
}

export const BcvRateModal: React.FC<BcvRateModalProps> = ({
  isOpen,
  onClose,
  currentRate,
  onSaveRate,
}) => {
  const [rateInput, setRateInput] = useState<string>(currentRate.toString());
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Por favor ingresa una tasa de cambio válida mayor a 0');
      return;
    }
    onSaveRate(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              BCV
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tasa Oficial de Cambio (BCV)</h3>
              <p className="text-xs text-slate-500">Banco Central de Venezuela (Bs. por USD)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Esta tasa se utiliza para la conversión automática al registrar nuevos gastos en Bolívares o Dólares, y para unificar los totales consolidados.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tasa de Cambio Vigente (Bs. / 1 USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Bs.
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rateInput}
                onChange={e => {
                  setRateInput(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-2.5 text-base font-mono-numbers font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="52.85"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <span className="font-semibold text-slate-700 block">Ejemplo de conversión con esta tasa:</span>
            <div className="flex justify-between font-mono-numbers">
              <span>$ 10.00 USD</span>
              <span className="font-medium text-slate-900">
                = Bs. {((parseFloat(rateInput) || 0) * 10).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-mono-numbers">
              <span>$ 50.00 USD</span>
              <span className="font-medium text-slate-900">
                = Bs. {((parseFloat(rateInput) || 0) * 50).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Tasa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
