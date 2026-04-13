CREATE TABLE IF NOT EXISTS public.medicamentos_precificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  custo_aquisicao NUMERIC NOT NULL DEFAULT 0,
  margem_lucro NUMERIC NOT NULL DEFAULT 0,
  impostos NUMERIC NOT NULL DEFAULT 0,
  preco_venda_sugerido NUMERIC NOT NULL DEFAULT 0,
  preco_venda_final NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicamentos_precificacao ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users access to medicamentos_precificacao" 
  ON public.medicamentos_precificacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
