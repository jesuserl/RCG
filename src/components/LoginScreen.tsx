import React, { useState } from 'react';
import { EmployeeProfile, DEFAULT_ADMIN_TOKEN } from '../types';
import { 
  KeyRound, 
  ShieldCheck, 
  User, 
  Lock, 
  AlertCircle, 
  Coins, 
  Eye, 
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Cloud,
  Database,
  RefreshCw
} from 'lucide-react';

interface LoginScreenProps {
  employees: EmployeeProfile[];
  adminToken: string;
  onLoginEmployee: (employee: EmployeeProfile) => void;
  onLoginAdmin: () => void;
  onSeedDatabase?: () => Promise<any>;
  isSeeding?: boolean;
  projectRef?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  employees,
  adminToken,
  onLoginEmployee,
  onLoginAdmin,
  onSeedDatabase,
  isSeeding = false,
  projectRef = 'qwivjixoziyliggczocf',
}) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>(() => (employees.length === 0 ? 'admin' : 'employee'));

  // Employee login state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => employees[0]?.id || '');
  const [employeeTokenInput, setEmployeeTokenInput] = useState<string>('');
  const [showEmployeeToken, setShowEmployeeToken] = useState<boolean>(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // Sync active tab and selected employee when employees list changes
  React.useEffect(() => {
    if (employees.length === 0) {
      setActiveTab('admin');
    } else if (!employees.some(e => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  // Admin login state
  const [adminTokenInput, setAdminTokenInput] = useState<string>('');
  const [showAdminToken, setShowAdminToken] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError(null);

    if (!selectedEmployee) {
      setEmployeeError('Por favor selecciona un colaborador.');
      return;
    }

    const trimmedInput = employeeTokenInput.trim();
    if (!trimmedInput) {
      setEmployeeError('Por favor ingresa tu token personal de acceso.');
      return;
    }

    if (trimmedInput !== selectedEmployee.token.trim()) {
      setEmployeeError('Token incorrecto. Verifica con el Administrador de Finanzas.');
      return;
    }

    onLoginEmployee(selectedEmployee);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const trimmedInput = adminTokenInput.trim();
    if (!trimmedInput) {
      setAdminError('Ingresa el token de administración.');
      return;
    }

    const targetToken = adminToken || DEFAULT_ADMIN_TOKEN;
    if (trimmedInput !== targetToken.trim()) {
      setAdminError('Token de administrador no válido.');
      return;
    }

    onLoginAdmin();
  };


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <header className="max-w-md w-full mx-auto pt-6 sm:pt-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-600/30 mb-3">
          V
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Registro de Viáticos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sistema de Control y Rendición de Viáticos (Bs. VES)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 font-mono-numbers">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-[11px] font-semibold text-slate-300">
            <Coins className="w-3.5 h-3.5 text-blue-400" />
            <span>Moneda: Bs. VES</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-full text-[11px] font-semibold text-emerald-300">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase DB ({projectRef})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/90 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('employee');
              setEmployeeError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'employee'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Colaborador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrador</span>
          </button>
        </div>

        {/* Form 1: Colaborador */}
        {activeTab === 'employee' && (
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Selecciona tu Nombre:
              </label>
              {employees.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    Aún no hay colaboradores en la tabla <code className="text-emerald-400">employees</code> de Supabase.
                  </p>
                  <div className="flex flex-col gap-2">
                    {onSeedDatabase && (
                      <button
                        type="button"
                        onClick={onSeedDatabase}
                        disabled={isSeeding}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                        <span>{isSeeding ? 'Inicializando...' : 'Inicializar Datos Base en Supabase'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Ingresar como Administrador &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <select
                      value={selectedEmployeeId}
                      onChange={e => {
                        setSelectedEmployeeId(e.target.value);
                        setEmployeeTokenInput('');
                        setEmployeeError(null);
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} — {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedEmployee && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cargo: <span className="text-slate-300">{selectedEmployee.position}</span>
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Token de Acceso Personal:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showEmployeeToken ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={employeeTokenInput}
                  onChange={e => {
                    setEmployeeTokenInput(e.target.value);
                    if (employeeError) setEmployeeError(null);
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowEmployeeToken(!showEmployeeToken)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showEmployeeToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {employeeError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{employeeError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
            >
              <span>Ingresar a mi Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300 block mb-0.5">Aviso de Privacidad y Seguridad:</span>
              Cada colaborador únicamente tiene acceso a sus viajes asignados en Bolívares y sus comprobantes de gastos.
            </div>
          </form>
        )}

        {/* Form 2: Administrador */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/70 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-600/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block">Acceso Administrativo y Finanzas</span>
                <span className="text-emerald-400/80 text-[11px]">
                  Crea relaciones en Bolívares, administra colaboradores, gestiona tokens y audita facturas.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Clave de Acceso Administrador:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showAdminToken ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={adminTokenInput}
                  onChange={e => {
                    setAdminTokenInput(e.target.value);
                    if (adminError) setAdminError(null);
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminToken(!showAdminToken)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showAdminToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
            >
              <span>Acceder al Panel de Administración</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300 block mb-0.5">Control Centralizado:</span>
              La configuración de la base de datos Supabase y la emisión de tokens de colaboradores se gestionan dentro de este panel.
            </div>
          </form>
        )}
      </div>

      {/* Footer System Info */}
      <footer className="text-center pb-4 text-xs text-slate-500">
        <p>ViáticosPro &copy; 2026 · Despliegue en Vercel con Base de Datos Supabase</p>
      </footer>
    </div>
  );
};
