DO $DO$
BEGIN
  -- Verifica se as extensões necessárias para agendamento (cron) e requisições web (net) estão instaladas
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    
    -- Desagenda caso já exista para evitar duplicação
    PERFORM cron.unschedule('verificar_contas_diario');
    
    -- Agenda para rodar diariamente à meia-noite (00:00)
    PERFORM cron.schedule(
      'verificar_contas_diario',
      '0 0 * * *',
      $$
      SELECT net.http_post(
          url:='https://bpnkltqdhoyufzjkmcsd.supabase.co/functions/v1/verificar_contas_vencidas',
          headers:='{"Content-Type": "application/json"}'::jsonb,
          body:='{}'::jsonb
      );
      $$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignora silenciosamente se o usuário não tiver permissões ou se o cron não for suportado no ambiente atual
  RAISE NOTICE 'Não foi possível configurar o cron schedule: %', SQLERRM;
END $DO$;
