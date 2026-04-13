CREATE TABLE IF NOT EXISTS public.lancamentos_pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_atendimento DATE DEFAULT CURRENT_DATE,
  nome_paciente TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('Consulta', 'Procedimento')),
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.lancamentos_pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access on lancamentos_pacientes" ON public.lancamentos_pacientes;
CREATE POLICY "Allow authenticated access on lancamentos_pacientes"
  ON public.lancamentos_pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
