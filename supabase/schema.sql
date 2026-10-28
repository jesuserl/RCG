-- ==============================================================================
-- VIÁTICOSPRO - ESQUEMA DE BASE DE DATOS POSTGRESQL PARA SUPABASE (SOLO VES)
-- ==============================================================================

-- 1. Tabla de Empleados / Perfiles
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Relaciones de Viáticos (Asignaciones creadas por Finanzas en VES)
CREATE TABLE IF NOT EXISTS public.trip_relations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    allocated_budget_ves NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'submitted' | 'settled'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Gastos y Comprobantes (en VES)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    relation_id TEXT NOT NULL REFERENCES public.trip_relations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL, -- 'Hospedaje' | 'Alimentación' | 'Transporte' | 'Combustible' | 'Otros'
    concept TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL, -- Monto en Bolívares (VES / Bs.)
    employee_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    receipt_url TEXT,
    receipt_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    finance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_trip_relations_employee ON public.trip_relations(employee_name);
CREATE INDEX IF NOT EXISTS idx_trip_relations_status ON public.trip_relations(status);
CREATE INDEX IF NOT EXISTS idx_expenses_relation_id ON public.expenses(relation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público lectura/escritura empleados" ON public.employees
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público lectura/escritura relaciones" ON public.trip_relations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público lectura/escritura gastos" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Datos Iniciales de Demostración (en Bolívares Bs.)
INSERT INTO public.employees (id, name, department, position) VALUES
    ('emp-01', 'Jesús R. López', 'Operaciones e Ingeniería', 'Ingeniero de Proyectos Senior'),
    ('emp-02', 'Mariana Rondón', 'Comercial y Ventas', 'Líder de Cuentas Corporativas'),
    ('emp-03', 'Carlos Mendoza', 'Tecnología e Infraestructura', 'Especialista en Sistemas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trip_relations (id, code, title, destination, employee_name, allocated_budget_ves, start_date, end_date, status, admin_notes) VALUES
    ('rel-valencia-001', 'REL-2026-001', 'Auditoría Planta Valencia - Q4', 'Valencia, Carabobo', 'Jesús R. López', 24000.00, '2026-10-24', '2026-10-29', 'open', 'Viáticos autorizados en Bolívares para inspección técnica en planta. Hospedaje y traslado incluidos.'),
    ('rel-barquisimeto-002', 'REL-2026-002', 'Gira Comercial Clientes Barquisimeto', 'Barquisimeto, Lara', 'Mariana Rondón', 17500.00, '2026-10-20', '2026-10-23', 'submitted', 'Reunión de renovación de contratos anuales. Gastos de alimentación y combustible.'),
    ('rel-maracaibo-003', 'REL-2026-003', 'Mantenimiento Preventivo Data Center', 'Maracaibo, Zulia', 'Carlos Mendoza', 32000.00, '2026-10-10', '2026-10-14', 'settled', 'Intervención de emergencia en racks de comunicaciones. Liquidado conforme.')
ON CONFLICT (id) DO NOTHING;
