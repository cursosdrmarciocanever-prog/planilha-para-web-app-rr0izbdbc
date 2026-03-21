-- Create the funcionarios table for Custo de Funcionários
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  salario_base NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "Allow authenticated full access on funcionarios" ON public.funcionarios;
CREATE POLICY "Allow authenticated full access on funcionarios" ON public.funcionarios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
