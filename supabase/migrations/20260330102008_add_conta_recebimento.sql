ALTER TABLE public.diario_atendimentos ADD COLUMN IF NOT EXISTS conta_recebimento TEXT DEFAULT 'Carnê Leão / Unicred';
ALTER TABLE public.lancamentos_pacientes ADD COLUMN IF NOT EXISTS conta_recebimento TEXT DEFAULT 'Carnê Leão / Unicred';
