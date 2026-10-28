import React from 'react';
import { PortalMode } from '../types';
import { 
  Briefcase, 
  ShieldCheck, 
  Database,
  Coins
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface TopBarProps {
  portalMode: PortalMode;
  onChangePortalMode: (mode: PortalMode) => void;
  onOpenSupabaseModal: () => void;
  currentEmployeeName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  portalMode,
  onChangePortalMode,
  onOpenSupabaseModal,
  currentEmployeeName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            V
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
              ViáticosPro
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Control de Viáticos (Bs. VES)
            </span>
          </div>
        </div>

        {/* Center Portal Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl text-xs">
          {portalMode === 'admin' ? (
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panel Administrador (Finanzas)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Portal del Colaborador ({currentEmployeeName})</span>
            </div>
          )}
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Moneda Fija VES Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl font-mono-numbers">
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            <span>Moneda: Bs.</span>
          </div>

          {/* Supabase Cloud Connection Status */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Configuración de base de datos Supabase en Vercel"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">
              {isSupabaseConfigured() ? 'Supabase Conectado' : 'DB Supabase'}
            </span>
          </button>

          {/* Independent Portal Switcher Button */}
          {portalMode === 'admin' ? (
            <button
              onClick={() => onChangePortalMode('employee')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="Cambiar al Portal de Empleado"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Ir a Portal Empleado</span>
            </button>
          ) : (
            <button
              onClick={() => onChangePortalMode('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
              title="Acceso restringido para el Administrador de Finanzas"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Acceso Administrador</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
