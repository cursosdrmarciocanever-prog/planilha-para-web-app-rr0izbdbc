CREATE TABLE IF NOT EXISTS public.subcategorias_despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS subcategoria TEXT;
ALTER TABLE public.contas_fixas ADD COLUMN IF NOT EXISTS subcategoria TEXT;

ALTER TABLE public.subcategorias_despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own subcategories" ON public.subcategorias_despesas;
CREATE POLICY "Users can manage their own subcategories" ON public.subcategorias_despesas
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
