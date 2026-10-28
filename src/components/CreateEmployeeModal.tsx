import React, { useState } from 'react';
import { EmployeeProfile } from '../types';
import { X, UserPlus, RefreshCw, KeyRound, Building, Briefcase } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<EmployeeProfile, 'id'>) => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Operaciones e Ingeniería');
  const [position, setPosition] = useState('');
  const [token, setToken] = useState(() => `EMP-${Math.floor(1000 + Math.random() * 9000)}`);

  if (!isOpen) return null;

  const handleGenerateToken = () => {
    setToken(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim() || !token.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    onSave({
      name: name.trim(),
      department: department.trim(),
      position: position.trim(),
      token: token.trim().toUpperCase(),
      createdAt: Date.now(),
    });

    // Reset and close
    setName('');
    setPosition('');
    setToken(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Registrar Nuevo Colaborador
              </h3>
              <p className="text-xs text-slate-500">
                Crea el perfil y emite el token de acceso para la rendición de viáticos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
              Nombre Completo del Colaborador:
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Andrés G. Rivas"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                Departamento / Área:
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="Operaciones e Ingeniería">Operaciones e Ingeniería</option>
                <option value="Comercial y Ventas">Comercial y Ventas</option>
                <option value="Tecnología e Infraestructura">Tecnología e Infraestructura</option>
                <option value="Logística y Distribución">Logística y Distribución</option>
                <option value="Mantenimiento y Planta">Mantenimiento y Planta</option>
                <option value="Administración y Finanzas">Administración y Finanzas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                Cargo / Rol:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Inspector de Calidad"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Token Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Token Personal de Acceso:</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateToken}
                className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generar otro</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={token}
              onChange={e => setToken(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider text-blue-900 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Entrega este token al colaborador. Al ingresar a la app seleccionará su nombre y este token para visualizar exclusivamente sus viajes y relaciones.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Guardar y Asignar Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
