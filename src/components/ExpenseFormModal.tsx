import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Coins, 
  Sparkles, 
  Trash2, 
  Check, 
  Receipt,
  FileCheck,
  FolderOpen
} from 'lucide-react';
import { Expense, ExpenseCategory, TripRelation } from '../types';
import { CATEGORIES_CONFIG, ALL_CATEGORIES } from '../utils/categories';
import { generateSampleReceiptSvg } from '../utils/sampleReceipts';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  relations: TripRelation[];
  activeRelationId?: string;
  currentEmployeeName: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  relations,
  activeRelationId,
  currentEmployeeName,
}) => {
  const [relationId, setRelationId] = useState<string>(activeRelationId || relations[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Alimentación');
  const [concept, setConcept] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeRelationId) {
      setRelationId(activeRelationId);
    } else if (relations.length > 0 && !relationId) {
      setRelationId(relations[0].id);
    }
  }, [activeRelationId, relations]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen no debe superar los 8 MB');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSampleReceipt = () => {
    const randomTicketNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const storeMap: Record<ExpenseCategory, string> = {
      Hospedaje: 'Hotel & Posada Ejecutiva',
      Alimentación: 'Restaurante & Panadería Criolla',
      Transporte: 'Transporte Terrestre Interurbano',
      Combustible: 'Estación de Servicios y Combustible',
      Otros: 'Papelería y Suministros Comerciales',
    };

    const store = storeMap[category] || 'Establecimiento Comercial';
    const sampleConcept = concept.trim() || `Gasto de ${category.toLowerCase()} durante viaje`;
    const sampleAmount = numericAmount > 0 ? numericAmount : 1850.00;

    if (!amountStr) {
      setAmountStr(sampleAmount.toString());
    }

    const generatedSvgData = generateSampleReceiptSvg(
      store,
      category,
      sampleConcept,
      sampleAmount,
      'VES',
      date,
      randomTicketNum
    );

    setReceiptUrl(generatedSvgData);
    setReceiptFileName(`factura_${category.toLowerCase()}_${date}.svg`);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      setError('Por favor indica una descripción o concepto del gasto');
      return;
    }
    if (numericAmount <= 0) {
      setError('El monto del gasto debe ser mayor a Bs. 0');
      return;
    }

    const selectedRel = relations.find(r => r.id === relationId);
    if (!selectedRel) {
      setError('Debes seleccionar una relación de viáticos válida');
      return;
    }

    onSave({
      relationId: selectedRel.id,
      date,
      category,
      concept: concept.trim(),
      amount: numericAmount,
      employeeName: selectedRel.employeeName,
      projectName: selectedRel.title,
      receiptUrl,
      receiptFileName,
      status: 'pending',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registrar Comprobante de Gasto (Bs.)</h3>
            <p className="text-xs text-slate-500">Ingresa los datos de la factura en Bolívares y adjunta la foto</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Relación de Viáticos Asignada */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Relación de Viáticos Asignada *</span>
            </label>
            {relations.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No tienes relaciones activas asignadas por Finanzas.
              </div>
            ) : relations.length === 1 ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono-numbers font-bold text-blue-700">{relations[0].code}:</span>
                  <span className="font-semibold text-slate-900 ml-1.5">{relations[0].title}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    Fondo Asignado: Bs. {relations[0].allocatedBudget.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded shrink-0">
                  Asignada
                </span>
              </div>
            ) : (
              <select
                value={relationId}
                onChange={e => setRelationId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              >
                {relations.map(rel => (
                  <option key={rel.id} value={rel.id}>
                    {rel.code} — {rel.title} (Fondo: Bs. {rel.allocatedBudget.toFixed(2)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha y Monto en Bolívares */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha del Gasto *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monto en Bolívares (Bs. VES) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Bs.
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={e => {
                    setAmountStr(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-12 pr-4 py-2 text-sm font-mono-numbers font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Selector de Categorías */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Categoría de Gasto *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ALL_CATEGORIES.map(cat => {
                const config = CATEGORIES_CONFIG[cat];
                const Icon = config.icon;
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-semibold truncate w-full">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concepto / Descripción del Gasto *
            </label>
            <input
              type="text"
              placeholder="Ej. Almuerzo de trabajo con equipo técnico en restaurante..."
              value={concept}
              onChange={e => {
                setConcept(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Adjunto de Comprobante / Foto */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Foto de Factura o Ticket Fiscal (Bs.)</span>
              </label>
              
              <button
                type="button"
                onClick={handleGenerateSampleReceipt}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                title="Generar factura de prueba con código de barra"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generar Ticket Demo
              </button>
            </div>

            {receiptUrl ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptUrl}
                    alt="Comprobante"
                    className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Comprobante adjuntado
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                      {receiptFileName || 'factura_adjunta.png'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptUrl(undefined);
                      setReceiptFileName(undefined);
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    title="Eliminar comprobante"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
              >
                <div className="flex justify-center gap-2 mb-1.5 text-slate-400">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Toca para tomar foto de la factura con la cámara o subir archivo
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formatos PNG, JPG o PDF hasta 8 MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar Gasto (Bs.)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
