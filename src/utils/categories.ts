import { ExpenseCategory } from '../types';
import { 
  Building2, 
  UtensilsCrossed, 
  Car, 
  Fuel, 
  MoreHorizontal 
} from 'lucide-react';
import React from 'react';

export interface CategoryMeta {
  name: ExpenseCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  chartColor: string;
  description: string;
}

export const CATEGORIES_CONFIG: Record<ExpenseCategory, CategoryMeta> = {
  Hospedaje: {
    name: 'Hospedaje',
    icon: Building2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    chartColor: '#4f46e5',
    description: 'Hoteles, posadas y estancias de viaje',
  },
  Alimentación: {
    name: 'Alimentación',
    icon: UtensilsCrossed,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    chartColor: '#d97706',
    description: 'Desayunos, almuerzos, cenas y refrigerios de trabajo',
  },
  Transporte: {
    name: 'Transporte',
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    chartColor: '#2563eb',
    description: 'Boletos aéreos, buses ejecutivos, taxis y traslados',
  },
  Combustible: {
    name: 'Combustible',
    icon: Fuel,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    chartColor: '#059669',
    description: 'Gasolina y peajes para vehículos asignados',
  },
  Otros: {
    name: 'Otros',
    icon: MoreHorizontal,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    chartColor: '#9333ea',
    description: 'Impresiones, papelería, llamadas o imprevistos',
  },
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Hospedaje',
  'Alimentación',
  'Transporte',
  'Combustible',
  'Otros',
];
