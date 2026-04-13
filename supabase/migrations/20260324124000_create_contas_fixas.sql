CREATE TABLE IF NOT EXISTS public.contas_fixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Vencido')) DEFAULT 'Pendente',
  categoria TEXT,
  frequencia TEXT CHECK (frequencia IN ('Mensal', 'Bimestral', 'Trimestral', 'Anual', 'Única')) DEFAULT 'Mensal',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contas_fixas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access" ON public.contas_fixas;
CREATE POLICY "Allow authenticated access" ON public.contas_fixas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contas_fixas_data_vencimento ON public.contas_fixas (data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_status ON public.contas_fixas (status);
