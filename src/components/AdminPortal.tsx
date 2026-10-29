import React, { useState, useEffect } from 'react';
import { 
  TripRelation, 
  Expense, 
  EmployeeProfile, 
  DEFAULT_ADMIN_TOKEN,
  DataSourceMode,
  SupabaseDiagnostics 
} from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { CategoryBreakdown } from './CategoryBreakdown';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { 
  Plus, 
  ShieldCheck, 
  FolderPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Printer, 
  Search, 
  Download, 
  User, 
  MapPin, 
  Calendar, 
  KeyRound,
  Users,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Database,
  ExternalLink,
  Save,
  Server,
  AlertCircle,
  Sparkles,
  Cloud,
  HardDrive,
  UploadCloud,
  DownloadCloud,
  Layers,
  ArrowRight,
  Coins,
  AlertTriangle
} from 'lucide-react';
import { exportExpensesToCsv } from '../utils/exportCsv';
import { 
  supabase,
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  saveSupabaseCredentials,
  cleanSupabaseUrl,
  extractProjectRef 
} from '../lib/supabase';
import { fetchSupabaseDiagnostics } from '../services/supabaseService';

interface AdminPortalProps {
  relations: TripRelation[];
  expenses: Expense[];
  employees: EmployeeProfile[];
  adminToken: string;
  dataSourceMode?: DataSourceMode;
  onToggleDataSourceMode?: (mode: DataSourceMode) => void;
  onMigrateLocalToSupabase?: () => Promise<{ success: boolean; message: string }>;
  onSeedInitialData?: () => Promise<{ success: boolean; message: string }>;
  onLoadFromSupabase: () => Promise<void>;
  onOpenCreateRelation: () => void;
  onDeleteRelation?: (relationId: string) => Promise<void> | void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string, notes: string) => void;
  onSettleRelation: (relationId: string) => void;
  onViewReceipt: (expense: Expense) => void;
  onOpenPrintReport: (relation: TripRelation) => void;
  onCreateEmployee: (newEmp: Omit<EmployeeProfile, 'id'>) => void;
  onUpdateEmployeeToken: (employeeId: string, newToken: string) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onUpdateAdminToken: (newToken: string) => void;
  onSyncSupabase?: () => void;
  onClearAllData?: () => Promise<{ success: boolean; message: string }>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  relations,
  expenses,
  employees,
  adminToken,
  dataSourceMode = 'supabase',
  onToggleDataSourceMode,
  onMigrateLocalToSupabase,
  onSeedInitialData,
  onLoadFromSupabase,
  onOpenCreateRelation,
  onDeleteRelation,
  onApproveExpense,
  onRejectExpense,
  onSettleRelation,
  onViewReceipt,
  onOpenPrintReport,
  onCreateEmployee,
  onUpdateEmployeeToken,
  onDeleteEmployee,
  onUpdateAdminToken,
  onSyncSupabase,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'relations' | 'audit' | 'analytics' | 'collaborators' | 'database'>('relations');
  const [selectedRelationFilter, setSelectedRelationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // Relation deletion confirmation modal state
  const [relationToDelete, setRelationToDelete] = useState<TripRelation | null>(null);
  const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
  const [isDeletingRelation, setIsDeletingRelation] = useState(false);
  const [relationDeleteError, setRelationDeleteError] = useState<string | null>(null);

  const handleConfirmDeleteRelation = async () => {
    if (!relationToDelete || !onDeleteRelation) return;
    const trimmedInput = deleteConfirmationCode.trim();
    if (trimmedInput !== relationToDelete.code && trimmedInput.toUpperCase() !== 'ELIMINAR') {
      setRelationDeleteError(`Debes escribir ${relationToDelete.code} o la palabra ELIMINAR.`);
      return;
    }

    setIsDeletingRelation(true);
    setRelationDeleteError(null);
    try {
      await onDeleteRelation(relationToDelete.id);
      setRelationToDelete(null);
      setDeleteConfirmationCode('');
    } catch (err: any) {
      setRelationDeleteError(err.message || 'Error al eliminar la relación');
    } finally {
      setIsDeletingRelation(false);
    }
  };

  // Collaborator management state
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [adminTokenEditing, setAdminTokenEditing] = useState(false);
  const [newAdminTokenInput, setNewAdminTokenInput] = useState(adminToken || DEFAULT_ADMIN_TOKEN);

  // Supabase settings state
  const creds = getSupabaseCredentials();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => creds.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => creds.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedDbAlert, setSavedDbAlert] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // Live Supabase Diagnostics
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch live counts on component mount if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      runDiagnostics();
    }
  }, []);

  const runDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    try {
      const diag = await fetchSupabaseDiagnostics();
      setDiagnostics(diag);
      if (diag.connected) {
        setTestStatus('success');
        setTestMessage(`Conexión activa con ${diag.projectId}. Filas en Supabase: ${diag.employeesCount} empleados, ${diag.relationsCount} relaciones, ${diag.expensesCount} gastos.`);
      } else if (diag.error) {
        setTestStatus('error');
        setTestMessage(diag.error);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || 'Error consultando diagnóstico');
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  // Global totals in Bolívares
  const totalAllocated = relations.reduce((sum, r) => sum + r.allocatedBudget, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  // Filtered expenses for the audit view
  const filteredAuditExpenses = expenses.filter(exp => {
    if (selectedRelationFilter !== 'all' && exp.relationId !== selectedRelationFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exp.concept.toLowerCase().includes(q) ||
        exp.employeeName.toLowerCase().includes(q) ||
        exp.projectName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmReject = (id: string) => {
    if (!rejectNotes.trim()) {
      alert('Por favor indica una observación contable para el colaborador');
      return;
    }
    onRejectExpense(id, rejectNotes.trim());
    setRejectingId(null);
    setRejectNotes('');
  };

  const handleExportAllCsv = () => {
    exportExpensesToCsv(expenses, undefined, 'auditoria_general_viaticos_ves');
  };

  const handleCopyToken = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const handleRegenerateToken = (employeeId: string, currentName: string) => {
    const newToken = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    if (window.confirm(`¿Deseas generar un nuevo token de acceso para ${currentName}? El nuevo token será: ${newToken}`)) {
      onUpdateEmployeeToken(employeeId, newToken);
    }
  };

  const handleSaveAdminToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminTokenInput.trim()) {
      alert('El token de administrador no puede estar vacío');
      return;
    }
    onUpdateAdminToken(newAdminTokenInput.trim());
    setAdminTokenEditing(false);
    alert('Token de Administrador actualizado con éxito.');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = cleanSupabaseUrl(supabaseUrlInput);
    saveSupabaseCredentials(cleanUrl, supabaseKeyInput);
    setSavedDbAlert(true);
    setTimeout(() => {
      setSavedDbAlert(false);
      runDiagnostics();
    }, 800);
  };

  const handleTestConnection = async () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setTestStatus('error');
      setTestMessage('Debes ingresar la Project URL y la Anon Key antes de probar.');
      return;
    }
    const cleanUrl = cleanSupabaseUrl(supabaseUrlInput);
    saveSupabaseCredentials(cleanUrl, supabaseKeyInput);
    setTestStatus('testing');
    setTestMessage('Conectando y analizando tablas en Supabase...');

    try {
      const diag = await fetchSupabaseDiagnostics();
      setDiagnostics(diag);
      if (diag.connected) {
        setTestStatus('success');
        setTestMessage(`¡Conexión Verificada! Proyecto: ${diag.projectId}. Tablas detectadas con ${diag.employeesCount} colaboradores, ${diag.relationsCount} relaciones y ${diag.expensesCount} gastos.`);
      } else {
        setTestStatus('error');
        setTestMessage(diag.error || 'No se pudo conectar a las tablas. Verifica si ejecutaste el script SQL.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Fallo de conexión: ${err.message || 'Verifica que la URL y la llave sean válidas'}`);
    }
  };

  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClearDatabase = async () => {
    if (!window.confirm('¿Confirmas que deseas ELIMINAR TODOS LOS DATOS (empleados, viajes y gastos) y dejar únicamente el usuario Administrador con la clave admindc2026*? Esta acción vaciará Supabase y el almacenamiento local.')) {
      return;
    }

    setIsClearing(true);
    setClearResult(null);
    try {
      if (onClearAllData) {
        const res = await onClearAllData();
        setClearResult(res);
      } else {
        setClearResult({ success: false, message: 'Función de limpieza no configurada.' });
      }
      await runDiagnostics();
    } catch (err: any) {
      setClearResult({ success: false, message: err.message || 'Error al vaciar los datos' });
    } finally {
      setIsClearing(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = onSeedInitialData
        ? await onSeedInitialData()
        : onMigrateLocalToSupabase
        ? await onMigrateLocalToSupabase()
        : { success: false, message: 'Operación no disponible' };
      setMigrationResult(res);
      await runDiagnostics();
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: err.message || 'Error en la inicialización de Supabase',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const sqlSample = `-- ==============================================================================
-- VIÁTICOSPRO - ESQUEMA DE BASE DE DATOS POSTGRESQL PARA SUPABASE (SOLO VES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    access_token TEXT NOT NULL DEFAULT 'EMP-1000',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trip_relations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    allocated_budget_ves NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    relation_id TEXT NOT NULL REFERENCES public.trip_relations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    concept TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    employee_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    receipt_url TEXT,
    receipt_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    finance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Políticas de Seguridad (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para API pública con anon key
CREATE POLICY "Acceso publico empleados" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico relaciones" ON public.trip_relations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico gastos" ON public.expenses FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header with Badges & Primary Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Panel de Administración y Finanzas (Bs. VES)
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {relations.length} Relaciones · {employees.length} Colaboradores
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Supabase PostgreSQL</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Asignaciones, Liquidación y Seguridad de Viáticos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea fondos en Bolívares por colaborador, asigna tokens de acceso y audita comprobantes fiscales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportAllCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exportar archivo CSV con todos los gastos y relaciones en Bolívares"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV (Bs.)</span>
          </button>

          <button
            onClick={onOpenCreateRelation}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Cargar Relación (Bs.)</span>
          </button>
        </div>
      </div>

      {/* KPI Global Stat Strip in Bolívares */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Presupuestos Asignados
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-1">
            Bs. {totalAllocated.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers mt-0.5 block">
            En {relations.length} viajes corporativos
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Rendido en Comprobantes
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-1">
            Bs. {totalSpent.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers mt-0.5 block">
            {expenses.length} facturas registradas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pendientes por Auditar
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono-numbers mt-1">
            {pendingExpenses.length} facturas
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Requieren visto bueno de Finanzas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Gastos Aprobados
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono-numbers mt-1">
            {approvedExpenses.length} facturas
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Validadas para liquidación
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('relations')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'relations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Relaciones de Viáticos ({relations.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Auditoría de Comprobantes</span>
          {pendingExpenses.length > 0 && (
            <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {pendingExpenses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('collaborators')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'collaborators' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Colaboradores &amp; Tokens ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Desglose por Rubros
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'database' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Base de Datos Supabase</span>
          {isSupabaseConfigured() && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE RELACIONES CREADAS */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Relaciones Asignadas a Colaboradores (Bs.)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  dataSourceMode === 'supabase' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {dataSourceMode === 'supabase' ? '☁️ Supabase Cloud' : '💾 Local Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                El colaborador únicamente puede justificar gastos contra estas relaciones
              </p>
            </div>

            <button
              onClick={onOpenCreateRelation}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Relación</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {relations.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-600">No hay relaciones creadas en esta fuente de datos</p>
                <p className="text-xs text-slate-400 mt-1">Crea una nueva relación o migra los datos desde la pestaña de Base de Datos</p>
              </div>
            ) : (
              relations.map(rel => {
                const relExpenses = expenses.filter(e => e.relationId === rel.id);
                const spent = relExpenses.reduce((sum, e) => sum + e.amount, 0);
                const remaining = rel.allocatedBudget - spent;
                const progress = rel.allocatedBudget > 0 ? (spent / rel.allocatedBudget) * 100 : 0;
                const isOver = remaining < 0;

                return (
                  <div
                    key={rel.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-mono-numbers font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {rel.code}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{rel.employeeName}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {rel.destination}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {rel.startDate} al {rel.endDate}
                        </span>
                        <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {dataSourceMode === 'supabase' ? '☁️ Supabase' : '💾 Local'}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {rel.title}
                      </h4>

                      {rel.adminNotes && (
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-2xl">
                          Nota: {rel.adminNotes}
                        </p>
                      )}

                      {/* Progress micro bar */}
                      <div className="mt-3 max-w-md space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-500">Ejecución del Fondo:</span>
                          <span className={`font-mono-numbers ${isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {progress.toFixed(1)}% {isOver && '(¡Sobregiro!)'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOver ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right side: Numbers in Bs. + Status + Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Fondo Asignado
                        </span>
                        <div className="text-sm font-black text-slate-900 font-mono-numbers">
                          Bs. {rel.allocatedBudget.toFixed(2)}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 font-mono-numbers">
                          Gastado: Bs. {spent.toFixed(2)} ({relExpenses.length} facturas)
                        </div>
                      </div>

                      {/* Relation Status */}
                      <div className="text-left sm:text-center min-w-[120px]">
                        {rel.status === 'open' && (
                          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Abierta (En ruta)
                          </span>
                        )}
                        {rel.status === 'submitted' && (
                          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            En Revisión
                          </span>
                        )}
                        {rel.status === 'settled' && (
                          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Liquidada / Cerrada
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRelationFilter(rel.id);
                            setActiveTab('audit');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                          title="Auditar comprobantes de esta relación"
                        >
                          Auditar Gastos
                        </button>

                        <button
                          onClick={() => onOpenPrintReport(rel)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                          title="Generar planilla oficial de liquidación"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {rel.status !== 'settled' && (
                          <button
                            onClick={() => onSettleRelation(rel.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                            title="Cerrar y marcar relación como liquidada conforme"
                          >
                            Liquidar
                          </button>
                        )}

                        {onDeleteRelation && (
                          <button
                            onClick={() => {
                              setRelationToDelete(rel);
                              setDeleteConfirmationCode('');
                              setRelationDeleteError(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar relación de viáticos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDITORÍA DE COMPROBANTES */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Filtrar por Relación:</span>
              <select
                value={selectedRelationFilter}
                onChange={e => setSelectedRelationFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="all">Todas las relaciones ({expenses.length} gastos)</option>
                {relations.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.code} — {r.title} ({r.employeeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por concepto o empleado..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Audit List */}
          {filteredAuditExpenses.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No hay comprobantes para este criterio</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAuditExpenses.map(exp => {
                const catCfg = CATEGORIES_CONFIG[exp.category] || CATEGORIES_CONFIG.Otros;
                const isRejecting = rejectingId === exp.id;

                return (
                  <div key={exp.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info & Concept */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base ${catCfg.bgColor} ${catCfg.color}`}
                        >
                          <catCfg.icon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${catCfg.bgColor} ${catCfg.color}`}
                            >
                              {exp.category}
                            </span>
                            <span className="text-slate-500 font-mono-numbers">{exp.date}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-slate-700">{exp.employeeName}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-400 truncate max-w-xs">{exp.projectName}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {dataSourceMode === 'supabase' ? '☁️ Supabase' : '💾 Local'}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {exp.concept}
                          </h4>

                          {/* Notes if any */}
                          {exp.financeNotes && (
                            <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span>Observación de Finanzas: {exp.financeNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount in VES + Receipt + Approval buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Monto Facturado
                          </span>
                          <span className="text-base font-black text-slate-900 font-mono-numbers">
                            Bs. {exp.amount.toFixed(2)}
                          </span>
                        </div>

                        {/* View Receipt button */}
                        {exp.receiptUrl && (
                          <button
                            onClick={() => onViewReceipt(exp)}
                            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Comprobante</span>
                          </button>
                        )}

                        {/* Status Chip */}
                        <div>
                          {exp.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Aprobado</span>
                            </span>
                          )}
                          {exp.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Observado</span>
                            </span>
                          )}
                          {exp.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Por Revisar</span>
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        {exp.status !== 'approved' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onApproveExpense(exp.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Aprobar comprobante contable"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectingId(exp.id);
                                setRejectNotes(exp.financeNotes || '');
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                              title="Observar o rechazar comprobante"
                            >
                              Observar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Reject Form */}
                    {isRejecting && (
                      <div className="mt-3 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-2">
                        <label className="block font-bold text-rose-900">
                          Indica el motivo de la observación para el colaborador:
                        </label>
                        <textarea
                          value={rejectNotes}
                          onChange={e => setRejectNotes(e.target.value)}
                          placeholder="Ej: Factura ilegible, falta RIF fiscal de la empresa, o el monto supera el límite diario autorizado."
                          rows={2}
                          className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-rose-600"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleConfirmReject(exp.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                          >
                            Guardar Observación
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GESTIÓN DE COLABORADORES & TOKENS DE ACCESO */}
      {activeTab === 'collaborators' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Directorio de Colaboradores &amp; Tokens de Acceso
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Aislamiento Estricto
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cada colaborador accede únicamente con su token privado y solo visualiza sus propias relaciones asignadas
                </p>
              </div>

              <button
                onClick={() => setIsCreateEmployeeModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Colaborador</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {employees.map(emp => {
                const empRelations = relations.filter(r => r.employeeName === emp.name);
                const empBudget = empRelations.reduce((sum, r) => sum + r.allocatedBudget, 0);
                const isCopied = copiedTokenId === emp.id;

                return (
                  <div
                    key={emp.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-xl"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{emp.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {emp.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{emp.position}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono-numbers">
                          <span>{empRelations.length} viajes asignados</span>
                          <span>·</span>
                          <span>Presupuesto acumulado: Bs. {empBudget.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Token de Acceso
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-blue-900 rounded-lg border border-slate-200">
                            {emp.token}
                          </span>
                          <button
                            onClick={() => handleCopyToken(emp.id, emp.token)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Copiar token para enviar al colaborador"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleRegenerateToken(emp.id, emp.name)}
                          className="p-2 text-slate-500 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                          title="Regenerar nuevo token de acceso para este usuario"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar al colaborador ${emp.name}?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Admin Token Security Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    Token Maestro de Administrador (Finanzas)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Este token es la llave de acceso a este panel de control y auditoría.
                  </p>
                </div>
              </div>

              {!adminTokenEditing ? (
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-slate-800 rounded-xl border border-slate-700 font-mono font-bold text-sm text-emerald-400">
                    {adminToken || DEFAULT_ADMIN_TOKEN}
                  </div>
                  <button
                    onClick={() => {
                      setNewAdminTokenInput(adminToken || DEFAULT_ADMIN_TOKEN);
                      setAdminTokenEditing(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
                  >
                    Cambiar Token
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveAdminToken} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAdminTokenInput}
                    onChange={e => setNewAdminTokenInput(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 border border-emerald-500 text-white rounded-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTokenEditing(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALÍTICA Y DESGLOSE GLOBAL */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6">
          <CategoryBreakdown expenses={expenses} />
        </div>
      )}

      {/* TAB 5: BASE DE DATOS SUPABASE (POSTGRESQL & DIAGNÓSTICO EN VIVO) */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Notificación de Base de Datos Supabase en Verde (dentro del tab) */}
          <div className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-emerald-50/90 border-emerald-200/90 text-emerald-950 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 bg-emerald-600 text-white shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm">
                    Base de Datos Supabase (PostgreSQL) Conectada
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Persistencia Activa
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Proyecto: <strong>{extractProjectRef(supabaseUrlInput)}</strong> (https://qwivjixoziyliggczocf.supabase.co) · Todos los colaboradores, asignaciones de viáticos y comprobantes fiscales se guardan directamente en PostgreSQL.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await onLoadFromSupabase();
                  await runDiagnostics();
                }}
                className="px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 border border-emerald-300 bg-white hover:bg-slate-50 text-slate-800 cursor-pointer shadow-xs"
                title="Recargar todas las tablas desde Supabase"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Recargar Supabase</span>
              </button>
            </div>
          </div>

          {/* Notification inside tab: Empty database status */}
          {employees.length === 0 && relations.length === 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-emerald-950">Base de Datos Supabase Lista y Vacía</span>
                  <span className="text-emerald-800">
                    Las tablas en PostgreSQL no contienen registros aún. Puedes inicializar los datos base o crear registros nuevos desde este panel.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleMigrate}
                disabled={isMigrating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Inicializando...' : 'Inicializar Datos Base en Supabase'}</span>
              </button>
            </div>
          )}

          {/* Diagnostic & Real-Time Sync Inspector Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Diagnóstico &amp; Persistencia en Supabase</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSupabaseConfigured() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isSupabaseConfigured() ? '🟢 Conectado' : '⚪ Offline'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifica cuántos registros existen realmente en la base de datos de tu proyecto Supabase ({extractProjectRef(supabaseUrlInput)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runDiagnostics}
                  disabled={isLoadingDiagnostics}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingDiagnostics ? 'animate-spin' : ''}`} />
                  <span>{isLoadingDiagnostics ? 'Analizando...' : 'Refrescar Conteo'}</span>
                </button>
              </div>
            </div>

            {/* Live Database Stats Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-50/20 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    Tabla: employees
                  </span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-950 font-mono-numbers mt-2">
                  {diagnostics ? diagnostics.employeesCount : '—'} <span className="text-xs font-normal text-slate-500">en Supabase</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Registros cargados: <strong>{employees.length}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-50/20 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Tabla: trip_relations
                  </span>
                  <FolderPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-950 font-mono-numbers mt-2">
                  {diagnostics ? diagnostics.relationsCount : '—'} <span className="text-xs font-normal text-slate-500">en Supabase</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Registros cargados: <strong>{relations.length}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-50/20 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Tabla: expenses
                  </span>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-950 font-mono-numbers mt-2">
                  {diagnostics ? diagnostics.expensesCount : '—'} <span className="text-xs font-normal text-slate-500">en Supabase</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Registros cargados: <strong>{expenses.length}</strong>
                </div>
              </div>
            </div>

            {/* Quick Sync & Migration Buttons */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Inicialización y Persistencia en Supabase</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inserta o actualiza directamente las tablas PostgreSQL en Supabase con los datos base de viáticos en Bolívares (VES), o recarga los registros vigentes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className={`w-4 h-4 ${isMigrating ? 'animate-bounce' : ''}`} />
                    <span>{isMigrating ? 'Sembrando en Supabase...' : 'Sembrar / Inicializar Datos en Supabase'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      await onLoadFromSupabase();
                      await runDiagnostics();
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4 text-blue-600" />
                    <span>Recargar desde Supabase</span>
                  </button>
                </div>
              </div>

              {migrationResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  migrationResult.success
                    ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100/80 text-rose-900 border border-rose-300'
                }`}>
                  {migrationResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{migrationResult.message}</span>
                </div>
              )}
            </div>

            {/* Danger Zone: Limpieza de Base de Datos */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Limpieza Total: Dejar Solo Administrador</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Elimina todos los datos de las tablas de Supabase (colaboradores, relaciones y gastos). Deja únicamente activo al usuario administrador con la clave <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">admindc2026*</code>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearDatabase}
                  disabled={isClearing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Trash2 className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
                  <span>{isClearing ? 'Eliminando registros...' : 'Limpiar y Vaciar Todas las Tablas'}</span>
                </button>
              </div>

              {clearResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  clearResult.success
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}>
                  {clearResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{clearResult.message}</span>
                </div>
              )}
            </div>

            {/* 3 Step Interactive Workflow Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <span className="font-extrabold text-blue-950 text-sm">Tus Credenciales</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ya están configuradas para tu proyecto <strong>qwivjixoziyliggczocf</strong>. El sistema remueve automáticamente <code className="text-blue-700 bg-blue-100 px-1 rounded">/rest/v1/</code> para que el cliente JavaScript funcione al 100%.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <span className="font-extrabold text-amber-950 text-sm">Ejecuta el Script SQL</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  En Supabase, haz clic en <strong>SQL Editor</strong>, presiona abajo <strong>&quot;Copiar SQL Completo&quot;</strong>, pégalo en el editor y haz clic en <strong>RUN</strong> para crear las tablas <code className="text-amber-800 bg-amber-100 px-1 rounded">employees</code>, <code className="text-amber-800 bg-amber-100 px-1 rounded">trip_relations</code> y <code className="text-amber-800 bg-amber-100 px-1 rounded">expenses</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <span className="font-extrabold text-emerald-950 text-sm">Persistencia en Vivo</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pulsa <strong>&quot;Subir Datos Locales a Supabase&quot;</strong> para guardar tus registros demo iniciales en la nube. Desde ese momento, cada nuevo colaborador, viaje y gasto se graba directamente en PostgreSQL.
                </p>
              </div>
            </div>

            {/* Form to set credentials directly in UI */}
            <form onSubmit={handleSaveSupabaseConfig} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Configuración de Conexión</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Puedes actualizar las credenciales de tu proyecto en cualquier momento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Probar Conexión en Vivo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Project URL (Base URL sin /rest/v1):
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={e => {
                      setSupabaseUrlInput(e.target.value);
                      setTestStatus('idle');
                      setTestMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                  {supabaseUrlInput.includes('/rest/v1') && (
                    <span className="text-[10px] text-amber-600 mt-1 block">
                      Nota: Se removerá &quot;/rest/v1&quot; automáticamente para conectar con la API de Supabase.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Anon Public Key:
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={e => {
                      setSupabaseKeyInput(e.target.value);
                      setTestStatus('idle');
                      setTestMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Test result status banner */}
              {testMessage && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : testStatus === 'testing'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {testStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : testStatus === 'testing' ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">
                    <span className="font-bold block">
                      {testStatus === 'success' ? 'Verificación Satisfactoria' : testStatus === 'testing' ? 'Verificando...' : 'Atención al Conectar'}
                    </span>
                    <span>{testMessage}</span>
                  </div>
                </div>
              )}

              {savedDbAlert && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Credenciales guardadas y optimizadas con éxito.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Credenciales</span>
                </button>
              </div>
            </form>

            {/* SQL Script Viewer */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Script de Creación SQL para Supabase (PostgreSQL):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Crea automáticamente las tablas de colaboradores con tokens, asignaciones de viáticos y comprobantes en Bolívares (VES).
                  </span>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡Copiado al portapapeles!' : 'Copiar SQL Completo'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {sqlSample}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Colaborador */}
      <CreateEmployeeModal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setIsCreateEmployeeModalOpen(false)}
        onSave={onCreateEmployee}
      />

      {/* Modal de Confirmación Segura para Eliminar Relación */}
      {relationToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden animate-scale-up">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ¿Eliminar Relación de Viáticos?
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Acción irreversible con validación de seguridad
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Código de Relación:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {relationToDelete.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destino / Título:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {relationToDelete.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Colaborador:</span>
                  <span className="font-bold text-slate-800">
                    {relationToDelete.employeeName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fondo Asignado:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Bs. {relationToDelete.allocatedBudget.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-rose-700 font-semibold">Comprobantes asociados:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {expenses.filter(e => e.relationId === relationToDelete.id).length} facturas
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para evitar borrar por error, escribe el código de la relación <code className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold rounded">{relationToDelete.code}</code> o la palabra <code className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold rounded">ELIMINAR</code> a continuación:
                </p>
                <input
                  type="text"
                  value={deleteConfirmationCode}
                  onChange={e => {
                    setDeleteConfirmationCode(e.target.value);
                    if (relationDeleteError) setRelationDeleteError(null);
                  }}
                  placeholder={`Escribe ${relationToDelete.code} o ELIMINAR`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono tracking-wider focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-400 placeholder:font-sans"
                  autoFocus
                />
              </div>

              {relationDeleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{relationDeleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRelationToDelete(null);
                    setDeleteConfirmationCode('');
                    setRelationDeleteError(null);
                  }}
                  disabled={isDeletingRelation}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteRelation}
                  disabled={
                    (deleteConfirmationCode.trim() !== relationToDelete.code &&
                      deleteConfirmationCode.trim().toUpperCase() !== 'ELIMINAR') ||
                    isDeletingRelation
                  }
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isDeletingRelation ? 'animate-spin' : ''}`} />
                  <span>{isDeletingRelation ? 'Eliminando...' : 'Eliminar Permanentemente'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
