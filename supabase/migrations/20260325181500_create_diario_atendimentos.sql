CREATE TABLE IF NOT EXISTS public.diario_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  paciente_nome TEXT NOT NULL,
  valor_consulta NUMERIC DEFAULT 0,
  valor_procedimento NUMERIC DEFAULT 0,
  forma_pagamento TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.diario_atendimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users full access on diario_atendimentos" ON public.diario_atendimentos;
CREATE POLICY "Allow authenticated users full access on diario_atendimentos" 
  ON public.diario_atendimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
