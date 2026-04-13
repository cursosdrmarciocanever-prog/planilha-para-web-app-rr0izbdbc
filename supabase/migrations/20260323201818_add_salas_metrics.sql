DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salas' AND column_name='horas_mes') THEN
    ALTER TABLE public.salas ADD COLUMN horas_mes numeric DEFAULT 220;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salas' AND column_name='dias_mes') THEN
    ALTER TABLE public.salas ADD COLUMN dias_mes numeric DEFAULT 22;
  END IF;

  -- Seed initial sala if not exists to match GM Metrics testing
  IF NOT EXISTS (SELECT 1 FROM public.salas WHERE nome = 'Sala Dr Marcio' OR nome ilike '%marcio%') THEN
    INSERT INTO public.salas (id, nome, horas_mes, dias_mes, taxa_hora, taxa_dia)
    VALUES (gen_random_uuid(), 'Sala Dr Marcio', 220, 22, 199.51, 1995.09);
  END IF;
END $$;
