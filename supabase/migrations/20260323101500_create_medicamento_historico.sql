CREATE TABLE IF NOT EXISTS public.medicamento_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicamento_id UUID REFERENCES public.medicamentos_precificacao(id) ON DELETE CASCADE,
  custo_aquisicao NUMERIC NOT NULL,
  preco_venda_final NUMERIC NOT NULL,
  margem_lucro NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicamento_historico ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow authenticated access to medicamento_historico" ON public.medicamento_historico;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Allow authenticated access to medicamento_historico" 
ON public.medicamento_historico FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_medicamento_historico()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (
    TG_OP = 'UPDATE' AND (
      NEW.custo_aquisicao IS DISTINCT FROM OLD.custo_aquisicao OR
      NEW.preco_venda_final IS DISTINCT FROM OLD.preco_venda_final OR
      NEW.margem_lucro IS DISTINCT FROM OLD.margem_lucro
    )
  ) THEN
    INSERT INTO public.medicamento_historico (medicamento_id, custo_aquisicao, preco_venda_final, margem_lucro)
    VALUES (NEW.id, NEW.custo_aquisicao, NEW.preco_venda_final, NEW.margem_lucro);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_medicamento_change ON public.medicamentos_precificacao;
CREATE TRIGGER on_medicamento_change
  AFTER INSERT OR UPDATE ON public.medicamentos_precificacao
  FOR EACH ROW EXECUTE FUNCTION public.log_medicamento_historico();
