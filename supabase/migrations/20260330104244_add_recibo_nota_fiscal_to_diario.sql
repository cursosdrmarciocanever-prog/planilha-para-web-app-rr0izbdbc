ALTER TABLE public.diario_atendimentos ADD COLUMN IF NOT EXISTS recibo TEXT;
ALTER TABLE public.diario_atendimentos ADD COLUMN IF NOT EXISTS nota_fiscal TEXT;
