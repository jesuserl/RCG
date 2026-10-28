import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { CATEGORIES_CONFIG, ALL_CATEGORIES } from '../utils/categories';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryBreakdownProps {
  expenses: Expense[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ expenses }) => {
  const [hoveredCategory, setHoveredCategory] = useState<ExpenseCategory | null>(null);

  // Group amounts by category in Bolívares
  const categoryTotals: Record<ExpenseCategory, { count: number; total: number }> = {
    Hospedaje: { count: 0, total: 0 },
    Alimentación: { count: 0, total: 0 },
    Transporte: { count: 0, total: 0 },
    Combustible: { count: 0, total: 0 },
    Otros: { count: 0, total: 0 },
  };

  let grandTotal = 0;

  expenses.forEach(e => {
    if (categoryTotals[e.category]) {
      categoryTotals[e.category].count += 1;
      categoryTotals[e.category].total += e.amount;
      grandTotal += e.amount;
    }
  });

  // Build SVG Donut slices
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const slices = ALL_CATEGORIES.map(cat => {
    const total = categoryTotals[cat].total;
    const percent = grandTotal > 0 ? total / grandTotal : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      category: cat,
      percent,
      strokeDasharray,
      strokeDashoffset,
      total: categoryTotals[cat].total,
      count: categoryTotals[cat].count,
      config: CATEGORIES_CONFIG[cat],
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-slate-500" />
            Desglose de Gastos por Categoría (Bs.)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución en Bolívares ({expenses.length} comprobantes)
          </p>
        </div>
        <span className="text-xs font-bold text-slate-900 font-mono-numbers">
          Total: Bs. {grandTotal.toFixed(2)}
        </span>
      </div>

      {grandTotal === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p className="text-xs">No hay gastos registrados en Bolívares.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
          {/* Donut Chart Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {slices.map(slice => {
                  if (slice.percent === 0) return null;
                  const isHovered = hoveredCategory === slice.category;
                  return (
                    <circle
                      key={slice.category}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={slice.config.chartColor}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                {hoveredCategory ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[100px]">
                      {hoveredCategory}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                      {(slices.find(s => s.category === hoveredCategory)?.percent || 0 * 100).toLocaleString(undefined, {
                        style: 'percent',
                        minimumFractionDigits: 1,
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      TOTAL VES
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono-numbers">
                      Bs. {(grandTotal / 1000).toFixed(1)}k
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="md:col-span-7 space-y-2.5">
            {slices.map(slice => {
              const isHovered = hoveredCategory === slice.category;

              return (
                <div
                  key={slice.category}
                  onMouseEnter={() => setHoveredCategory(slice.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                    isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-xs'
                      : 'border-transparent hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.config.chartColor }}
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {slice.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({slice.count})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-xs font-bold text-slate-900 font-mono-numbers block">
                      Bs. {slice.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-numbers">
                      {(slice.percent * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
