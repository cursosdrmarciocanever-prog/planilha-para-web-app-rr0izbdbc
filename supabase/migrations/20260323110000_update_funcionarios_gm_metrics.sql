-- Add new columns to the funcionarios table to support GM Metrics methodology
ALTER TABLE public.funcionarios 
ADD COLUMN IF NOT EXISTS horas_mensais NUMERIC DEFAULT 220,
ADD COLUMN IF NOT EXISTS encargos_percentual NUMERIC DEFAULT 47.44,
ADD COLUMN IF NOT EXISTS beneficios_mensais NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS setor TEXT DEFAULT 'Geral',
ADD COLUMN IF NOT EXISTS receita_gerada NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_receita NUMERIC DEFAULT 0;
