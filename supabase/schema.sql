-- ==============================================================================
-- VIÁTICOSPRO - ESQUEMA DE BASE DE DATOS POSTGRESQL PARA SUPABASE
-- ==============================================================================
-- Copia y pega este script en el "SQL Editor" de tu proyecto en Supabase
-- para inicializar las tablas, relaciones, índices y políticas de seguridad.
-- ==============================================================================

-- 1. Tabla de Empleados / Perfiles
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Relaciones de Viáticos (Asignaciones creadas por Finanzas)
CREATE TABLE IF NOT EXISTS public.trip_relations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    allocated_budget_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    bcv_rate_at_creation NUMERIC(10, 2) NOT NULL DEFAULT 52.85,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'submitted' | 'settled'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Gastos y Comprobantes
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    relation_id TEXT NOT NULL REFERENCES public.trip_relations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL, -- 'Hospedaje' | 'Alimentación' | 'Transporte' | 'Combustible' | 'Otros'
    concept TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD', -- 'USD' | 'VES'
    bcv_rate NUMERIC(10, 2) NOT NULL DEFAULT 52.85,
    amount_usd NUMERIC(12, 2) NOT NULL,
    amount_ves NUMERIC(12, 2) NOT NULL,
    employee_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    receipt_url TEXT, -- URL pública de Supabase Storage o Data URL Base64
    receipt_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    finance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Parámetros Globales (ej. Tasa oficial BCV)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_trip_relations_employee ON public.trip_relations(employee_name);
CREATE INDEX IF NOT EXISTS idx_trip_relations_status ON public.trip_relations(status);
CREATE INDEX IF NOT EXISTS idx_expenses_relation_id ON public.expenses(relation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Acceso para cliente público/anon
-- (Ajustables según requieras autenticación de Supabase Auth o acceso por token)
CREATE POLICY "Acceso público lectura/escritura empleados" ON public.employees
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público lectura/escritura relaciones" ON public.trip_relations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público lectura/escritura gastos" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público lectura/escritura configuración" ON public.app_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 8. Datos Iniciales de Prueba
INSERT INTO public.employees (id, name, department, position) VALUES
    ('emp-01', 'Jesús R. López', 'Operaciones e Ingeniería', 'Ingeniero de Proyectos Senior'),
    ('emp-02', 'Mariana Rondón', 'Comercial y Ventas', 'Líder de Cuentas Corporativas'),
    ('emp-03', 'Carlos Mendoza', 'Tecnología e Infraestructura', 'Especialista en Sistemas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trip_relations (id, code, title, destination, employee_name, allocated_budget_usd, currency, bcv_rate_at_creation, start_date, end_date, status, admin_notes) VALUES
    ('rel-valencia-001', 'REL-2026-001', 'Auditoría Planta Valencia - Q4', 'Valencia, Carabobo', 'Jesús R. López', 450.00, 'USD', 52.85, '2026-10-24', '2026-10-29', 'open', 'Viáticos autorizados para inspección técnica en planta. Hospedaje y traslado incluidos.'),
    ('rel-barquisimeto-002', 'REL-2026-002', 'Gira Comercial Clientes Barquisimeto', 'Barquisimeto, Lara', 'Mariana Rondón', 320.00, 'USD', 52.85, '2026-10-20', '2026-10-23', 'submitted', 'Reunión de renovación de contratos anuales. Gastos de alimentación y combustible.'),
    ('rel-maracaibo-003', 'REL-2026-003', 'Mantenimiento Preventivo Data Center', 'Maracaibo, Zulia', 'Carlos Mendoza', 600.00, 'USD', 52.85, '2026-10-10', '2026-10-14', 'settled', 'Intervención de emergencia en racks de comunicaciones. Liquidado conforme.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_settings (key, value) VALUES
    ('bcv_rate', '{"rate": 52.85}'::jsonb)
ON CONFLICT (key) DO NOTHING;
