import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, Printer } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'expenses';
  onChangeTab: (tab: 'dashboard' | 'expenses') => void;
  onOpenNewExpense: () => void;
  onOpenReport: () => void;
  pendingFinanceCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewExpense,
  onOpenReport,
  pendingFinanceCount = 0,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around no-print shadow-lg">
      <button
        onClick={() => onChangeTab('dashboard')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Panel</span>
      </button>

      <button
        onClick={() => onChangeTab('expenses')}
        className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'expenses' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Receipt className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Gastos</span>
        {pendingFinanceCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {pendingFinanceCount}
          </span>
        )}
      </button>

      {/* Floating Center Action */}
      <button
        onClick={onOpenNewExpense}
        className="flex flex-col items-center justify-center -mt-5 min-w-[56px] min-h-[44px]"
      >
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform">
          <PlusCircle className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-bold text-blue-600 mt-1">Registrar</span>
      </button>

      <button
        onClick={onOpenReport}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Printer className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Reporte</span>
      </button>
    </div>
  );
};
