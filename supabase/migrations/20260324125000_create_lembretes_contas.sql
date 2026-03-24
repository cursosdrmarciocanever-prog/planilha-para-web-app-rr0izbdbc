CREATE TABLE IF NOT EXISTS public.lembretes_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.contas_fixas(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('vencida', 'proxima')),
  lido BOOLEAN DEFAULT false,
  notificado BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lembretes_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access" ON public.lembretes_contas;
CREATE POLICY "Allow authenticated access" ON public.lembretes_contas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lembretes_contas_notificado ON public.lembretes_contas (notificado);
CREATE INDEX IF NOT EXISTS idx_lembretes_contas_conta_id ON public.lembretes_contas (conta_id);

-- Para agendar a rotina diária no cron (se as extensões pg_cron e pg_net estiverem ativas):
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
--     PERFORM cron.unschedule('verificar_contas_diario');
--     PERFORM cron.schedule(
--       'verificar_contas_diario',
--       '0 0 * * *',
--       'SELECT net.http_post(url:=''https://bpnkltqdhoyufzjkmcsd.supabase.co/functions/v1/verificar_contas_vencidas'', headers:=''{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}''::jsonb)'
--     );
--   END IF;
-- END $$;
