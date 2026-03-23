-- Create procedimentos_taxa table
CREATE TABLE IF NOT EXISTS public.procedimentos_taxa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    valor_cobrado NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop policy if exists
DROP POLICY IF EXISTS "Allow authenticated access" ON public.procedimentos_taxa;

-- Create policy
CREATE POLICY "Allow authenticated access" ON public.procedimentos_taxa
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial data
INSERT INTO public.procedimentos_taxa (id, nome, duracao_minutos, valor_cobrado)
VALUES 
    (gen_random_uuid(), 'Consulta', 30, 350.00),
    (gen_random_uuid(), 'Retorno', 20, 200.00),
    (gen_random_uuid(), 'Avaliação', 60, 500.00)
ON CONFLICT DO NOTHING;
