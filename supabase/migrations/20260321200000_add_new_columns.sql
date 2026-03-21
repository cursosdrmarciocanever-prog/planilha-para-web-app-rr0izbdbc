-- Add new columns for the new features requested
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.produtos_servicos ADD COLUMN IF NOT EXISTS custo_estimado NUMERIC DEFAULT 0;

-- Drop and recreate the policy for produtos_servicos to ensure accessibility
DROP POLICY IF EXISTS "Allow authenticated users full access on produtos_servicos" ON public.produtos_servicos;
CREATE POLICY "Allow authenticated users full access on produtos_servicos" ON public.produtos_servicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
