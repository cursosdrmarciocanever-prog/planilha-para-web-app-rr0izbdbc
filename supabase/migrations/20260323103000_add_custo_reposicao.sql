-- Add custo_reposicao to medicamentos_precificacao to track market value vs inventory value
ALTER TABLE public.medicamentos_precificacao 
ADD COLUMN IF NOT EXISTS custo_reposicao NUMERIC NOT NULL DEFAULT 0;

-- Backfill existing rows to have custo_reposicao = custo_aquisicao
UPDATE public.medicamentos_precificacao 
SET custo_reposicao = custo_aquisicao 
WHERE custo_reposicao = 0;
