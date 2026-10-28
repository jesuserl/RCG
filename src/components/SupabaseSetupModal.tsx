import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

  const sqlSample = `-- Copia y corre esto en Supabase SQL Editor:
-- (El archivo completo está guardado en: /supabase/schema.sql)
CREATE TABLE IF NOT EXISTS public.trip_relations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    allocated_budget_usd NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    bcv_rate_at_creation NUMERIC(10, 2) NOT NULL DEFAULT 52.85,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    relation_id TEXT NOT NULL REFERENCES public.trip_relations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    concept TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    bcv_rate NUMERIC(10, 2) NOT NULL DEFAULT 52.85,
    amount_usd NUMERIC(12, 2) NOT NULL,
    amount_ves NUMERIC(12, 2) NOT NULL,
    employee_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    finance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Conexión Vercel + Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-500">
                Configuración de base de datos relacional y despliegue continuo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${isConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
            <div>
              <span className="font-bold block text-sm">
                {isConnected
                  ? 'Base de Datos Supabase Conectada'
                  : 'Modo Local Activo (Listo para Vercel + Supabase)'}
              </span>
              <p className="text-xs mt-0.5 opacity-90">
                {isConnected
                  ? 'Tus relaciones de viáticos y comprobantes se están sincronizando en tiempo real con las tablas PostgreSQL de tu proyecto en Supabase.'
                  : 'La app funciona de forma local con persistencia continua. Para conectar tu base de datos Supabase en Vercel, sigue los 3 pasos a continuación.'}
              </p>
            </div>
          </div>

          {/* Steps for Vercel & Supabase */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pasos para conectar Supabase y desplegar en Vercel:
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Crear las tablas en Supabase
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>
              <p className="text-slate-600 text-xs">
                Entra a tu proyecto en <strong>Supabase</strong>, abre <strong>SQL Editor</strong>, pega el script disponible en <code className="bg-slate-200 px-1 rounded">/supabase/schema.sql</code> y presiona <strong>RUN</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                Obtener credenciales de API
              </span>
              <p className="text-slate-600 text-xs">
                En tu panel de Supabase ve a <strong>Project Settings → API</strong> y copia:
              </p>
              <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 ml-2 font-mono-numbers">
                <li><code>Project URL</code> (ej. <code>https://xyzcompany.supabase.co</code>)</li>
                <li><code>anon / public API key</code></li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                Configurar Variables en Vercel
              </span>
              <p className="text-slate-600 text-xs">
                En tu proyecto de <strong>Vercel</strong> ve a <strong>Settings → Environment Variables</strong> y agrega:
              </p>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg space-y-1">
                <div>VITE_SUPABASE_URL = https://tu-proyecto.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY = tu_clave_anon_publica</div>
              </div>
              <p className="text-slate-500 text-[11px]">
                ¡Listo! Al hacer <code>git push</code>, Vercel compila la aplicación y sincroniza automáticamente los gastos y relaciones con Supabase en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Archivo de configuración de Vercel generado: <code>vercel.json</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
