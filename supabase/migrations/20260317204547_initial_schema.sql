-- Enums
CREATE TYPE public.tipo_transacao AS ENUM ('entrada', 'saída');
CREATE TYPE public.tipo_despesa AS ENUM ('fixa', 'variável');

-- Table: usuarios
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: pacientes
CREATE TABLE public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    email TEXT,
    data_nascimento DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: produtos_servicos
CREATE TABLE public.produtos_servicos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    descricao TEXT,
    custo NUMERIC(10,2) DEFAULT 0,
    preco_venda NUMERIC(10,2) DEFAULT 0,
    categoria TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: transacoes
CREATE TABLE public.transacoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tipo public.tipo_transacao NOT NULL,
    descricao TEXT,
    valor NUMERIC(10,2) NOT NULL,
    data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    produto_id BIGINT REFERENCES public.produtos_servicos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: despesas
CREATE TABLE public.despesas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tipo public.tipo_despesa NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data DATE NOT NULL,
    categoria TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: registros_diarios
CREATE TABLE public.registros_diarios (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    data DATE UNIQUE NOT NULL,
    faturamento_total NUMERIC(10,2) DEFAULT 0,
    total_consultas INTEGER DEFAULT 0,
    total_servicos INTEGER DEFAULT 0,
    bilheteria NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_diarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- usuarios
CREATE POLICY "Allow authenticated users full access" ON public.usuarios 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pacientes
CREATE POLICY "Allow authenticated users full access" ON public.pacientes 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- produtos_servicos
CREATE POLICY "Allow authenticated users full access" ON public.produtos_servicos 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- transacoes
CREATE POLICY "Allow authenticated users full access" ON public.transacoes 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- despesas
CREATE POLICY "Allow authenticated users full access" ON public.despesas 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- registros_diarios
CREATE POLICY "Allow authenticated users full access" ON public.registros_diarios 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
