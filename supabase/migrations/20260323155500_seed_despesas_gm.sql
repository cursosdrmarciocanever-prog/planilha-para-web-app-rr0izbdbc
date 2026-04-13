DO $$ 
BEGIN
  -- 1. Aluguel da sala
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao ILIKE '%aluguel%') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Aluguel da sala', 8336.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 2. Água, luz e internet
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Água, luz e internet' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Água, luz e internet', 1550.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 3. Salários e benefícios
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Salários e benefícios' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Salários e benefícios', 10298.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 4. Licenças, taxas e condomínio
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Licenças, taxas e condomínio' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Licenças, taxas e condomínio', 2259.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 5. Contabilidade
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Contabilidade' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Contabilidade', 3730.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 6. Sistema de gestão
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Sistema de gestão' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Sistema de gestão', 547.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;

  -- 7. Financiamento
  IF NOT EXISTS (SELECT 1 FROM public.despesas WHERE descricao = 'Financiamento' AND data_vencimento = '2026-03-01') THEN
    INSERT INTO public.despesas (descricao, valor, categoria, data_vencimento, status)
    VALUES ('Financiamento', 17172.00, 'Fixas', '2026-03-01', 'operacional');
  END IF;
END $$;
