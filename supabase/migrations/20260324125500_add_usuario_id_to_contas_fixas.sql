ALTER TABLE public.contas_fixas 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF first_user_id IS NOT NULL THEN
    UPDATE public.contas_fixas SET usuario_id = first_user_id WHERE usuario_id IS NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Allow authenticated access" ON public.contas_fixas;
DROP POLICY IF EXISTS "Users can manage their own contas_fixas" ON public.contas_fixas;

CREATE POLICY "Users can manage their own contas_fixas" ON public.contas_fixas
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
