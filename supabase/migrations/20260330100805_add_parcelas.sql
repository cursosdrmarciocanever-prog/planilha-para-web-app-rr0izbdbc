ALTER TABLE public.diario_atendimentos ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT NULL;
ALTER TABLE public.lancamentos_pacientes ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT NULL;
