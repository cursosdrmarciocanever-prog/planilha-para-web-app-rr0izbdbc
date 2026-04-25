DO $$
BEGIN
  ALTER TABLE public.lancamentos_pacientes 
    ADD COLUMN IF NOT EXISTS categoria TEXT,
    ADD COLUMN IF NOT EXISTS numero_orcamento TEXT,
    ADD COLUMN IF NOT EXISTS profissional_orcamento TEXT,
    ADD COLUMN IF NOT EXISTS colaborador_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS documento_maquina TEXT,
    ADD COLUMN IF NOT EXISTS nota_fiscal TEXT;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;
