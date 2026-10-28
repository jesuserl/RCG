import React from 'react';
import { PortalMode, EmployeeProfile } from '../types';
import { 
  Briefcase, 
  ShieldCheck, 
  Coins,
  LogOut,
  UserCheck
} from 'lucide-react';

interface TopBarProps {
  portalMode: PortalMode;
  currentEmployee?: EmployeeProfile;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  portalMode,
  currentEmployee,
  onLogout,
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

        {/* Center Portal Identity Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs">
          {portalMode === 'admin' ? (
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sesión: Administrador de Finanzas</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Colaborador: {currentEmployee?.name || 'Usuario'}</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                ({currentEmployee?.token})
              </span>
            </div>
          )}
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Moneda Fija VES Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl font-mono-numbers">
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            <span>Bs. VES</span>
          </div>

          {/* Cerrar Sesión Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Cerrar sesión actual y volver a la pantalla de acceso con token"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
