ALTER TABLE public.lembretes_contas ADD COLUMN IF NOT EXISTS conta_fixa_id UUID REFERENCES public.contas_fixas(id) ON DELETE CASCADE;
ALTER TABLE public.lembretes_contas ADD COLUMN IF NOT EXISTS tipo_lembrete TEXT CHECK (tipo_lembrete IN ('email', 'push', 'ambos'));
ALTER TABLE public.lembretes_contas ADD COLUMN IF NOT EXISTS data_envio TIMESTAMPTZ;
ALTER TABLE public.lembretes_contas ADD COLUMN IF NOT EXISTS enviado BOOLEAN DEFAULT false;
ALTER TABLE public.lembretes_contas ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.lembretes_contas SET conta_fixa_id = conta_id WHERE conta_fixa_id IS NULL AND conta_id IS NOT NULL;

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF first_user_id IS NOT NULL THEN
    UPDATE public.lembretes_contas SET usuario_id = first_user_id WHERE usuario_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.lembretes_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access" ON public.lembretes_contas;
DROP POLICY IF EXISTS "Users can manage their own lembretes_contas" ON public.lembretes_contas;

CREATE POLICY "Users can manage their own lembretes_contas" ON public.lembretes_contas
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
