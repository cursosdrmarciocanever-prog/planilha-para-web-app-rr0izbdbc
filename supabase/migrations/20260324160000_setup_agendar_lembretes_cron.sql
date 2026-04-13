-- Criação da tabela de logs de automação
CREATE TABLE IF NOT EXISTS public.logs_automacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  funcao TEXT NOT NULL,
  status TEXT NOT NULL,
  mensagem_erro TEXT
);

-- Políticas RLS
ALTER TABLE public.logs_automacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access on logs_automacao" ON public.logs_automacao;
CREATE POLICY "Allow authenticated read access on logs_automacao" ON public.logs_automacao
  FOR SELECT TO authenticated USING (true);

-- Configuração do cron job usando pg_cron para rodar diariamente às 08:00 AM
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    -- Remove o agendamento anterior se existir para evitar duplicações
    BEGIN
      PERFORM cron.unschedule('agendar_lembretes_automaticos_job');
    EXCEPTION WHEN OTHERS THEN
      -- ignora erro se o job não existir
    END;
    
    -- Cria o agendamento para 08:00 AM todos os dias
    PERFORM cron.schedule(
      'agendar_lembretes_automaticos_job',
      '0 8 * * *',
      'SELECT net.http_post(
          url:=''https://bpnkltqdhoyufzjkmcsd.supabase.co/functions/v1/agendar_lembretes_automaticos'',
          headers:=''{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbmtsdHFkaG95dWZ6amttY3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDQ4OTksImV4cCI6MjA4OTI4MDg5OX0.62vTS6BuXKsngiNHavQbaBfueLzrfP6KhKUkii5_TIQ"}''::jsonb
      )'
    );
  END IF;
END $$;
